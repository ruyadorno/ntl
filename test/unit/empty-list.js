"use strict";

const { Passthrough } = require("minipass");
const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build a list of items that gets all items filtered out using --descriptions-only", (t) => {
	t.plan(1);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: 'echo "build"',
					start: 'echo "start"',
					test: 'echo "test"',
				},
				ntl: {
					descriptions: {},
				},
			}),
		},
		ipt: (expected) => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			error: (msg) => {
				t.equal(
					msg,
					"No tasks remained, maybe try less options?",
					"should show error message suggesting less options"
				);
			},
		},
		"yargs/yargs": mockYargs({
			_: [],
			descriptionsOnly: true,
		}),
	});
});

test("build a list of items that gets all items filtered out from --exclude option", (t) => {
	t.plan(1);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: 'echo "build"',
					test: 'echo "test"',
				},
			}),
		},
		ipt: (expected) => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			error: (msg) => {
				t.equal(
					msg,
					"No tasks remained, maybe try less options?",
					"should show error message suggesting less options"
				);
			},
		},
		"yargs/yargs": mockYargs({
			_: [],
			exclude: ["build", "test"],
		}),
	});
});

test("build a list of items that gets items filtered out using --descriptions-only, --excluded and prefixed scripts", (t) => {
	t.plan(1);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: 'echo "build"',
					pretest: 'echo "pretest"',
					test: 'echo "test"',
				},
				ntl: {
					descriptions: {
						build: "Foo",
					},
				},
			}),
		},
		ipt: (expected) => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			error: (msg) => {
				t.equal(
					msg,
					"No tasks remained, maybe try less options?",
					"should show error message suggesting less options"
				);
			},
		},
		"yargs/yargs": mockYargs({
			_: [],
			descriptionsOnly: true,
			exclude: ["build"],
		}),
	});
});

test("build a list of items that gets all items filtered out as prefixed scripts", (t) => {
	t.plan(1);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					prebuild: 'echo "prebuild"',
					pretest: 'echo "pretest"',
				},
			}),
		},
		ipt: (expected) => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			error: (msg) => {
				t.equal(
					msg,
					"No tasks remained, maybe try less options?",
					"should show error message suggesting less options"
				);
			},
		},
	});
});
