"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build an interface using a specific max number of lines to be displayed", t => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test"
				}
			})
		},
		ipt: (items, expected) => {
			t.deepEqual(
				expected,
				{
					autocomplete: undefined,
					message: "Select a task to run:",
					multiple: undefined,
					size: 10
				},
				"should use specific size option while building the list"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			size: 10
		})
	});
});
