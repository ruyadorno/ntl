"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");
const noop = () => null

test("build a list using --info option", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
					test: "make test",
				},
			}),
		},
		ipt: (expected) => {
			t.deepEqual(
				expected,
				[
					{
						name: "build › make build",
						value: "build",
					},
					{
						name: " test › make test",
						value: "test",
					},
				],
				"should build a list showing each script content"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: (msg) => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			info: true,
		}),
	});
});
