"use strict";

const t = require("tap");
const { mockYargs } = require("./helpers");
const noop = () => null;

t.test("build a list using --descriptions-only option", (t) => {
	const ntl = t.mock("../../cli", {
		"read-package-json-fast": async () => ({
			scripts: {
				build: "make build",
				test: "make test",
			},
			ntl: {
				descriptions: {
					build: "Run build steps",
				},
			},
		}),
		ipt: (expected) => {
			t.strictSame(
				expected,
				[
					{
						name: "build › Run build steps",
						value: "build",
					},
				],
				"should build a list with the task names"
			);
			t.end();
			return Promise.resolve([]);
		},
		"simple-output": {
			hint: noop,
			node: noop,
			success: (msg) => null,
		},
		"yargs/yargs": mockYargs({
			_: [],
			descriptionsOnly: true,
		}),
		"signal-exit": noop,
	});
});

t.test(
	"build a list using --descriptions-only option along with --description",
	(t) => {
		const ntl = t.mock("../../cli", {
			"read-package-json-fast": async () => ({
				scripts: {
					build: "make build",
					test: "make test",
				},
				ntl: {
					descriptions: {
						build: "Run build steps",
					},
				},
			}),
			ipt: (expected) => {
				t.strictSame(
					expected,
					[
						{
							name: "build › Run build steps",
							value: "build",
						},
					],
					"should build a list with the task names"
				);
				t.end();
				return Promise.resolve([]);
			},
			"simple-output": {
				hint: noop,
				node: noop,
				success: (msg) => null,
			},
			"yargs/yargs": mockYargs({
				_: [],
				descriptions: true,
				descriptionsOnly: true,
			}),
			"signal-exit": noop,
		});
	}
);
