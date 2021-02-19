"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("error while use --debug option", (t) => {
	t.plan(2);
	try {
		const ntl = requireInject("../../cli", {
			"read-pkg": {
				sync: () => {
					throw new Error("ERR");
				},
			},
			"simple-output": {
				error: (msg) => {
					t.match(
						msg,
						"No package.json found",
						"should forward internal error message"
					);
				},
				info: () => null,
			},
			"yargs/yargs": mockYargs({
				_: [],
				debug: true,
			}),
		});
	} catch (err) {
		t.match(
			err,
			{
				message: "ERR",
			},
			"should throw with original error"
		)
	}
});
