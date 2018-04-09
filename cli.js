#!/usr/bin/env node

"use strict";

const yargs = require("yargs");
const ipt = require("ipt");
const out = require("simple-output");

let tasks;
const sep = require("os").EOL;
const { execSync } = require("child_process");
const { argv } = yargs
	.usage("Usage:\n  ntl [<path>]")
	.alias("a", "all")
	.describe("a", "Includes pre and post scripts on the list")
	.alias("A", "autocomplete")
	.describe("A", "Starts in autocomplete mode")
	.alias("d", "debug")
	.describe("d", "Prints to stderr any internal error")
	.help("h")
	.alias("h", "help")
	.describe("h", "Shows this help message")
	.alias("i", "info")
	.describe("i", "Displays the contents of each script")
	.alias("m", "multiple")
	.describe("m", "Allows the selection of multiple items")
	.alias("s", "size")
	.describe("s", "Amount of lines to display at once")
	.alias("v", "version")
	.boolean(["a", "A", "d", "h", "i", "m", "v"])
	.number(["s"])
	.epilog("Visit https://github.com/ruyadorno/ntl for more info");

const pkg = require("./package");
const cwd = argv._[0] || process.cwd();
const { autocomplete, multiple, size } = argv;

function error(e, msg) {
	out.error(argv.debug ? e : msg);
	process.exit(1);
}

// Exits program execution on ESC
process.stdin.on("keypress", (ch, key) => {
	if (key && key.name === "escape") {
		process.exit(0);
	}
});

// get package.json scripts value
try {
	tasks = { exports: {} };
	require("pkginfo")(tasks, { dir: cwd, include: ["scripts"] });
	tasks = tasks.exports.scripts;
} catch (e) {
	error(e, "No package.json found");
}

// validates that there are actually npm scripts
if (!tasks || Object.keys(tasks).length < 1) {
	out.info("No npm scripts available in cwd");
	process.exit(0);
}

// defines the items that will be printed to the user
const input = (argv.info
	? Object.keys(tasks).map(i => ({ name: `${i}: ${tasks[i]}`, value: i }))
	: Object.keys(tasks)
).filter(
	// filter out prefixed tasks
	i =>
		argv.all
			? true
			: ["pre", "post"].every(prefix => i.slice(0, prefix.length) !== prefix)
);

out.success("Npm Task List - v" + pkg.version);

// creates interactive interface using ipt
ipt(input, {
	message: "Select a task to run:",
	autocomplete,
	multiple,
	size
})
	.then(keys => {
		keys.forEach(key => {
			execSync(`npm run ${key}`, {
				cwd,
				stdio: [process.stdin, process.stdout, process.stderr]
			});
		});
	})
	.catch(err => {
		error(err, "Error building interactive interface");
	});
