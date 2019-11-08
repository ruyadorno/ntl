"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl found malformed package.json on current dir", t => {
	const cwd = t.testdir({
		"package.json": '{"name": "foo" "version": "1.0.0"}'
	});

	const run = spawn("node", ["../../../cli.js"], { cwd });

	t.plan(2);
	const ministream = new Minipass();
	run.stderr.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res.toString().trim();
		t.ok(
			taskOutput.endsWith("package.json contains malformed JSON"),
			"should print malformed package.json msg to stderr"
		);
	});

	run.on("close", function(code) {
		t.equal(code, 1, "should exit with error code");
	});

	run.stdin.write("\n");
	run.stdin.end();
});
