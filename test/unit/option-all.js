"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build a list using --all option", t => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					prebuild: "make prebuild",
					build: "make build"
				}
			})
		},
		ipt: expected => {
			t.deepEqual(
				expected,
				[
					{
						name: "prebuild",
						value: "prebuild"
					},
					{
						name: "build",
						value: "build"
					}
				],
				"should build a list including prefixed tasks"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null
		},
		yargs: mockYargs({
			_: [],
			all: true
		})
	});
});
