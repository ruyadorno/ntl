"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

test("skip build interface using --rerun option", t => {
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
					test: "make test"
				}
			})
		},
		conf: class {
			get() {
				return ["test"];
			}
		},
		child_process: {
			execSync: cmd => {
				t.equal(
					cmd,
					"npm run test",
					"should skip interface and simply rerun previous command"
				);
				t.end();
			}
		},
		ipt: expected => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true
		})
	});
});

test("no previous command using --rerun option", t => {
	t.plan(2);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
					build: "make build"
				}
			})
		},
		conf: class {
			set() {}
			get() {}
		},
		ipt: expected => {
			t.deepEqual(
				expected,
				[
					{
						name: "test",
						value: "test"
					},
					{
						name: "build",
						value: "build"
					}
				],
				"should build a regular interface"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null,
			warn: msg => {
				t.equal(
					msg,
					"No previous task available",
					"should print a warning message"
				);
			}
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true
		})
	});
});

test("fails on storing command", t => {
	t.plan(0);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
					build: "make build"
				}
			})
		},
		conf: class {
			set() {
				throw new Error("ERR");
			}
			get() {}
		},
		ipt: expected => {
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null,
			error: () => {
				t.fail("should not error");
			}
		},
		"yargs/yargs": mockYargs({
			_: []
		})
	});
});

test("fails on retrieving commands", t => {
	t.plan(0);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					test: "make test",
					build: "make build"
				}
			})
		},
		conf: class {
			set() {}
			get() {
				throw new Error("ERR");
			}
		},
		ipt: expected => {
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null,
			warn: () => null,
			error: () => {
				t.fail("should not error");
			}
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true
		})
	});
});

test("rerun multiple cached tasks", t => {
	t.plan(2);
	const ntl = requireInject("../../cli", {
		"read-pkg": {
			sync: () => ({
				scripts: {
					build: "make build",
					test: "make test"
				}
			})
		},
		conf: class {
			get() {
				return ["build", "test"];
			}
		},
		child_process: {
			execSync: cmd => {
				t.ok(cmd.startsWith("npm run"), "should run multiple commands");
			}
		},
		ipt: expected => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true
		})
	});
});
