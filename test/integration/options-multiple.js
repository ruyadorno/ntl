"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl run using --multiple option", (t) => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "BUILD TASK"',
				test: 'echo "TEST TASK"',
			},
		}),
	});

	const cp = run({ cwd }, ["--multiple"]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then((res) => {
		const taskOutput = res.toString().trim();
		t.contains(
			taskOutput,
			"BUILD TASK",
			"should be able to run first selected task"
		);
		t.contains(
			taskOutput,
			"TEST TASK",
			"should be able to run last selected task"
		);
		t.end();
	});

	cp.stdin.write(" ");
	cp.stdin.write("j");
	cp.stdin.write(" ");
	cp.stdin.write("\n");
	cp.stdin.end();
});
