"use strict";

const Minipass = require("minipass");
const { test } = require("tap");
const spawn = require("cross-spawn");

test("ntl forward trailing options past -- ", t => {
	const cwd = t.testdir({
		"package.json": JSON.stringify({
			scripts: {
				test: "node test.js"
			}
		}),
		"test.js": "console.log(process.argv.slice(2).join(''))"
	});

	const run = spawn(
		"node",
		["../../../cli.js", "--all", "--", "--one-more-thing"],
		{ cwd }
	);
	run.stderr.on("data", data => {
		console.error(data.toString());
		t.fail("should not have stderr output");
	});

	const ministream = new Minipass();
	run.stdout.pipe(ministream);
	ministream.collect().then(res => {
		const taskOutput = res[res.length - 1].toString().trim();
		t.equal(taskOutput, "--one-more-thing", "should forward trailing options");
		t.end();
	});

	run.stdin.write("\n");
	run.stdin.end();
});
