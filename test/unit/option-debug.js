"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");

t.test("error while use --debug option", (t) => {
	t.plan(2);
	try {
		const ntl = t.mock("../../cli", {
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
				rerunCache: false,
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
