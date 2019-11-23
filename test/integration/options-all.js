"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("run using --all option", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				pretest: 'echo "pretest"',
				test: 'echo "test"',
				posttest: 'echo "posttest"',
				prebuild: 'echo "prebuild"',
				build: 'echo "build"'
			}
		})
	});

	const cp = run({ cwd }, ["--all"]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then(res => {
		t.match(readLastLine(res), /prebuild/, "should run selected pre/post task");
		t.end();
	});

	cp.stdin.write("j");
	cp.stdin.write("j");
	cp.stdin.write("j");
	cp.stdin.write(" ");
	cp.stdin.write("\n");
	cp.stdin.end();
});
