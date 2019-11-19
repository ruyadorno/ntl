"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");

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
		ipt: () => Promise.reject(new Error("ERR")),
		"simple-output": {
			node: () => null,
			success: () => null,
			error: msg => {
				t.equal(
					msg,
					"Error building interactive interface",
					"should forward original error message"
				);
			},
			info: () => null
		}
	});
});
