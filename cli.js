#!/usr/bin/env node

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

const yargs = require("yargs/yargs");
const ipt = require("ipt");
const out = require("simple-output");
const readPkg = require("read-package-json-fast");
const writePkg = require("write-pkg");
const Cache = require("lru-cache-fs");
const onExit = require("signal-exit");

let editTask = () => null;

const getMainArgs = () => {
	let i = -1;
	const result = [];
	const mainArgs = process.argv.slice(2);
	while (++i < mainArgs.length) {
		if (mainArgs[i] === "--") break;
		result.push(mainArgs[i]);
	}
	return result;
};

const getCwdPackage = async () => {
	try {
		const res = await readPkg(pkgJsonFilename);
		return res;
	} catch (e) {
		error(
			e,
			e.code === "EJSONPARSE"
				? "package.json contains malformed JSON"
				: "No package.json found"
		);
	}
};

const error = (e, msg) => {
	out.error(msg);
	if (argv.debug) {
		throw e;
	}
	process.exit(1);
};

// Set ps name
process.title = "ntl";

// Exits program execution on ESC
process.stdin.on("keypress", (ch, key) => {
	if (!key || !key.name) return;

	switch (key.name) {
		case "escape":
			return process.exit(0);
		case "e":
			return editTask();
	}
});

const sep = os.EOL;
const defaultRunner = "npm";
const { argv } = yargs(getMainArgs())
	.usage(
		"Usage:\n  ntl [<path>]             Build an interactive interface and run any script"
	)
	.usage("  nt [<path>]              Rerun last executed script")
	.alias("a", "all")
	.describe("a", "Includes pre and post scripts on the list")
	.alias("A", "autocomplete")
	.describe("A", "Starts in autocomplete mode")
	.alias("D", "debug")
	.describe("D", "Prints to stderr any internal error")
	.alias("d", "descriptions")
	.describe("d", "Displays the descriptions of each script")
	.alias("o", "descriptions-only")
	.describe("o", "Limits output to scripts with a description")
	.help("h")
	.alias("h", "help")
	.describe("h", "Shows this help message")
	.alias("i", "info")
	.describe("i", "Displays the contents of each script")
	.alias("e", "exclude")
	.describe("e", "Excludes specific scripts")
	.alias("m", "multiple")
	.describe("m", "Allows the selection of multiple items")
	.alias("O", "ordered")
	.describe("O", "Selects multiple items in order")
	.alias("s", "size")
	.describe("s", "Amount of lines to display at once")
	.alias("v", "version")
	.describe("rerun", "Repeat last executed script")
	.alias("r", "rerun")
	.boolean([
		"a",
		"A",
		"D",
		"d",
		"o",
		"h",
		"i",
		"m",
		"O",
		"v",
		"r",
		"rerun-cache",
	])
	.number(["s"])
	.array(["e"])
	.string(["rerun-cache-dir", "rerun-cache-name"])
	.describe("rerun-cache-dir", "Defines the rerun task cache location")
	.describe("rerun-cache-name", "Defines the rerun task cache filename")
	.describe("no-rerun-cache", "Never write to or read from cache")
	.epilog("Visit https://github.com/ruyadorno/ntl for more info");

let cache;
const cwd = argv._[0] ? path.resolve(process.cwd(), argv._[0]) : process.cwd();
const {
	autocomplete,
	multiple,
	ordered,
	rerunCache,
	rerun,
	rerunCacheDir,
	rerunCacheName,
	size,
} = argv;
const pkgJsonFilename = path.resolve(cwd, "package.json");
const tmpFilename = path.resolve(cwd, ".ntl-tmp-bkp-package.json");

// exit handler, makes sure to put package.json
// back in place in case it's running a tmp one
onExit((code, signal) => {
	try {
		fs.statSync(tmpFilename);
		fs.unlinkSync(pkgJsonFilename);
		fs.renameSync(tmpFilename, pkgJsonFilename);
	} catch (err) {
		if (err.code !== "ENOENT") {
			error(err, "Error cleaning up ntl tmp files");
		}
	}
});

(async () => {
	const pkgJsonContent = (await getCwdPackage()) || {};
	const { ntl, scripts } = pkgJsonContent;
	const runner = (ntl && ntl.runner) || process.env.NTL_RUNNER || defaultRunner;
	const { descriptions = {} } = ntl || {};
	const scriptKeys = Object.keys(scripts || {});
	const noScriptsFound = !scripts || scriptKeys.length < 1;
	const avoidCache = rerunCache === false || process.env.NTL_NO_RERUN_CACHE;
	const shouldRerun = !avoidCache && (rerun || process.env.NTL_RERUN);

	let editing = false;

	const getTrailingOptions = () => {
		let sepFound = false;
		return process.argv.slice(2).reduce((res, i) => {
			if (i === "--") {
				sepFound = true;
			}
			if (sepFound) {
				return `${res} ${i}`;
			}
			return res;
		}, "");
	};

	const retrieveCache = () => {
		if (avoidCache) {
			return;
		}

		if (!cache) {
			cache = new Cache({
				cacheName:
					rerunCacheName ||
					process.env.NTL_RERUN_CACHE_NAME ||
					"ntl-rerun-cache",
				cwd: rerunCacheDir || process.env.NTL_RERUN_CACHE_DIR,
				max: parseInt(process.env.NTL_RERUN_CACHE_MAX, 10) || 10,
			});
		}

		return cache;
	};

	const hasCachedTasks = () => {
		if (!shouldRerun) {
			return;
		}

		const runCachedTask = () => {
			let rerunCachedTasks;
			const warn = () => {
				out.warn("Unable to retrieve commands to rerun");
				return false;
			};

			try {
				rerunCachedTasks = retrieveCache().get(cacheKey(cwd));
			} catch (e) {
				return warn();
			}

			if (!rerunCachedTasks || !rerunCachedTasks.length) {
				return warn();
			}

			executeCommands(rerunCachedTasks);
			return true;
		};

		return runCachedTask();
	};

	const cacheKey = (str) => str.split("\\").join("/");

	const setCachedTasks = (keys) => {
		try {
			retrieveCache().set(cacheKey(cwd), keys);
			retrieveCache().fsDump();
		} catch (e) {
			if (argv.debug) console.warn(e);
		}
	};

	const getDefaultTask = () => {
		try {
			return retrieveCache().get(cacheKey(cwd)).join(sep);
		} catch (e) {
			return undefined;
		}
	};

	const exec = (name, trailingOptions = "") => {
		const cmd = `${runner} run "${name}"${trailingOptions}`;
		try {
			execSync(cmd, {
				cwd,
				stdio: [process.stdin, process.stdout, process.stderr],
			});
		} catch (err) {
			error(err, `Failed to run command:${os.EOL}  ${cmd}`);
		}
	};

	const executeCommands = (keys) => {
		keys.forEach((key) => {
			exec(key, getTrailingOptions());
		});
	};

	const executeTempCommand = (name, cmd) => {
		let renamed;
		try {
			fs.renameSync(pkgJsonFilename, tmpFilename);
			renamed = true;

			writePkg.sync(cwd, {
				...pkgJsonContent,
				scripts: {
					...scripts,
					[`${name}(1)`]: cmd,
				},
			});

			// exec won't throw so any errors here are only
			// relative to managing temp files
			exec(`${name}(1)`);

			fs.unlinkSync(pkgJsonFilename);
			fs.renameSync(tmpFilename, pkgJsonFilename);
		} catch (err) {
			// in case the package.json file was moved around prior
			// to the error, then try puttting it back to its place
			if (renamed) {
				try {
					fs.renameSync(tmpFilename, pkgJsonFilename);
				} catch (errr) {
					out.warn("Failed to move .ntl-tmp-bkp-package.json to package.json");
				}
			}
			error(err, "Error while managing ntl tmp files");
		}
	};

	const run = async () => {
		const descriptionsKeys = Object.keys(descriptions);
		const hasDescriptions =
			descriptionsKeys.length > 0 &&
			descriptionsKeys.some((key) => scripts[key]);
		const shouldWarnNoDescriptions = argv.descriptions && !hasDescriptions;
		if (shouldWarnNoDescriptions) {
			out.warn(`No descriptions for your ${runner} scripts found`);
		}

		const longestScriptName = scriptKeys.reduce(
			(acc, curr) => (curr.length > acc.length ? curr : acc),
			""
		).length;

		const getLongName = (name, message = "", pad) =>
			`${name.padStart(longestScriptName)} › ${message}`;

		// defines the items that will be printed to the user
		const input = scriptKeys
			.map((key) => ({
				name:
					argv.info || argv.descriptions
						? getLongName(
								key,
								argv.descriptions && descriptions[key]
									? descriptions[key]
									: scripts[key]
						  )
						: hasDescriptions
						? getLongName(key, descriptions[key])
						: key,
				value: key,
			}))
			.filter(
				// filter out prefixed scripts
				(item) =>
					argv.all
						? true
						: ["pre", "post"].every((prefix) => !item.value.startsWith(prefix))
			)
			.filter(
				// filter out scripts without a description if --descriptions-only option
				(item) => (argv.descriptionsOnly ? descriptions[item.value] : true)
			)
			.filter(
				// filter excluded scripts
				(item) =>
					!argv.exclude ||
					!argv.exclude.some((e) =>
						new RegExp(e + (e.includes("*") ? "" : "$"), "i").test(item.value)
					)
			);

		const message = `Select a task to run${
			runner !== defaultRunner ? ` (using ${runner})` : ""
		}:`;

		if (hasCachedTasks()) {
			return;
		}

		if (!input || input.length === 0) {
			return out.error("No tasks remained, maybe try less options?");
		}

		out.node("Node Task List");
		if (!multiple && !autocomplete) {
			out.hint("Press (E) to edit the current script or its arguments");
		}
		let prompt = {};

		if (!multiple && !autocomplete) {
			editTask = () => {
				editing = true;
				prompt.ui.rl.emit("line");
			};
		}
		// creates interactive interface using ipt
		let keys;
		try {
			keys = await ipt(
				input,
				{
					autocomplete,
					default: getDefaultTask(),
					"default-separator": sep,
					message,
					multiple,
					ordered,
					size,
				},
				prompt
			);
		} catch (err) {
			return error(err, "Error building interactive interface");
		}

		if (editing) {
			const [selected] = keys;
			const editedResult = await ipt([], {
				message: "Edit the script or its arguments",
				default: scripts[selected],
				input: true,
				unquoted: true,
			});

			const [cmd] = editedResult;
			return executeTempCommand(selected, cmd);
		}

		setCachedTasks(keys);
		executeCommands(keys);
	};

	if (noScriptsFound) {
		out.info(`No ${runner} scripts available in cwd`);
	} else {
		await run();
	}
})();
