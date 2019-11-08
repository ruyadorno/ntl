"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl run using --multiple option", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "BUILD TASK"',
				test: 'echo "TEST TASK"'
			}
		})
	});

	const run = spawn("node", ["../../../cli.js", "--multiple"], { cwd });
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
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

	run.stdin.write(" ");
	run.stdin.write("j");
	run.stdin.write(" ");
	run.stdin.write("\n");
	run.stdin.end();
});
