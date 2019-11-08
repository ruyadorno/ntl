"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

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

	const run = spawn("node", ["../../../cli.js", "--all"], { cwd });
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res[res.length - 1].toString().trim();
		t.equal(taskOutput, "prebuild", "should run selected pre/post task");
		t.end();
	});

	run.stdin.write("j");
	run.stdin.write("j");
	run.stdin.write("j");
	run.stdin.write(" ");
	run.stdin.write("\n");
	run.stdin.end();
});
