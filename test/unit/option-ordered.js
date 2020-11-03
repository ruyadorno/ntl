"use strict";

const os = require("os");
const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build an interface using selectable items in order", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
				},
			}),
		},
		ipt: (items, expected) => {
			t.deepEqual(
				expected,
				{
					autocomplete: undefined,
					default: undefined,
					"default-separator": os.EOL,
					message: "Select a task to run:",
					multiple: undefined,
					ordered: true,
					size: undefined,
				},
				"should use ordered:true option while building the list"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			node: () => null,
			success: () => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			ordered: true,
		}),
	});
});

test("run multiple commands in order", (t) => {
	t.plan(2);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
					test: "make test",
				},
			}),
		},
		ipt: (items) => {
			return Promise.resolve(items.map((item) => item.name));
		},
		child_process: {
			execSync: (cmd) => {
				t.ok(cmd.startsWith("npm run"), "should run multiple commands");
			},
		},
		"simple-output": {
			node: () => null,
			success: () => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			ordered: true,
		}),
	});
});
