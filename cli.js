#!/usr/bin/env node

"use strict";

const path = require('path');
const yargs = require("yargs");
const ipt = require("ipt");
const out = require("simple-output");
const readPkg = require('read-pkg');

let cwdPkg;
const sep = require("os").EOL;
const { execSync } = require("child_process");
const { argv } = yargs
	.usage("Usage:\n  ntl [<path>]")
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
	.boolean(["a", "A", "D", "d", "o", "h", "i", "m", "v"])
	.number(["s"])
	.array(["e"])
	.epilog("Visit https://github.com/ruyadorno/ntl for more info");

const pkg = require("./package");
const cwd = argv._[0] ? path.join(process.cwd(), argv._[0]) : process.cwd();
const { autocomplete, multiple, size } = argv;
const defaultRunner = 'npm';

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

// get cwd package.json values
try {
	cwdPkg = readPkg.sync({ cwd: cwd }) || {};
} catch (e) {
	const [errorType] = Object.values(e);
	error(e, errorType === "JSONError" ? "package.json contains malformed JSON" : "No package.json found");
}

// Retrieve config values from cwd package.json
const { ntl, scripts } = cwdPkg;
const runner = (ntl && ntl.runner) || process.env.NTL_RUNNER || defaultRunner;
const { descriptions = {} } = (ntl || {});

// validates that there are actually npm scripts
if (!scripts || Object.keys(scripts).length < 1) {
	out.info(`No ${runner} scripts available in cwd`);
	process.exit(0);
}

// get package.json descriptions value
if (argv.descriptions) {
	if (Object.keys(descriptions || {}).length < 1) {
		out.warn(`No descriptions for your ${runner} scripts found`);
	}
}

const longestScriptName = (scripts) => Object.keys(scripts).reduce((acc, curr) => curr.length > acc.length ? curr : acc).length;

// defines the items that will be printed to the user
const input = (argv.info || argv.descriptions
	? Object.keys(scripts).map(i => ({ name: `${i.padStart(longestScriptName(argv.descriptionsOnly ? descriptions : scripts))} › ${argv.descriptions && descriptions[i] ? descriptions[i] : scripts[i]}`, value: i }))
	: Object.keys(scripts).map(i => ({ name: `${i.padStart(longestScriptName(argv.descriptionsOnly ? descriptions : scripts))} › ${descriptions[i] ? descriptions[i] : scripts[i]}`, value: i }))
).filter(
	// filter out prefixed scripts
	i =>
		argv.all
			? true
			: ["pre", "post"].every(prefix => i.name.slice(0, prefix.length) !== prefix)
).filter(
	// filter out scripts without a description
	i =>
		argv.descriptions && argv.descriptionsOnly
			? descriptions[i.value] !== undefined
			: true
).filter(
	// filter excluded scripts
	i =>
		!argv.exclude || !argv.exclude.some(e => new RegExp(e + (e.includes('*') ? '' : '$'), 'i').test(i.value))
);

out.success("Npm Task List - v" + pkg.version);

// creates interactive interface using ipt
const message = `Select a task to run${runner !== defaultRunner ? ` (using ${runner})` : ''}:`;
ipt(input, {
	autocomplete,
	message,
	multiple,
	size
})
	.then(keys => {
		keys.forEach(key => {
			execSync(`${runner} run ${key}`, {
				cwd,
				stdio: [process.stdin, process.stdout, process.stderr]
			});
		});
	})
	.catch(err => {
		error(err, "Error building interactive interface");
	});
