"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("forward an option past -- ", (t) => {
	const _argv = process.argv;
	process.argv = process.argv.concat(["--", "--one-more-thing"]);
	t.teardown(() => {
		process.argv = _argv;
	});
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
			},
		}),
		ipt: () => {
			return Promise.resolve(["build"]);
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(
					cmd,
					'npm run "build" -- --one-more-thing',
					"should forward any trailing options"
				);
				t.end();
			},
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
		"signal-exit": noop,
	});
});

t.test("forward many options past -- ", (t) => {
	const _argv = process.argv;
	process.argv = process.argv.concat([
		"--",
		"--one-more-thing",
		"package.json",
		"--second-item",
		"-foo",
	]);
	t.teardown(() => {
		process.argv = _argv;
	});
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
			},
		}),
		ipt: () => {
			return Promise.resolve(["build"]);
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(
					cmd,
					'npm run "build" -- --one-more-thing package.json --second-item -foo',
					"should forward any trailing options"
				);
				t.end();
			},
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
		"signal-exit": noop,
	});
});
