"use strict";

const t = require("tap");
const noop = () => null

t.test("build a simple list of items", (t) => {
	const ntl = t.mock("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
					build: "make build",
				},
			}),
		},
		ipt: (expected) => {
			t.strictSame(
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

t.test("select one item from the list", (t) => {
	const ntl = t.mock("../../cli", {
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
				t.equal(
					cmd,
					"npm run \"build\"",
					"should run the selected task"
				);
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
