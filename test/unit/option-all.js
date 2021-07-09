"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("build a list withouth using --all option", (t) => {
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				prebuild: "make prebuild",
				build: "make build",
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
				"should build a list excluding prefixed tasks"
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
		}),
		"signal-exit": noop,
	});
});

t.test("build a list using --all option", (t) => {
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				prebuild: "make prebuild",
				build: "make build",
			},
		}),
		ipt: (expected) => {
			t.strictSame(
				expected,
				[
					{
						name: "prebuild",
						value: "prebuild",
					},
					{
						name: "build",
						value: "build",
					},
				],
				"should build a list including prefixed tasks"
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
			all: true,
		}),
		"signal-exit": noop,
	});
});
