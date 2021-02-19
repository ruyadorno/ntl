"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const noop = () => null

test("press esc key", (t) => {
	const _exit = process.exit;
	const _stdin = process.stdin;
	process.exit = (code) => {
		t.equal(code, 0, "should exit with error signal");
		t.end();
	};
	t.teardown(() => {
		process.exit = _exit;
	});
	const ntl = requireInject("../../cli", {
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			error: (msg) => {
				t.equal(
					msg,
					"Error building interactive interface",
					"should forward original error message"
				);
			},
			info: noop,
		},
	});

	// simulate esc key
	process.stdin.emit("keypress", "", { name: "escape" });
});
