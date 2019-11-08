"use strict";

const { Passthrough } = require("minipass");
const { test } = require("tap");
const requireInject = require("require-inject");

test("build a simple list of items", t => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
					build: "make build"
				}
			})
		},
		ipt: expected => {
			t.deepEqual(
				expected,
				[
					{
						name: "test",
						value: "test"
					},
					{
						name: "build",
						value: "build"
					}
				],
				"should build a list with the task names"
			);
			t.end();
			return Promise.resolve([]);
		}
	});
});
