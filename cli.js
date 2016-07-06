#!/usr/bin/env node

'use strict';

var argv = require('minimist')(process.argv.slice(2), {
	boolean: ['all', 'help', 'multiple', 'info', 'version'],
	alias: {
		a: 'all',
		h: 'help',
		m: 'multiple',
		i: 'info',
		v: 'version'
	}
});
var exec = require('child_process').execSync;
var cwd = (function getCwd(dir) {
	return dir ? dir : process.cwd();
})(argv._[0]);
var tasks = (function getTasks(t) {
	try {
		require('pkginfo')(t, {dir: cwd, include: ['scripts']});
	} catch (e) {
		console.error('No package.json found');
		process.exit(1);
	}
	return t;
})({exports: {}});

require('./')(process, exec, console, cwd, tasks.exports.scripts, argv);

