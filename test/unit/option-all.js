"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");
const noop = () => null

test("build a list withouth using --all option", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					prebuild: "make prebuild",
					build: "make build",
				},
			}),
		},
		ipt: (expected) => {
			t.deepEqual(
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
	});
});

test("build a list using --all option", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					prebuild: "make prebuild",
					build: "make build",
				},
			}),
		},
		ipt: (expected) => {
			t.deepEqual(
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
	});
});
