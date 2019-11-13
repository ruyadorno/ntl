"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("build a list using --descriptions option", t => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
					test: "make test"
				},
				ntl: {
					descriptions: {
						build: "Run build steps"
					}
				}
			})
		},
		ipt: expected => {
			t.deepEqual(
				expected,
				[
					{
						name: "build › Run build steps",
						value: "build"
					},
					{
						name: " test › make test",
						value: "test"
					}
				],
				"should build a list using the descriptions"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			success: msg => null
		},
		yargs: mockYargs({
			_: [],
			descriptions: true
		})
	});
});
