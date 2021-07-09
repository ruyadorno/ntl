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
	let iptResolve;
	const iptInitialPromise = new Promise((res, rej) => {
		iptResolve = res;
	});
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
			prompt.ui = {
				rl: {
					emit: (code) => {
						t.equal(
							code,
							"line",
							"should emit signal to quit task list prompt"
						);
						iptResolve(["foo"]);
					},
				},
			};
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
