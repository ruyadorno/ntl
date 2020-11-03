"use strict";

const { test } = require("tap");
const { readLastLine, run } = require("./helpers");

function setup(t, env) {
	const _env = process.env;
	delete process.env.NTL_NO_RERUN_CACHE;

	process.env = {
		...process.env,
		...env,
	};

	t.teardown(() => {
		process.env = _env;
	});
}

test("ntl run and select first item", (t) => {
	setup(t);
	const cwd = t.testdir({
		"ntl-rerun-cache": `[{"k": "${t
			.testdir()
			.split("\\")
			.join("/")}", "v": [ "build" ], "e": 0 }]`,
		"package.json": JSON.stringify({
			scripts: {
				build: 'echo "build"',
			},
		}),
	});

	const cp = run({ alias: "rerun.js", cwd }, ["--rerun-cache-dir", cwd]);
	cp.assertNotStderrData(t);
	cp.getStdoutResult().then((res) => {
		t.match(readLastLine(res), /build/, "should be able to run task");
		t.end();
	});
});
