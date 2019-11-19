"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl run using --version option", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"'
			}
		})
	});

	const cp = run({ cwd }, ["--version"]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then(res => {
		const taskOutput = res[0].toString().trim();
		t.equal(
			taskOutput,
			require("../../package.json").version,
			"should match current version of package"
		);
		t.end();
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
