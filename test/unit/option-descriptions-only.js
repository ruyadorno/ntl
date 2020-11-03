"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build a list using --descriptions-only option", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
					test: "make test",
				},
				ntl: {
					descriptions: {
						build: "Run build steps",
					},
				},
			}),
		},
		ipt: (expected) => {
			t.deepEqual(
				expected,
				[
					{
						name: "build › Run build steps",
						value: "build",
					},
				],
				"should build a list with the task names"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			node: () => null,
			success: (msg) => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			descriptionsOnly: true,
		}),
	});
});

test("build a list using --descriptions-only option along with --description", (t) => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
					test: "make test",
				},
				ntl: {
					descriptions: {
						build: "Run build steps",
					},
				},
			}),
		},
		ipt: (expected) => {
			t.deepEqual(
				expected,
				[
					{
						name: "build › Run build steps",
						value: "build",
					},
				],
				"should build a list with the task names"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			node: () => null,
			success: (msg) => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			descriptions: true,
			descriptionsOnly: true,
		}),
	});
});
