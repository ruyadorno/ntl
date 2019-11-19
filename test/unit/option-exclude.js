"use strict";

const { Passthrough } = require("minipass");
const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build a list using --exclude option", t => {
	t.plan(1);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: 'echo "build"',
					test: 'echo "test"'
				}
			})
		},
		ipt: expected => {
			t.deepEqual(
				expected,
				[
					{
						name: "build",
						value: "build"
					}
				],
				"should build a list with only non-excluded items"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			node: () => null,
			success: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			exclude: ["test"]
		})
	});
});

test("build a list using --exclude option using *", t => {
	t.plan(1);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: 'echo "build"',
					test: 'echo "test"',
					"test:unit": 'echo "test:unit"',
					"test:integration": 'echo "test:integration"'
				}
			})
		},
		ipt: expected => {
			t.deepEqual(
				expected,
				[
					{
						name: "build",
						value: "build"
					}
				],
				"should build a list with only non-excluded items"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			node: () => null,
			success: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			exclude: ["test*"]
		})
	});
});
