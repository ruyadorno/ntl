"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl run using --descriptions-only option", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"',
				test: 'echo "test"'
			},
			ntl: {
				descriptions: {
					test: "Run tests"
				}
			}
		})
	});

	const run = spawn("node", ["../../../cli.js", "--descriptions-only"], {
		cwd
	});
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res[res.length - 1].toString().trim();
		t.equal(taskOutput, "test", "should run test that has descriptions");
		t.end();
	});

	run.stdin.write("\n");
	run.stdin.end();
});
