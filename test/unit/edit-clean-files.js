"use strict";

const os = require("os");
const path = require("path");
const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");
const noop = () => null;

test("clean up tmp files on run error", (t) => {
	t.plan(6);
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			name: "test-pkg",
			scripts: {
				foo: "make foo",
			},
		}),
	});
	let exitHandler;
	const pkgJsonFilename = path.resolve(cwd, "package.json");
	const tmpFilename = path.resolve(cwd, ".ntl-tmp-bkp-package.json");
	const ntl = requireInject("../../cli", {
		child_process: {
			execSync(cmd) {
				exitHandler();
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
				t.deepEqual(
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
		"read-pkg": {
			sync: () => ({
				name: "test-pkg",
				scripts: {
					foo: "make foo",
				},
			}),
		},
		ipt: (items, expected, prompt) => {
			// this is the argument edit prompt
			if (!items.length) {
				return Promise.resolve(["make foo --bar"]);
			}

			prompt.ui = { rl: { emit() {} } };
			return Promise.resolve(["foo"]);
		},
		"simple-output": {
			error: noop,
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [cwd],
		}),
	});

	// simulate pressing E key to edit
	process.stdin.emit("keypress", "", { name: "e" });
});
