"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl run using --autocomplete option", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"',
				start: 'echo "start"',
				test: 'echo "test"'
			}
		})
	});

	const cp = run({ cwd }, ["--autocomplete"]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then(res => {
		t.match(
			readLastLine(res),
			/test/,
			"should be able to select using autocomplete"
		);
		t.end();
	});

	cp.stdin.write("t");
	cp.stdin.write("e");
	cp.stdin.write("\n");
	cp.stdin.end();
});
