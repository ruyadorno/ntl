require("babel-core/register")({
	ignore: function(filename) {
		return !(filename.indexOf("tempdir/index.js") > -1);
	}
});

var spawn = require("child_process").spawn;
var path = require("path");
var fs = require("fs");
var test = require("ava").test;
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

test.beforeEach(function beforeEachTest(t) {
	var stdin = tempfile();
	fs.writeFileSync(stdin, "");
	t.context.p = {
		stdin: fs.createReadStream(stdin),
		stdout: fs.createWriteStream(tempfile()),
		stderr: fs.createWriteStream(tempfile())
	};
});

test.afterEach(function afterEachTest(t) {
	t.context.p = null;
});

// --- cli integration tests

test.cb(function shouldWorkFromCli(t) {
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

test.cb(function shouldWorkFromCliWithPath(t) {
	var content = "";
	var run = spawn("node", ["../cli.js", "./fixtures"], {
		cwd: cwd
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

test.cb(function shouldWorkFromCliWithParams(t) {
	var content = "";
	var run = spawn("node", ["../cli.js", "./fixtures", "--all", "-m"], {
		cwd: cwd
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
		t.is("prestart", values[values.length - 2]);
		t.end();
	});
	run.stdin.write("j");
	run.stdin.write("j");
	run.stdin.write(" ");
	run.stdin.write("\n");
	run.stdin.end();
});

test.cb(function shouldExitWithErrorCodeOnNoPackageJson(t) {
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

test.cb(function shouldExitWithErrorMsgOnNoPackageJson(t) {
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
