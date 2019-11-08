"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl run and select first item", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"'
			}
		})
	});

	const run = spawn("node", ["../../../cli.js"], {
		cwd,
		env: Object.assign(
			{
				NTL_RUNNER: "echo"
			},
			process.env
		)
	});
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res[res.length - 1].toString().trim();
		t.equal(
			taskOutput,
			"run build",
			"should env variable-defined custom runner"
		);
		t.end();
	});

	run.stdin.write("\n");
	run.stdin.end();
});
