"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl run but not package.json in current dir", t => {
	const cwd = t.testdir({
		"README.md": "# empty folder"
	});

	const run = spawn("node", ["../../../cli.js"], { cwd });

	t.plan(2);
	const ministream = new Minipass();
	run.stderr.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res.toString().trim();
		t.ok(
			taskOutput.endsWith("No package.json found"),
			"should print no package.json found msg to stderr"
		);
	});

	run.on("close", function(code) {
		t.equal(code, 1, "should exit with error code");
	});

	run.stdin.write("\n");
	run.stdin.end();
});
