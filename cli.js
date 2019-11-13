#!/usr/bin/env node

"use strict";

const os = require("os");
const path = require("path");
const yargs = require("yargs");
const ipt = require("ipt");
const out = require("simple-output");
const readPkg = require("read-pkg");
const Conf = require("conf");

let cwdPkg;
const sep = os.EOL;
const { execSync } = require("child_process");
const { argv } = yargs
	.usage(
		"Usage:\n  ntl [<path>]             Build an interactive interface and run any script"
	)
	.usage("  nt                       Rerun last executed script")
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
	.alias("s", "size")
	.describe("s", "Amount of lines to display at once")
	.alias("v", "version")
	.describe("rerun", "Rerun last executed script")
	.alias("r", "rerun")
	.describe("cache", "Define a location for the rerun task cache")
	.boolean(["a", "A", "D", "d", "o", "h", "i", "m", "v", "r"])
	.number(["s"])
	.array(["e"])
	.string(["cache"])
	.epilog("Visit https://github.com/ruyadorno/ntl for more info");

const pkg = require("./package");
const cwd = argv._[0] ? path.resolve(process.cwd(), argv._[0]) : process.cwd();
const { autocomplete, cache, multiple, size, rerun } = argv;
const defaultRunner = "npm";

// Retrieve config values from cwd package.json
const { ntl, scripts } = getCwdPackage() || {};
const runner = (ntl && ntl.runner) || process.env.NTL_RUNNER || defaultRunner;
const { descriptions = {} } = ntl || {};
const noScriptsFound = !scripts || Object.keys(scripts).length < 1;

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

function run() {
	const shouldWarnNoDescriptions =
		argv.descriptions && Object.keys(descriptions).length < 1;
	if (shouldWarnNoDescriptions) {
		out.warn(`No descriptions for your ${runner} scripts found`);
	}

	function executeCommands(keys) {
		keys.forEach(key => {
			execSync(`${runner} run ${key}`, {
				cwd,
				stdio: [process.stdin, process.stdout, process.stderr]
			});
		});
	}

	function repeat(rerunCache) {
		let rerunCachedTasks;

		try {
			rerunCachedTasks = rerunCache.get("rerunCachedTasks");
		} catch (e) {
			// should ignore rerun cache errors
		}

		if (!rerunCachedTasks) {
			out.warn("No previous task available");
			return false;
		}

		executeCommands(rerunCachedTasks);
		return true;
	}

	const longestScriptName = scripts =>
		Object.keys(scripts).reduce(
			(acc, curr) => (curr.length > acc.length ? curr : acc),
			""
		).length;

	// defines the items that will be printed to the user
	const input = Object.keys(scripts)
		.map(key => ({
			name:
				argv.info || argv.descriptions
					? `${key.padStart(
							longestScriptName(argv.descriptionsOnly ? descriptions : scripts)
					  )} › ${
							argv.descriptions && descriptions[key]
								? descriptions[key]
								: scripts[key]
					  }`
					: key,
			value: key
		}))
		.filter(
			// filter out prefixed scripts
			item =>
				argv.all
					? true
					: ["pre", "post"].every(
							prefix => item.name.slice(0, prefix.length) !== prefix
					  )
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

	const rerunCache = new Conf({
		configName: ".ntl",
		cwd: cache || os.homedir()
	});

	if (rerun && repeat(rerunCache)) {
		return;
	}

	if (!input || input.length === 0) {
		return out.error("No tasks remained, maybe try less options?");
	}

	out.success("Npm Task List - v" + pkg.version);

	// creates interactive interface using ipt
	ipt(input, {
		autocomplete,
		message,
		multiple,
		size
	})
		.then(keys => {
			executeCommands(keys);
			try {
				rerunCache.set("rerunCachedTasks", keys);
			} catch (e) {
				// should ignore rerun cache errors
			}
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
