"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl run using --descriptions option but no description avail", (t) => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"',
			},
		}),
	});

	const cp = run({ cwd }, ["--descriptions"]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then((res) => {
		const taskOutput = res[0].toString().trim();
		t.ok(
			taskOutput.endsWith("No descriptions for your npm scripts found"),
			"should print warn message"
		);
		t.end();
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
