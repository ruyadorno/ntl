"use strict";

var spawn = require("child_process").spawn;
var path = require("path");
var fs = require("fs");

var test = require("ava");
var tempdir = require("tempdir");
var tempfile = require("tempfile");
var pkg = require("../package");

// Mocked deps
var noop = function() {};
var obj = Object.freeze({});
var exec = noop;
var log = {
	info: noop
};
var cwd = process.cwd();
var tasks = {
	start: true,
	debug: true,
	postdebug: true,
	build: true,
	prebuild: true,
	test: true,
	pretest: true
};
var options = obj;

test.beforeEach(t => {
	var stdin = tempfile();
	fs.writeFileSync(stdin, "");
	t.context.p = {
		stdin: fs.createReadStream(stdin),
		stdout: fs.createWriteStream(tempfile()),
		stderr: fs.createWriteStream(tempfile())
	};
});

test.afterEach(t => {
	t.context.p = null;
});

// --- cli integration tests

test.cb('should work from cli', t => {
	var content = "";
	var run = spawn("node", ["../../cli.js"], {
		cwd: path.join(__dirname, "/fixtures")
	});
	run.stdout.on("data", function(data) {
		content += data.toString();
	});
	run.stderr.on("data", function(data) {
		console.error(data.toString());
	});
	run.on("close", function(code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split("\n");
		t.is("build", values[values.length - 2]);
		t.end();
	});
	run.stdin.write("\n");
	run.stdin.end();
});

test.cb('should work from cli with path', t => {
	var content = "";
	var run = spawn("node", ["../cli.js", "./fixtures"], {
		cwd: path.join(__dirname)
	});
	run.stdout.on("data", function(data) {
		content += data.toString();
	});
	run.stderr.on("data", function(data) {
		console.error(data.toString());
	});
	run.on("close", function(code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split("\n");
		t.is("build", values[values.length - 2]);
		t.end();
	});
	run.stdin.write("\n");
	run.stdin.end();
});

test.cb('should work from cli with params', t => {
	var content = "";
	var run = spawn("node", ["../cli.js", "./fixtures", "--all", "-m"], {
		cwd: path.join(__dirname)
	});
	run.stdout.on("data", function(data) {
		content += data.toString();
	});
	run.stderr.on("data", function(data) {
		console.error(data.toString());
	});
	run.on("close", function(code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split("\n");
		t.is("debugger", values[values.length -2]);
		t.end();
	});
	run.stdin.write("j");
	run.stdin.write("j");
	run.stdin.write(" ");
	run.stdin.write("\n");
	run.stdin.end();
});

test.cb('should work from cli excluded script', t => {
	var content = "";
	var run = spawn("node", ["../cli.js", "./fixtures", "--exclude", "debug*"], {
		cwd: path.join(__dirname)
	});
	run.stdout.on("data", function(data) {
		content += data.toString();
	});
	run.stderr.on("data", function(data) {
		console.error(data.toString());
	});
	run.on("close", function(code) {
		if (code !== 0) {
			t.fail();
		}
		t.is(/debug./gm.test(content), false);
		t.end();
	});
	run.stdin.write("j");
	run.stdin.write("j");
	run.stdin.write(" ");
	run.stdin.write("\n");
	run.stdin.end();
});

test.cb('should exit with error code on no package json', t => {
	tempdir()
		.then(function(foldername) {
			var run = spawn("node", [path.join(__dirname, "..", "cli.js")], {
				cwd: foldername
			});
			run.on("close", function(code) {
				t.is(code, 1);
				t.end();
			});
		})
		.catch(function(e) {
			console.error(e);
		});
});

test.cb('should exit with error msg on no package json', t => {
	tempdir()
		.then(function(foldername) {
			var run = spawn("node", [path.join(__dirname, "..", "cli.js")], {
				cwd: foldername
			});
			run.stderr.on("data", function(data) {
				t.is(data.toString(), "✖  No package.json found\n");
				t.end();
			});
		})
		.catch(function(e) {
			console.error(e);
		});
});

test.cb('should exit with error msg on malformed package.json', t => {
	var run = spawn("node", [path.join(__dirname, "..", "cli.js")], {
		cwd: path.join(__dirname, "/fixtures/malformed")
	});
	run.stderr.on("data", function(data) {
		t.is(data.toString(), "✖  package.json contains malformed JSON\n");
		t.end();
	});
});

test.cb('should print warn msg if using descriptions option but none found on package.json', t => {
	var content = "";
	var run = spawn("node", [path.join(__dirname, "..", "cli.js"), "--descriptions"], {
		cwd: path.join(__dirname, "/fixtures/missing-descriptions")
	});
	run.stdout.on("data", function(data) {
		content += data.toString();
	});
	run.stderr.on("data", function(data) {
		console.error(data.toString());
		t.fail();
	});
	run.on("close", function(code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split("\n");
		var expected = values[0];
		t.is("⚠  No descriptions for your echo scripts found", expected);
		t.end();
	});
	run.stdin.write("\n");
	run.stdin.end();
});

test.cb('should work with custom runner env variable', t => {
	var content = "";
	var run = spawn("node", ["../cli.js", "./fixtures"], {
		cwd: path.join(__dirname),
		env: {
			NTL_RUNNER: 'echo',
			...process.env
		}
	});
	run.stdout.on("data", function(data) {
		content += data.toString();
	});
	run.stderr.on("data", function(data) {
		console.error(data.toString());
	});
	run.on("close", function(code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split("\n");
		var expected = values[values.length - 2];
		t.is("run build", expected);
		t.end();
	});
	run.stdin.write("\n");
	run.stdin.end();
});

test.cb('should work with custom runner property', t => {
	var content = "";
	var run = spawn("node", ["../cli.js", "./fixtures/custom-runner"], {
		cwd: path.join(__dirname)
	});
	run.stdout.on("data", function(data) {
		content += data.toString();
	});
	run.stderr.on("data", function(data) {
		console.error(data.toString());
	});
	run.on("close", function(code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split("\n");
		var expected = values[values.length - 2];
		t.is("run build", expected);
		t.end();
	});
	run.stdin.write("\n");
	run.stdin.end();
});
