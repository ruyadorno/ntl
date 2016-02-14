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
var exec = require('child_process').spawnSync;
var cwd = (function getCwd(dir) {
	return dir ? dir : process.cwd();
})(argv._[0]);
var tasks = (function getTasks(t) {
	require('pkginfo')(t, {dir: cwd, include: ['scripts']});
	return t;
})({exports: {}});

require('./')(process, exec, console, cwd, tasks.exports.scripts, argv);

