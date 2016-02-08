var fs = require('fs');
var test = require('ava').test;
var ntl = require('./');
var pkg = require('./package');

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
	fs.writeFileSync('./stdin', '');
	p = {
		stdin: fs.createReadStream('./stdin'),
		stdout: fs.createWriteStream('./stdout'),
		stderr: fs.createWriteStream('./stderr')
	};
});

test.afterEach(function afterEachTest() {
	try { fs.unlinkSync('./stdin'); } catch (e) {}
	try { fs.unlinkSync('./stdout'); } catch (e) {}
	try { fs.unlinkSync('./stderr'); } catch (e) {}
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
	var testExec = function (name, args, props) {
		t.is(name + ' ' + args.join(' '), 'npm run start');
		t.end();
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, options);
	prompt.rl.emit('line');
});

test.cb(function shouldSelectTask(t) {
	var testExec = function (name, args, props) {
		t.is(name + ' ' + args.join(' '), 'npm run build');
		t.end();
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, options);
	prompt.rl.input.emit('keypress', null, { name : 'down' });
	prompt.rl.input.emit('keypress', null, { name : 'down' });
	prompt.rl.emit('line');
});

test.cb(function shouldSelectPrefixedTasksWithAllFlag(t) {
	var testExec = function (name, args, props) {
		t.is(name + ' ' + args.join(' '), 'npm run pretest');
		t.end();
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, { all: true });
	prompt.rl.input.emit('keypress', null, { name : 'up' });
	prompt.rl.emit('line');
});

test.cb(function shouldSelectMultipleTasksUsingFlag(t) {
	var count = 0;
	var testExec = function (name, args, props) {
		t.ok(args[1] in {start: 1, debug:1});
		if (++count > 1) {
			t.end();
		}
	};
	var prompt = ntl(p, testExec, log, cwd, tasks, { multiple: true });
	prompt.rl.input.emit('keypress', ' ', { name : 'space' });
	prompt.rl.input.emit('keypress', null, { name : 'down' });
	prompt.rl.input.emit('keypress', ' ', { name : 'space' });
	prompt.rl.emit('line');
});

test.cb(function shouldNotFailOnNoTasksAvailable(t) {
	var testLog = {
		info: function (msg) {
			t.is(msg, 'There are no npm scripts available here');
			t.end();
		}
	};
	var prompt = ntl(p, exec, testLog, cwd, obj, options);
});

