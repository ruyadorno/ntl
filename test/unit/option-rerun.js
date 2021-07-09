"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

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

t.beforeEach(() => {
	const listeners = process.stdin.getMaxListeners();
	process.stdin.setMaxListeners(listeners + 1);
});

t.test("skip build interface using --rerun option", (t) => {
	setup(t);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			get() {
				return ["test"];
			}
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(
					cmd,
					'npm run "test"',
					"should skip interface and simply rerun previous command"
				);
				t.end();
			},
		},
		ipt: (expected) => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("skip build interface using NTL_RERUN env variable", (t) => {
	setup(t, {
		NTL_RERUN: "true",
	});
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			get() {
				return ["test"];
			}
		},
		child_process: {
			execSync: (cmd) => {
				t.equal(
					cmd,
					'npm run "test"',
					"should skip interface and simply rerun previous command"
				);
				t.end();
			},
		},
		ipt: (expected) => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
		}),
		"signal-exit": noop,
	});
});

t.test("no previous command using --rerun option", (t) => {
	setup(t);
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				test: "make test",
				build: "make build",
			},
		}),
		"lru-cache-fs": class {
			set() {}
			get() {
				return [];
			}
		},
		ipt: (expected) => {
			t.strictSame(
				expected,
				[
					{
						name: "test",
						value: "test",
					},
					{
						name: "build",
						value: "build",
					},
				],
				"should build a regular interface"
			);
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("fails on storing command", (t) => {
	setup(t);
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				test: "make test",
				build: "make build",
			},
		}),
		"lru-cache-fs": class {
			set() {
				t.ok("should access 'lru-cache-fs'.set command");
				throw new Error("ERR");
			}
			get() {}
		},
		ipt: (expected) => {
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: (msg) => {
				t.fail("should not warn");
			},
			error: () => {
				t.fail("should not error");
			},
		},
		"yargs/yargs": mockYargs({
			_: [],
		}),
		"signal-exit": noop,
	});
});

t.test("fails on retrieving commands", (t) => {
	setup(t);
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				test: "make test",
				build: "make build",
			},
		}),
		"lru-cache-fs": class {
			set() {}
			get() {
				throw new Error("ERR");
			}
		},
		ipt: (expected) => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: (msg) => {
				t.equal(
					msg,
					"Unable to retrieve commands to rerun",
					"should print warning message"
				);
			},
			error: () => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("rerun multiple cached tasks", (t) => {
	setup(t);
	t.plan(2);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			get() {
				return ["build", "test"];
			}
		},
		child_process: {
			execSync: (cmd) => {
				t.match(
					cmd,
					/npm run \"(build|test)\"/,
					"should run multiple commands"
				);
			},
		},
		ipt: (expected) => {
			t.fail("should not build interactive interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("use custom NTL_RERUN_CACHE_DIR option", (t) => {
	setup(t, {
		NTL_RERUN_CACHE_DIR: "/lorem",
	});
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ cwd }) {
				t.equal(
					cwd,
					"/lorem",
					"should use custom cache location defined in env variable"
				);
			}
		},
		child_process: {
			execSync: noop,
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("use custom NTL_RERUN_CACHE_NAME option", (t) => {
	setup(t, {
		NTL_RERUN_CACHE_NAME: "cache",
	});
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ cacheName, cwd }) {
				t.equal(
					cacheName,
					"cache",
					"should use custom cache name defined in env variable"
				);
			}
		},
		child_process: {
			execSync: noop,
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("use custom NTL_RERUN_CACHE_MAX option", (t) => {
	setup(t, {
		NTL_RERUN_CACHE_MAX: 3,
	});
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ max }) {
				t.equal(max, 3, "should use custom cache max value");
			}
		},
		child_process: {
			execSync: noop,
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("use string NTL_RERUN_CACHE_MAX option", (t) => {
	setup(t, {
		NTL_RERUN_CACHE_MAX: "3",
	});
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ max }) {
				t.equal(max, 3, "should use properly cast cache max value");
			}
		},
		child_process: {
			execSync: noop,
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("use undefined NTL_RERUN_CACHE_MAX option", (t) => {
	setup(t, {
		NTL_RERUN_CACHE_MAX: undefined,
	});
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ max }) {
				t.equal(max, 10, "should use default cast cache max value");
			}
		},
		child_process: {
			execSync: noop,
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("use custom --rerun-cache-dir option", (t) => {
	setup(t);
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ cwd }) {
				t.equal(cwd, "/foo/bar", "should use custom cache defined in option");
			}
		},
		child_process: {
			execSync: noop,
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
			rerunCacheDir: "/foo/bar",
		}),
		"signal-exit": noop,
	});
});

t.test("use custom --rerun-cache-name option", (t) => {
	setup(t);
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ cacheName }) {
				t.equal(
					cacheName,
					"cache-filename",
					"should use custom cache name in option"
				);
			}
		},
		child_process: {
			execSync: noop,
		},
		ipt: () => Promise.resolve([]),
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
			rerunCacheName: "cache-filename",
		}),
		"signal-exit": noop,
	});
});

t.test("--no-rerun-cache option", (t) => {
	setup(t);
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ cwd }) {
				t.fail("should not access cache");
			}
		},
		ipt: () => {
			t.ok("should build interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerunCache: false,
			rerun: true,
		}),
		"signal-exit": noop,
	});
});

t.test("NTL_NO_RERUN_CACHE env variable", (t) => {
	setup(t, {
		NTL_NO_RERUN_CACHE: "true",
	});
	t.plan(1);
	const ntl = t.mock("../../cli.js", {
		"signal-exit": noop,
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
		}),
		"lru-cache-fs": class {
			constructor({ cwd }) {
				t.fail("should not access cache");
			}
		},
		ipt: () => {
			t.ok("should build interface");
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: noop,
			warn: noop,
		},
		"yargs/yargs": mockYargs({
			_: [],
			rerun: true,
			rerunCache: "1",
		}),
		"signal-exit": noop,
	});
});
