#!/usr/bin/env node

"use strict";

const yargs = require("yargs");
const ipt = require("ipt");
const out = require("simple-output");
const pkgInfo = require("pkginfo");

let tasks;
let descriptions;
const sep = require("os").EOL;
const { execSync } = require("child_process");
const { argv } = yargs
	.usage("Usage:\n  ntl [<path>]")
	.alias("a", "all")
	.describe("a", "Includes pre and post scripts on the list")
	.alias("A", "autocomplete")
	.describe("A", "Starts in autocomplete mode")
	.alias("D", "debug")
	.describe("d", "Prints to stderr any internal error")
	.alias("d", "descriptions")
	.describe("d", "Displays the descriptions of each script")
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
	.boolean(["a", "A", "D", "d", "h", "i", "m", "v"])
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
	pkgInfo(tasks, { dir: cwd, include: ["scripts"] });
	tasks = tasks.exports.scripts;
} catch (e) {
	error(e, "No package.json found");
}

// validates that there are actually npm scripts
if (!tasks || Object.keys(tasks).length < 1) {
	out.info("No npm scripts available in cwd");
	process.exit(0);
}

// get package.json descriptions value
if (argv.descriptions) {
	try {
		descriptions = { exports: {} };
		pkgInfo(descriptions, { dir: cwd, include: ["ntl"] });
		descriptions = descriptions.exports.ntl.descriptions;
	} catch (e) {
		error(e, "No descriptions for your npm scripts found");
	}
}

// defines the items that will be printed to the user
const input = (argv.info
	? Object.keys(tasks).map(i => ({ name: `${i}: ${tasks[i]}`, value: i }))
	: argv.descriptions
		? Object.keys(tasks).map(i => {
			return {
				name: `${i}: ${descriptions[i]}`,
				value: i
			}
		})
		: Object.keys(tasks)
).filter(
	// filter out prefixed tasks
	i =>
		argv.all
			? true
			: ["pre", "post"].every(prefix => argv.info || argv.descriptions
					? i.name.slice(0, prefix.length) !== prefix
					: i.slice(0, prefix.length) !== prefix
			)
).filter(
	// filter out tasks without a description
	i =>
		argv.descriptions
			? descriptions[i.value] !== undefined
			: true
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
