"use strict";

const os = require("os");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null

t.test("build an interface using multiple selectable items", (t) => {
	const ntl = t.mock("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
				},
			}),
		},
		ipt: (items, expected) => {
			t.strictSame(
				expected,
				{
					autocomplete: undefined,
					default: undefined,
					"default-separator": os.EOL,
					message: "Select a task to run:",
					multiple: true,
					ordered: undefined,
					size: undefined,
				},
				"should use multiple:true option while building the list"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			multiple: true,
			rerunCache: false,
		}),
	});
});

t.test("run multiple commands", (t) => {
	t.plan(2);
	const ntl = t.mock("../../cli", {
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
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			multiple: true,
			rerunCache: false,
		}),
	});
});
