"use strict";

const path = require("path");

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl run using an absolute path argument", t => {
	const cwd = path.relative(
		__dirname,
		t.testdir({
			"package.json": JSON.stringify({
				scripts: {
					build: 'echo "build"'
				}
			})
		})
	);

	const cp = run({ cwd: __dirname }, [cwd]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then(res => {
		t.match(readLastLine(res), /build/, "should be able to run task");
		t.end();
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
