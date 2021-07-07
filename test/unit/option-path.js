"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null

t.test("build a list from a specific path", (t) => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"',
			},
		}),
	});

	const ntl = t.mock("../../cli", {
		ipt: (expected) => {
			t.strictSame(
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
