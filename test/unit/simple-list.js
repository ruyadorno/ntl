"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const noop = () => null

test("build a simple list of items", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
					build: "make build",
				},
			}),
		},
		ipt: (expected) => {
			t.deepEqual(
				expected,
				[
					{
						name: "test",
						value: "test",
					},
					{
						name: "build",
						value: "build",
					},
				],
				"should build a list with the task names"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
	});
});

test("select one item from the list", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
					build: "make build",
				},
			}),
		},
		ipt: (expected) => {
			return Promise.resolve(["build"]);
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(cmd, "npm run build", "should run the selected task");
				t.end();
			},
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
	});
});
