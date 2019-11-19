"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

test("ntl forward trailing options", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				test: "node test.js"
			}
		}),
		"test.js": "console.log(process.argv.slice(2).join(''))"
	});

	const cp = run({ cwd }, ["--all", "--", "--one-more-thing"]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then(res => {
		t.equal(
			readLastLine(res),
			"--one-more-thing",
			"should forward trailing options"
		);
		t.end();
	});

	cp.stdin.write("\n");
	cp.stdin.end();
});
