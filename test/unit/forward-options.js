"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");
const noop = () => null

test("forward an option past -- ", (t) => {
	const _argv = process.argv;
	process.argv = process.argv.concat(["--", "--one-more-thing"]);
	t.teardown(() => {
		process.argv = _argv;
	});
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
				},
			}),
		},
		ipt: () => {
			return Promise.resolve(["build"]);
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(
					cmd,
					"npm run build -- --one-more-thing",
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
	});
});

test("forward many options past -- ", (t) => {
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
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
				},
			}),
		},
		ipt: () => {
			return Promise.resolve(["build"]);
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(
					cmd,
					"npm run build -- --one-more-thing package.json --second-item -foo",
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
	});
});
