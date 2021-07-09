"use strict";

const os = require("os");
const path = require("path");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("clean up tmp files on run error", (t) => {
	const _processExit = process.exit;
	t.teardown(() => {
		process.exit = _processExit;
	});
	t.plan(6);
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
			},
		}),
		".ntl-tmp-bkp-package.json": JSON.stringify({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
				"foo(1)": "make foo --bar",
			},
		}),
	});
	let exitHandler;
	let iptResolve;
	const iptPromise = new Promise((res) => {
		iptResolve = res;
	});
	const pkgJsonFilename = path.resolve(cwd, "package.json");
	const tmpFilename = path.resolve(cwd, ".ntl-tmp-bkp-package.json");
	const ntl = t.mock("../../cli", {
		child_process: {
			execSync(cmd) {
				// here we're simulating an exec sync that throws,
				// this will in turn exit the program with an thrown
				// error and the exit handler will be called with code 1
				// (which is what we ultimately want to test here, since
				// the exitHandler will be cleaning up the tmp files)
				process.exit = () => {
					process.exit = noop;
					exitHandler(1, null);
				};
				throw new Error("ERR");
			},
		},
		fs: {
			statSync: (filename) => {
				t.equal(filename, tmpFilename, "should check for file");
			},
			unlinkSync: (filename) => {
				t.equal(filename, pkgJsonFilename, "should remove tmp file");
			},
			renameSync: (src, dst) => {
				if (path.basename(src) === "package.json") return; // skips initial renaming
				t.equal(src, tmpFilename, "should move bkp file...");
				t.equal(dst, pkgJsonFilename, "...back to package.json");
			},
		},
		"signal-exit": (fn) => {
			exitHandler = fn;
		},
		"write-pkg": {
			sync: (path, pkg) => {
				t.equal(path, cwd, "should use expected cwd");
				t.strictSame(
					pkg,
					{
						name: "test-pkg",
						scripts: {
							foo: "make foo",
							"foo(1)": "make foo --bar",
						},
					},
					"should store edited task"
				);
			},
		},
		"read-package-json-fast": async () => ({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
			},
		}),
		ipt: (items, expected, prompt) => {
			// this is the argument edit prompt
			if (!items.length) {
				return Promise.resolve(["make foo --bar"]);
			}

			// mocks API that triggers the resolving of the original promise
			// ipt interface that in turns starts the editing prompt
			return new Promise((res) => {
				prompt.ui = {
					rl: {
						emit() {
							res(["foo"]);
						},
					},
				};
			});
		},
		"simple-output": {
			error: noop,
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [cwd],
			rerunCache: false,
		}),
	});

	// simulate pressing E key to edit
	setTimeout(() => {
		process.stdin.emit("keypress", "", { name: "e" });
	}, 10);
});

t.test("clean up tmp files on exit", (t) => {
	const _processExit = process.exit;
	// process.exit has to be the last thing to run
	// otherwise teardown might run prior to process.exit(1)
	// from ./cli.js error handler
	process.exit = () => {
		t.end();
	};
	t.teardown(() => {
		process.exit = _processExit;
	});
	let exitHandler;
	const ntl = t.mock("../../cli", {
		fs: {
			statSync: (filename) => {
				throw new Error("ERR");
			},
		},
		"signal-exit": (fn) => {
			exitHandler = fn;
		},
		"read-package-json-fast": async () => ({
			name: "test-pkg",
		}),
		"simple-output": {
			error: (msg) => {
				t.match(
					msg,
					/error cleaning up ntl tmp files/,
					"should output error cleaning up files msg"
				);
			},
			hint: noop,
			node: noop,
			success: noop,
			info: (msg) => {
				t.match(
					msg,
					"No npm scripts available in cwd",
					"should end with no scripts available msg"
				);
				// simulates calling the signal-exit handler
				// that should happen after the info msg being printed
				exitHandler(0, null);
			},
		},
		"yargs/yargs": mockYargs({
			_: [t.testdirName],
		}),
	});
});
