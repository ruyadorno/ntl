"use strict";

const { Passthrough } = require("minipass");
const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("build a list using --exclude option", (t) => {
	t.plan(1);
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				build: 'echo "build"',
				test: 'echo "test"',
			},
		}),
		ipt: (expected) => {
			t.strictSame(
				expected,
				[
					{
						name: "build",
						value: "build",
					},
				],
				"should build a list with only non-excluded items"
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
			exclude: ["test"],
			rerunCache: false,
		}),
		"signal-exit": noop,
	});
});

t.test("build a list using --exclude option using *", (t) => {
	t.plan(1);
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				build: 'echo "build"',
				test: 'echo "test"',
				"test:unit": 'echo "test:unit"',
				"test:integration": 'echo "test:integration"',
			},
		}),
		ipt: (expected) => {
			t.strictSame(
				expected,
				[
					{
						name: "build",
						value: "build",
					},
				],
				"should build a list with only non-excluded items"
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
			exclude: ["test*"],
			rerunCache: false,
		}),
		"signal-exit": noop,
	});
});
