"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl run and select first item", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"'
			}
		})
	});

	const cp = run({ cwd });
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then(res => {
		t.equal(readLastLine(res), "build", "should be able to run task");
		t.end();
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
