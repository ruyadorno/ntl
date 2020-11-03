"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build a list using default options", (t) => {
	const ntl = requireInject("../../cli", {
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
			t.deepEqual(
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
			node: () => null,
			success: (msg) => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
		}),
	});
});

test("build a list in which descriptions key is missing", (t) => {
	const ntl = requireInject("../../cli", {
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
			t.deepEqual(
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
			node: () => null,
			success: (msg) => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
		}),
	});
});

test("build a list using --descriptions option", (t) => {
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
			node: () => null,
			success: (msg) => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			descriptions: true,
		}),
	});
});
