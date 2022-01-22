"use strict";

const os = require("os");
const path = require("path");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("edit a currently selected task pressing E", (t) => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
				test: "make test",
			},
		}),
	});
	const pkgJsonFilename = path.resolve(cwd, "package.json");
	const tmpFilename = path.resolve(cwd, ".ntl-tmp-bkp-package.json");
	const ntl = t.mock("../../cli", {
		child_process: {
			execSync(cmd) {
				t.equal(cmd, 'npm run "foo(1)"', "should run temp edited task");
			},
		},
		fs: {
			unlinkSync: (filename) => {
				t.equal(filename, pkgJsonFilename, "should remove tmp file");
			},
			renameSync: (src, dst) => {
				if (path.basename(src) === "package.json") return; // skips initial renaming
				t.equal(src, tmpFilename, "should move bkp file...");
				t.equal(dst, pkgJsonFilename, "...back to package.json");
				t.end();
			},
		},
		"signal-exit": noop,
		"write-pkg": {
			sync: (path, pkg) => {
				t.equal(path, cwd, "should use expected cwd");
				t.strictSame(
					pkg,
					{
						scripts: {
							foo: "make foo",
							test: "make test",
							"foo(1)": "make foo --bar",
						},
					},
					"should store edited task"
				);
			},
		},
		"read-package-json-fast": async () => ({
			scripts: {
				foo: "make foo",
				test: "make test",
			},
		}),
		ipt: (items, expected, prompt) => {
			// this is the argument edit prompt
			if (!items.length) {
				t.strictSame(
					expected,
					{
						message: "Edit the script or its arguments",
						default: "make foo",
						input: true,
						unquoted: true,
					},
					"should use input interface edit options"
				);
				return Promise.resolve(["make foo --bar"]);
			}

			t.strictSame(
				expected,
				{
					autocomplete: undefined,
					default: undefined,
					"default-separator": os.EOL,
					message: "Select a task to run:",
					multiple: undefined,
					ordered: undefined,
					size: undefined,
				},
				"should use autocomplete:true option while building the list"
			);
			return new Promise((res) => {
				prompt.ui = {
					rl: {
						emit: (code) => {
							t.equal(
								code,
								"line",
								"should emit signal to quit task list prompt"
							);
							prompt.ui.rl.emit = noop;
							res(["foo"]);
						},
					},
				};
			});
			return iptInitialPromise;
		},
		"simple-output": {
			error: console.error,
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [cwd],
			debug: true,
			rerunCache: false,
		}),
	});

	// simulate pressing E key to edit
	setTimeout(() => {
		process.stdin.emit("keypress", "", { name: "e" });
	}, 10);
});

t.test("fail to rename package.json on editing", (t) => {
	const _exit = process.exit;
	process.exit = (code) => {
		t.equal(code, 1, "should exit with error signal");
		t.end();
	};
	t.teardown(() => {
		process.exit = _exit;
	});

	const cwd = t.testdir({
		"package.json": JSON.stringify({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
				test: "make test",
			},
		}),
	});
	const ntl = t.mock("../../cli", {
		child_process: {
			execSync(cmd) {
				t.equal(cmd, 'npm run "foo(1)"', "should run temp edited task");
			},
		},
		fs: {
			renameSync: (src, dst) => {
				if (path.basename(src) === "package.json") {
					throw new Error("ERR");
				}
			},
		},
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				foo: "make foo",
				test: "make test",
			},
		}),
		ipt: (items, expected, prompt) => {
			// this is the argument edit prompt
			if (!items.length) {
				return Promise.resolve(["make foo --bar"]);
			}

			// TODO: fix prompt.ui here, it's probably reusing whatever was
			// defined in the test before, this rings a bell and has happened before
			return new Promise((res) => {
				prompt.ui = {
					rl: {
						emit: (code) => {
							prompt.ui.rl.emit = noop;
							res(["foo"]);
						},
					},
				};
			});
			return iptInitialPromise;
		},
		"simple-output": {
			error: (msg) => {
				t.equal(
					msg,
					"Error while managing ntl tmp files",
					"should error with tmp file ref"
				);
			},
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [cwd],
			debug: false,
			rerunCache: false,
		}),
	});

	// simulate pressing E key to edit
	setTimeout(() => {
		process.stdin.emit("keypress", "", { name: "e" });
	}, 10);
});
