"use strict";

const os = require("os");
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

t.test("set default option on list", (t) => {
	setup(t);
	t.plan(2);
	const ntl = t.mock("../../cli", {
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
			execSync: () => null,
		},
		ipt: (expected, opts) => {
			t.strictSame(
				expected,
				[
					{
						name: "build",
						value: "build",
					},
					{
						name: "test",
						value: "test",
					},
				],
				"should build a regular interface"
			);
			t.strictSame(
				opts,
				{
					autocomplete: undefined,
					default: "test",
					"default-separator": os.EOL,
					message: "Select a task to run:",
					multiple: undefined,
					ordered: undefined,
					size: undefined,
				},
				"should set default option on ipt"
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
		}),
		"signal-exit": noop,
	});
});

t.test("set multiple default options", (t) => {
	setup(t);
	t.plan(2);
	const ntl = t.mock("../../cli", {
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
			execSync: () => null,
		},
		ipt: (expected, opts) => {
			t.strictSame(
				expected,
				[
					{
						name: "build",
						value: "build",
					},
					{
						name: "test",
						value: "test",
					},
				],
				"should build a regular interface"
			);
			t.strictSame(
				opts,
				{
					autocomplete: undefined,
					default: ["build", "test"].join(os.EOL),
					"default-separator": os.EOL,
					message: "Select a task to run:",
					multiple: undefined,
					ordered: undefined,
					size: undefined,
				},
				"should set default option on ipt"
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
		}),
		"signal-exit": noop,
	});
});
