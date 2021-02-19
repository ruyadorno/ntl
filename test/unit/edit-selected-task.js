"use strict";

const os = require("os");
const path = require("path");
const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");
const noop = () => null;

test("edit a currently selected task pressing E", (t) => {
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
	const ntl = requireInject("../../cli", {
		child_process: {
			execSync(cmd) {
				t.equal(cmd, "npm run foo(1)", "should run temp edited task");
				t.end();
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
			},
		},
		"signal-exit": noop,
		"write-pkg": {
			sync: (path, pkg) => {
				t.equal(path, cwd, "should use expected cwd");
				t.deepEqual(
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
		"read-pkg": {
			sync: () => ({
				scripts: {
					foo: "make foo",
					test: "make test",
				},
			}),
		},
		ipt: (items, expected, prompt) => {
			// this is the argument edit prompt
			if (!items.length) {
				t.deepEqual(
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

			t.deepEqual(
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
					},
				},
			};
			return Promise.resolve(["foo"]);
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
		}),
	});

	// simulate pressing E key to edit
	process.stdin.emit("keypress", "", { name: "e" });
});
