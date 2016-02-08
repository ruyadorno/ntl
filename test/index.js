var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var test = require('ava').test;
var tempfile = require('tempfile');
var ntl = require('../');
var pkg = require('../package');

// Mocked deps
var noop = function () {};
var obj = Object.freeze({});
var p;
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

test.beforeEach(function beforeEachTest() {
	var stdin = tempfile();
	fs.writeFileSync(stdin, '');
	p = {
		stdin: fs.createReadStream(stdin),
		stdout: fs.createWriteStream(tempfile()),
		stderr: fs.createWriteStream(tempfile())
	};
});

test.afterEach(function afterEachTest() {
	p = null;
});

test.cb(function shouldDisplayWelcomeTitle(t) {
	var testLog = {
		info: function (msg) {
			t.is(msg, 'Npm Task List - v' + pkg.version);
			t.end();
		}
	};
	ntl(p, exec, testLog, cwd, tasks, options);
});

test.cb(function shouldDisplayVersion(t) {
	var testLog = {
		info: function (msg) {
			t.is(msg, pkg.version.toString());
			t.end();
		}
	};
	ntl(p, exec, testLog, cwd, tasks, {version: true});
});

test.cb(function shouldDisplayHelp(t) {
	var testLog = {
		info: function (msg) {
			t.is(msg, pkg.version.toString());
			t.end();
		}
	};
	ntl(p, exec, testLog, cwd, tasks, {version: true});
});

test.cb(function shouldSelectDefaultTask(t) {
	var testExec = function (name, args) {
		t.is(name + ' ' + args.join(' '), 'npm run start');
		t.end();
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, options);
	prompt.rl.emit('line');
});

test.cb(function shouldSelectTask(t) {
	var testExec = function (name, args) {
		t.is(name + ' ' + args.join(' '), 'npm run build');
		t.end();
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, options);
	prompt.rl.input.emit('keypress', null, {name: 'down'});
	prompt.rl.input.emit('keypress', null, {name: 'down'});
	prompt.rl.emit('line');
});

test.cb(function shouldSelectPrefixedTasksWithAllFlag(t) {
	var testExec = function (name, args) {
		t.is(name + ' ' + args.join(' '), 'npm run pretest');
		t.end();
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, {all: true});
	prompt.rl.input.emit('keypress', null, {name: 'up'});
	prompt.rl.emit('line');
});

test.cb(function shouldSelectMultipleTasksUsingFlag(t) {
	var count = 0;
	var testExec = function (name, args) {
		t.ok(args[1] in {start: 1, debug: 1});
		if (++count > 1) {
			t.end();
		}
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, {multiple: true});
	prompt.rl.input.emit('keypress', ' ', {name: 'space'});
	prompt.rl.input.emit('keypress', null, {name: 'down'});
	prompt.rl.input.emit('keypress', ' ', {name: 'space'});
	prompt.rl.emit('line');
});

test.cb(function shouldNotFailOnNoTasksAvailable(t) {
	var testLog = {
		info: function (msg) {
			t.is(msg, 'There are no npm scripts available here');
			t.end();
		}
	};
	ntl(p, exec, testLog, cwd, obj, options);
});

// --- cli integration tests

test.cb(function shouldWorkFromCli(t) {
	var content = '';
	var run = spawn('node', ['../../cli.js'], {
		cwd: path.join(__dirname, '/fixtures'),
		stdin: p.stdin,
		stdout: p.stdout,
		stderr: p.stderr
	});
	run.stdout.on('data', function (data) {
		content += data.toString();
	});
	run.stderr.on('data', function (data) {
		console.error(data.toString());
	});
	run.on('close', function (code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split('\n');
		t.is('build', values[values.length - 2]);
		t.end();
	});
	run.stdin.write('\n');
	run.stdin.end();
});

test.cb(function shouldWorkFromCliWithPath(t) {
	var content = '';
	var run = spawn('node', ['../cli.js', './fixtures'], {
		cwd: cwd,
		stdin: p.stdin,
		stdout: p.stdout,
		stderr: p.stderr
	});
	run.stdout.on('data', function (data) {
		content += data.toString();
	});
	run.stderr.on('data', function (data) {
		console.error(data.toString());
	});
	run.on('close', function (code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split('\n');
		t.is('build', values[values.length - 2]);
		t.end();
	});
	run.stdin.write('\n');
	run.stdin.end();
});

test.cb(function shouldWorkFromCliWithParams(t) {
	var content = '';
	var run = spawn('node', ['../cli.js', './fixtures', '--all', '-m'], {
		cwd: cwd,
		stdin: p.stdin,
		stdout: p.stdout,
		stderr: p.stderr
	});
	run.stdout.on('data', function (data) {
		content += data.toString();
	});
	run.stderr.on('data', function (data) {
		console.error(data.toString());
	});
	run.on('close', function (code) {
		if (code !== 0) {
			t.fail();
		}
		var values = content.split('\n');
		t.is('prestart', values[values.length - 2]);
		t.end();
	});
	run.stdin.write('j');
	run.stdin.write('j');
	run.stdin.write(' ');
	run.stdin.write('\n');
	run.stdin.end();
});

