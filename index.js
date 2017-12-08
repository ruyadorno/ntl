'use strict';

var inquirer = require('inquirer');
var pkg = require('./package');

module.exports = function (p, exec, log, cwd, tasks, options) {
	function printHelp() {
		log.info(
			'\nUsage:\n  ntl [<path>]\n' +
			'\nOptions:\n  -v --version   Displays app version number\n' +
			'  -h --help      Shows this help message\n' +
			'  -a --all       Includes pre and post scripts on the list\n' +
			'  -m --multiple  Allows a selection of multiple tasks to run at once\n' +
			'  -i --info      Displays the contents of each script'
		);
	}

	function printVersion() {
		log.info(pkg.version);
	}

	function filterPrefixes(taskName) {
		if (options.all) {
			return true;
		}

		var prefixes = [
			'pre',
			'post'
		];
		return !prefixes.some(function (prefix) {
			return taskName.slice(0, prefix.length) === prefix;
		});
	}

	function onPrompt(answer) {
		var values = answer.task;
		values = Array.isArray(values) ? values : [values];
		values.forEach(function (answer) {
			exec([
				'npm',
				'run',
				answer
			].join(' '), {
				cwd: cwd,
				stdio: [
					p.stdin,
					p.stdout,
					p.stderr
				]
			});
		});
	}

	function showList() {
		if (!tasks || !Object.keys(tasks).length) {
			log.info('There are no npm scripts available here');
			return;
		}

		log.info('Npm Task List - v' + pkg.version);

		var prompt = inquirer.createPromptModule({
			input: p.stdin,
			output: p.stdout
		});
		var promptChoices = Object.keys(tasks)
			.filter(filterPrefixes)
			.map(function (key) {
				var name = key;
				var idxComment = tasks[key].lastIndexOf('#');
				if (idxComment === -1) {
					name += (options.info ? ': ' + tasks[key] : '');
				} else {
					var comment = tasks[key].slice(idxComment + 1).trim();
					if (comment) {
						name += '(' + comment + ')';
					}
					name += (options.info ? ': ' + tasks[key].slice(0, idxComment) : '');
				}
				return {
					name: name,
					value: key
				};
			});
		var promptTypes = {
			base: {
				type: 'list',
				name: 'task',
				message: 'Select a task to run:',
				choices: promptChoices
			},
			multiple: {
				type: 'checkbox',
				name: 'task',
				message: 'Select tasks to run:',
				choices: promptChoices
			}
		};

		p.stdin.setEncoding('utf8');
		p.stdin.on('data', function (chunk) {
			if (chunk === '\u001b') { // ESC
				p.exit(0);
			}
		});

		return prompt(
			options.multiple ? promptTypes.multiple : promptTypes.base,
			onPrompt
		);
	}

	if (options.help) {
		printHelp();
	} else if (options.version) {
		printVersion();
	} else {
		return showList();
	}
};
