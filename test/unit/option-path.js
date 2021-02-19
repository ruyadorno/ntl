"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");
const noop = () => null

test("build a list from a specific path", (t) => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"',
			},
		}),
	});

	const ntl = requireInject("../../cli", {
		ipt: (expected) => {
			t.deepEqual(
				expected,
				[
					{
						name: "build",
						value: "build",
					},
				],
				"should build a valid list"
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
			_: [cwd],
		}),
	});
});
