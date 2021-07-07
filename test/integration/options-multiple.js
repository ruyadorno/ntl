"use strict";

const t = require("tap");
const { run } = require("./helpers");

t.test("ntl run using --multiple option", (t) => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "BUILD TASK"',
				test: 'echo "TEST TASK"',
			},
		}),
	});

	const cp = run({ cwd }, ["--multiple", "--no-rerun-cache"]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then((res) => {
		const out = res.join('').trim();
		t.match(
			out,
			/BUILD TASK/,
			"should be able to run first selected task"
		);
		t.match(
			out,
			/TEST TASK/,
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
