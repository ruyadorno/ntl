"use strict";

const os = require("os");
const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build an interface using autocomplete/fuzzyfinder", (t) => {
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
			node: () => null,
			success: () => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			autocomplete: true,
		}),
	});
});
