"use strict";

const os = require("os");
const path = require("path");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

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
					/Error cleaning up ntl tmp files/,
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

t.test("move back package.json file on write error", (t) => {
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
	const ntl = t.mock("../../cli", {
		fs: {
			renameSync: (src, dest) => {
				if (path.basename(src) === "package.json") {
					t.ok(1, "should move package.json to temp file");
					return;
				}
				t.equal(
					path.basename(src),
					".ntl-tmp-bkp-package.json",
					"should move temp file..."
				);
				t.equal(path.basename(dest), "package.json", "...back to package.json");
			},
		},
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
			},
		}),
		"write-pkg": {
			sync(path, pkg) {
				throw new Error("ERR");
			},
		},
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
			error: (msg) => {
				t.match(
					msg,
					/Error while managing ntl tmp files/,
					"should output error managing files msg"
				);
			},
			hint: noop,
			node: noop,
			success: noop,
			info: noop,
		},
		"yargs/yargs": mockYargs({
			_: [t.testdirName],
		}),
	});

	// simulate pressing E key to edit
	setTimeout(() => {
		process.stdin.emit("keypress", "", { name: "e" });
	}, 10);
});

t.test("fails to move back package.json during error", (t) => {
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
	const ntl = t.mock("../../cli", {
		fs: {
			renameSync: (src, dest) => {
				if (path.basename(src) === "package.json") {
					t.ok(1, "should move package.json to temp file");
					return;
				}
				throw new Error("ERR");
			},
		},
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
			},
		}),
		"write-pkg": {
			sync(path, pkg) {
				throw new Error("ERR");
			},
		},
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
			error: (msg) => {
				t.match(
					msg,
					/Error while managing ntl tmp files/,
					"should output error managing files msg"
				);
			},
			warn: (msg) => {
				t.match(
					msg,
					/Failed to move .ntl-tmp-bkp-package.json to package.json/,
					"should output files failed to move warning message"
				);
			},
			hint: noop,
			node: noop,
			success: noop,
			info: noop,
		},
		"yargs/yargs": mockYargs({
			_: [t.testdirName],
		}),
	});

	// simulate pressing E key to edit
	setTimeout(() => {
		process.stdin.emit("keypress", "", { name: "e" });
	}, 10);
});
