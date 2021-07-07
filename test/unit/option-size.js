"use strict";

const os = require("os");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null

t.test("build an interface using a specific max number of lines to be displayed", (t) => {
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
					multiple: undefined,
					ordered: undefined,
					size: 10,
				},
				"should use specific size option while building the list"
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
			rerunCache: false,
			size: 10,
		}),
	});
});
