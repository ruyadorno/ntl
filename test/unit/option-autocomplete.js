"use strict";

const os = require("os");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("build an interface using autocomplete/fuzzyfinder", (t) => {
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
					autocomplete: true,
					default: undefined,
					"default-separator": os.EOL,
					message: "Select a task to run:",
					multiple: undefined,
					ordered: undefined,
					size: undefined,
				},
				"should use autocomplete:true option while building the list"
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
			autocomplete: true,
			rerunCache: false,
		}),
		"signal-exit": noop,
	});
});
