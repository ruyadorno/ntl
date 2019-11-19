"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl run but not package.json in current dir", t => {
	const cwd = t.testdir({
		"README.md": "# empty folder"
	});

	t.plan(2);

	const cp = run({
		cwd
	});
	cp.assertExitCode(t, 1, "should exit with error code");
	cp.getStderrResult().then(res => {
		const taskOutput = res.toString().trim();
		t.ok(
			taskOutput.endsWith("No package.json found"),
			"should print no package.json found msg to stderr"
		);
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
