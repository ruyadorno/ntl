"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null

t.test("build a list using default options", (t) => {
	const ntl = t.mock("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					"automated:build": "make automated-build",
					test: "make test",
				},
				ntl: {
					descriptions: {
						"automated:build": "Run build steps",
					},
				},
			}),
		},
		ipt: (expected) => {
			t.strictSame(
				expected,
				[
					{
						name: "automated:build › Run build steps",
						value: "automated:build",
					},
					{
						name: "           test › ",
						value: "test",
					},
				],
				"should build a list using descriptions if they're present"
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
		}),
	});
});

t.test("build a list in which descriptions key is missing", (t) => {
	const ntl = t.mock("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					"automated:build": "make automated-build",
					test: "make test",
				},
				ntl: {
					descriptions: {
						"some-other-task-name": "foo",
					},
				},
			}),
		},
		ipt: (expected) => {
			t.strictSame(
				expected,
				[
					{
						name: "automated:build",
						value: "automated:build",
					},
					{
						name: "test",
						value: "test",
					},
				],
				"should build a regular list if there's no description matching actual tasks"
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
		}),
	});
});

t.test("build a list using --descriptions option", (t) => {
	const ntl = t.mock("../../cli", {
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
			t.strictSame(
				expected,
				[
					{
						name: "build › Run build steps",
						value: "build",
					},
					{
						name: " test › make test",
						value: "test",
					},
				],
				"should build a list using the descriptions"
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
			descriptions: true,
		}),
	});
});
