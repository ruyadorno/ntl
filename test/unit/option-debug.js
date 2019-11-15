"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("error while use --debug option", t => {
	const _exit = process.exit;
	process.exit = code => {
		t.equal(code, 1, "should exit with error signal");
	};
	t.teardown(() => {
		process.exit = _exit;
	});
	t.plan(2);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => {
				throw new Error("ERR");
			}
		},
		"simple-output": {
			error: msg => {
				t.match(
					msg,
					{
						message: "ERR"
					},
					"should forward original error message"
				);
			},
			info: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			debug: true
		})
	});
});
