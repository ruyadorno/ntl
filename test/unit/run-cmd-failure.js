"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("fail to run a task", (t) => {
	const _processExit = process.exit;
	// process.exit has to be the last thing to run
	// otherwise teardown might run prior to process.exit(1)
	// from ./cli.js error handler
	process.exit = () => {
		t.end();
	};
	t.teardown(() => {
		process.exit = _processExit;
	});

	const path = t.testdir({
		"package.json": JSON.stringify({
			name: "run-cmd-failure",
			version: "1.0.0",
			scripts: {
				error: "exit 1",
			},
		}),
	});
	const ntl = t.mock("../../cli", {
		ipt: (expected) => {
			return Promise.resolve(["error"]);
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(cmd, 'npm run "error"', "should run error script");
				throw new Error("ERR");
			},
		},
		"simple-output": {
			error: (msg) => {
				t.match(msg, /Failed to run command:/, "should print error message");
			},
			hint: noop,
			node: noop,
			success: noop,
		},
		"signal-exit": noop,
		"yargs/yargs": mockYargs({
			_: [path],
		}),
	});
});
