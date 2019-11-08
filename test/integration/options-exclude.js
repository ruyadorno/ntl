"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl run using --exclude option", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"',
				test: 'echo "test"'
			}
		})
	});

	const run = spawn("node", ["../../../cli.js", "--exclude", "build"], { cwd });
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res[res.length - 1].toString().trim();
		t.equal(taskOutput, "test", "should not list excluded tasks");
		t.end();
	});

	run.stdin.write("\n");
	run.stdin.end();
});
