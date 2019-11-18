"use strict";

const { test } = require("tap");
const requireInject = require("require-inject");
const { mockYargs } = require("./helpers");

function setup(t, env) {
	const _env = process.env;
	delete process.env.NTL_NO_RERUN_CACHE;

	process.env = {
		..._env,
		...env
	};

	t.teardown(() => {
		process.env = _env;
	});
}

test("skip build interface using --rerun option", t => {
	setup(t);
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

test("skip build interface using NTL_RERUN env variable", t => {
	setup(t, {
		NTL_RERUN: "true"
	});
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
			_: []
		})
	});
});

test("no previous command using --rerun option", t => {
	setup(t);
	t.plan(1);
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
				return [];
			}
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
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null,
			warn: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true
		})
	});
});

test("fails on storing command", t => {
	setup(t);
	t.plan(1);
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
				t.ok("should access conf.set command");
				throw new Error("ERR");
			}
			get() {}
		},
		ipt: expected => {
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null,
			warn: msg => {
				t.fail("should not warn");
			},
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
	setup(t);
	t.plan(1);
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
		ipt: expected => Promise.resolve([]),
		"simple-output": {
			success: () => null,
			warn: msg => {
				console.error(msg);
				t.equal(
					msg,
					"Unable to retrieve commands to rerun",
					"should print warning message"
				);
			},
			error: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true
		})
	});
});

test("rerun multiple cached tasks", t => {
	setup(t);
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

test("use custom NTL_RERUN_CACHE option", t => {
	setup(t, {
		NTL_RERUN_CACHE: "/lorem"
	});
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
			constructor({ cwd }) {
				t.equal(
					cwd,
					"/lorem",
					"should use custom cache defined in env variable"
				);
			}
		},
		child_process: {
			execSync: () => null
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			success: () => null,
			warn: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true
		})
	});
});

test("use custom --rerun-cache option", t => {
	setup(t);
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
			constructor({ cwd }) {
				t.equal(cwd, "/foo/bar", "should use custom cache defined in option");
			}
		},
		child_process: {
			execSync: () => null
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			success: () => null,
			warn: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
			rerunCache: "/foo/bar"
		})
	});
});

test("--no-rerun-cache option", t => {
	setup(t);
	t.plan(1);
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
			constructor({ cwd }) {
				t.fail("should not acess cache");
			}
		},
		ipt: () => {
			t.ok("should build interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null,
			warn: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			noRerunCache: true,
			rerun: true,
			rerunCache: "/foo/bar"
		})
	});
});

test("NTL_NO_RERUN_CACHE env variable", t => {
	setup(t, {
		NTL_NO_RERUN_CACHE: "true"
	});
	t.plan(1);
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
			constructor({ cwd }) {
				t.fail("should not acess cache");
			}
		},
		ipt: () => {
			t.ok("should build interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			success: () => null,
			warn: () => null
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
			rerunCache: "/foo/bar"
		})
	});
});
