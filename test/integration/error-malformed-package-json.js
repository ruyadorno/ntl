"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl found malformed package.json on current dir", t => {
	const cwd = t.testdir({
		"package.json": '{"name": "foo" "version": "1.0.0"}'
	});

	t.plan(2);

	const cp = run({
		cwd
	});
	cp.assertExitCode(t, 1, "should exit with error code");
	cp.getStderrResult().then(res => {
		const taskOutput = res.toString().trim();
		t.ok(
			taskOutput.endsWith("package.json contains malformed JSON"),
			"should print malformed package.json msg to stderr"
		);
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
