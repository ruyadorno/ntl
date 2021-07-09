"use strict";

const os = require("os");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("build an interface using selectable items in order", (t) => {
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				test: "make test",
			},
		}),
		ipt: (items, expected) => {
			t.strictSame(
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
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			ordered: true,
			rerunCache: false,
		}),
		"signal-exit": noop,
	});
});

t.test("run multiple commands in order", (t) => {
	t.plan(2);
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
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
			ordered: true,
			rerunCache: false,
		}),
		"signal-exit": noop,
	});
});
