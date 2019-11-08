"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl run using --version option", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"'
			}
		})
	});

	const run = spawn("node", ["../../../cli.js", "--version"], { cwd });
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res[0].toString().trim();
		t.equal(
			taskOutput,
			require("../../package.json").version,
			"should match current version of package"
		);
		t.end();
	});

	run.stdin.write("\n");
	run.stdin.end();
});
