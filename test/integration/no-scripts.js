"use strict";

const t = require("tap");
const { readLastLine, run } = require("./helpers");

t.test("ntl run using --debug option", (t) => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({ name: "foo", version: "1.1.1" }),
	});

	const cp = run({ cwd });
	cp.getStdoutResult().then((res) => {
		const taskOutput = res.join("").toString().trim();
		t.match(
			taskOutput,
			/No npm scripts available in cwd/,
			"should output no scripts found msg"
		);
		t.end();
	});
});
