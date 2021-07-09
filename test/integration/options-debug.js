"use strict";

const t = require("tap");
const { readLastLine, run } = require("./helpers");

t.test("ntl run using --debug option", (t) => {
	const cwd = t.testdir({
		"package.json": "!!! not json",
	});

	const cp = run({ cwd }, ["--debug"]);
	cp.getStderrResult().then((res) => {
		const taskOutput = res.join("").toString().trim();
		t.match(taskOutput, /EJSONPARSE/, "should output error stack");
		t.end();
	});
});
