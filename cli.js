#!/usr/bin/env node

"use strict";

const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

const yargs = require("yargs/yargs");
const ipt = require("ipt");
const out = require("simple-output");
const readPkg = require("read-pkg");
const Cache = require("lru-cache-fs");

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
	.boolean(["a", "A", "D", "d", "o", "h", "i", "m", "O", "v", "r", "no-rerun-cache"])
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
	noRerunCache,
	rerun,
	rerunCacheDir,
	rerunCacheName,
	size
} = argv;
const { ntl, scripts } = getCwdPackage() || {};
const runner = (ntl && ntl.runner) || process.env.NTL_RUNNER || defaultRunner;
const { descriptions = {} } = ntl || {};
const scriptKeys = Object.keys(scripts || {});
const noScriptsFound = !scripts || scriptKeys.length < 1;
const avoidCache = noRerunCache || process.env.NTL_NO_RERUN_CACHE;
const shouldRerun = !avoidCache && (rerun || process.env.NTL_RERUN);

// Exits program execution on ESC
process.stdin.on("keypress", (ch, key) => {
	if (key && key.name === "escape") {
		process.exit(0);
	}
});

function error(e, msg) {
	out.error(argv.debug ? e : msg);
	process.exit(1);
}

function getMainArgs() {
	let i = -1;
	const result = [];
	const mainArgs = process.argv.slice(2);
	while (++i < mainArgs.length) {
		if (mainArgs[i] === "--") break;
		result.push(mainArgs[i]);
	}
	return result;
}

function getTrailingOptions() {
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
}

function getCwdPackage() {
	try {
		return readPkg.sync({ cwd });
	} catch (e) {
		const [errorType] = Object.values(e);
		error(
			e,
			errorType === "JSONError"
				? "package.json contains malformed JSON"
				: "No package.json found"
		);
	}
}

function retrieveCache() {
	if (avoidCache) {
		return;
	}

	if (!cache) {
		cache = new Cache({
			cacheName:
				rerunCacheName || process.env.NTL_RERUN_CACHE_NAME || "ntl-rerun-cache",
			cwd: rerunCacheDir || process.env.NTL_RERUN_CACHE_DIR,
			max: parseInt(process.env.NTL_RERUN_CACHE_MAX, 10) || 10
		});
	}

	return cache;
}

function hasCachedTasks() {
	if (!shouldRerun) {
		return;
	}

	function runCachedTask() {
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
	}

	return runCachedTask();
}

function cacheKey(str) {
	return str.split("\\").join("/");
}

function setCachedTasks(keys) {
	try {
		retrieveCache().set(cacheKey(cwd), keys);
		retrieveCache().fsDump();
	} catch (e) {
		// should ignore rerun set cache errors
	}
}

function getDefaultTask() {
	try {
		return retrieveCache()
			.get(cacheKey(cwd))
			.join(sep);
	} catch (e) {
		return undefined;
	}
}

function executeCommands(keys) {
	keys.forEach(key => {
		execSync(`${runner} run ${key}${getTrailingOptions()}`, {
			cwd,
			stdio: [process.stdin, process.stdout, process.stderr]
		});
	});
}

function run() {
	const descriptionsKeys = Object.keys(descriptions);
	const hasDescriptions =
		descriptionsKeys.length > 0 && descriptionsKeys.some(key => scripts[key]);
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
		.map(key => ({
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
			value: key
		}))
		.filter(
			// filter out prefixed scripts
			item =>
				argv.all
					? true
					: ["pre", "post"].every(prefix => !item.value.startsWith(prefix))
		)
		.filter(
			// filter out scripts without a description if --descriptions-only option
			item => (argv.descriptionsOnly ? descriptions[item.value] : true)
		)
		.filter(
			// filter excluded scripts
			item =>
				!argv.exclude ||
				!argv.exclude.some(e =>
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

	// creates interactive interface using ipt
	ipt(input, {
		autocomplete,
		default: getDefaultTask(),
		"default-separator": sep,
		message,
		multiple,
		ordered,
		size
	})
		.then(keys => {
			setCachedTasks(keys);
			executeCommands(keys);
		})
		.catch(err => {
			error(err, "Error building interactive interface");
		});
}

if (noScriptsFound) {
	out.info(`No ${runner} scripts available in cwd`);
} else {
	run();
}
