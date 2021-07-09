"use strict";

const t = require("tap");
const { readLastLine, run } = require("./helpers");

t.test("ntl found malformed package.json on current dir", (t) => {
	const cwd = t.testdir({
		"package.json": "!!! not json",
	});

	t.plan(2);

	const cp = run({
		cwd,
	});
	cp.assertExitCode(t, 1, "should exit with error code");
	cp.getStderrResult().then((res) => {
		const taskOutput = res.join("").toString().trim();
		t.match(
			taskOutput,
			/package.json contains malformed JSON/,
			"should print malformed package.json msg to stderr"
		);
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
