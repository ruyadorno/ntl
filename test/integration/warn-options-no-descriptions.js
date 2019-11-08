"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl run using --descriptions option but no description avail", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"'
			}
		})
	});

	const run = spawn("node", ["../../../cli.js", "--descriptions"], { cwd });
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res[0].toString().trim();
		t.ok(
			taskOutput.endsWith("No descriptions for your npm scripts found"),
			"should print warn message"
		);
		t.end();
	});

	run.stdin.write("\n");
	run.stdin.end();
});
