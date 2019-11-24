<div align="center">
	<br>
	<br>
	<br>
	<img alt="ntl" width="300" src="https://ruyadorno.github.io/svg-demos/ntl/logo.min.svg">
	<br>
	<br>
	<br>
</div>

# Node Task List

[![NPM version](https://badge.fury.io/js/ntl.svg)](https://npmjs.org/package/ntl)
[![Build Status](https://travis-ci.org/ruyadorno/ntl.svg?branch=master)](https://travis-ci.org/ruyadorno/ntl)
[![Coverage Status](https://coveralls.io/repos/github/ruyadorno/ntl/badge.svg?branch=master)](https://coveralls.io/github/ruyadorno/ntl?branch=master)
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/ruyadorno/ipt/master/LICENSE)
[![Join the chat at https://gitter.im/ipipeto/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipipeto/Lobby)

Interactive cli tool that lists and run `package.json` scripts.

> An [iPipeTo](https://github.com/ruyadorno/ipt) workflow

<br />

## :arrow_down: Install

```
$ npm install -g ntl
```

<p align="center">
<img alt="demo animation" width="540" src="https://ruyadorno.github.io/svg-demos/ntl/examples/intro.svg" />
</p>

<br />

## :mag_right: Usage

Navigate to any folder containing a `package.json` file (usually a Node.js project) that has configured **scripts**, then just use the ntl command:

```sh
ntl
```

You can also specify a path to a project folder containing a `package.json` file:

```sh
ntl ./my-node-project
```

<br />

## :heart_eyes: Features

- Interactive interface that lists all `package.json` scripts
- Select any item in the interactive interface to execute that task
- Add descriptions to each task that can be shown in the UI
- Multiple interactive interfaces (menu list, autocomplete fuzzy search)
- Many options to customize the UI (exclude scripts, amount of items, etc)
- Easy to repeat last ran script (`nt` and `rerun` options)
- Run multiple tasks (can also easily repeat multiple ran tasks)
- Customize rerun cache options

## :books: Customize

### Custom runner

By default **Node Task List** tries to use [npm](https://github.com/npm/cli/) to run the configured `script` tasks. In case you want to use a custom runner (e.g: `yarn` or `pnpm`) you can set a environment variable.

That can be configured system-wide by setting the environment variable in your profile file (`.bashrc` or `.bash_profile` for macos). In case you only want to ever use **yarn** as your node task runner, you should set:

```sh
# .bashrc (linux) OR .bash_profile (macos)
export NTL_RUNNER=yarn
```

Keep in mind environment variables are flexible enough that they can also be set temporarily prior to running a command, so the following would also work:

```sh
NTL_RUNNER=yarn ntl
```

You can also define a `runner` in a per-project basis using the `ntl` configuration within your `package.json`, e.g:

```json
{
  "name": "<project>",
  "version": "1.0.0",
  "ntl": {
    "runner": "yarn"
  }
}
```

### Using task descriptions

You can define descriptions for your tasks in your `package.json` file by defining a `ntl` section, e.g:

```json
{
  "ntl": {
    "descriptions": {
      "build": "Builds the project",
      "coverage": "Run test outputing code coverage",
      "test": "Run project's tests"
    }
  }
}
```

These descriptions will be shown anytime you run `ntl`.

### Run in autocomplete or fuzzy search mode

Use `--autocomplete` or `-A` option in order to use an interface variation that allows you to type the name of the task instead of browsing through an arrow-based menu. This can be very useful when managing a long list of tasks.

```sh
$ ntl -A
⬢  Node Task List
? Select a task to run: t
❯ pretest
  test
  start
```

### Displaying task contents

Use the `--info` or simply `-i` option in order to display the contents of each script task, like:

```sh
⬢  Node Task List
? Select a task to run: (Use arrow keys)
❯ generate-manual › maked-man README.md > man/man1/ntl.1
          pretest › eslint cli.js rerun.js test
             test › cross-env NTL_NO_RERUN_CACHE=1 tap
```

Task contents will also be shown when using the `--descriptions` option and no description is available for a given item.

### Exclude tasks from UI

You can define a list of scripts to be excluded from the interactive menu using the `--exclude` option:

```
$ ntl -e coverall tasks
⬢  Node Task List
? Select a task to run: (Use arrow keys)
❯ test
  test:watch
```

You can also use a wildcard character to exclude multiple scripts:

```
$ ntl -e "test*"
⬢  Node Task List
? Select a task to run: (Use arrow keys)
❯ coveralls
  tasks
```

### Exclude tasks with missing descriptions

You can also filter out items that doesn't have a description using the `--descriptions-only` or `-o` option.

### Customize cache

**ntl** uses a cache system that stores the last ran command for each project in order to make it easier for users to repeat it. Given its importance, the following environment variables are available in order to customize its location and size:

- `NTL_RERUN_CACHE_DIR`: Defines a directory to store the cache file
- `NTL_RERUN_CACHE_NAME`: Filename to use for the cache
- `NTL_RERUN_CACHE_MAX`: Number of items to store in the cache (defaults to `10`)
- `NTL_NO_RERUN_CACHE`: When defined, avoid the cache system completely

For example, if a given user wanted to store its cache in `~/.ntl/cache` location and save up to 100 items in it, they could add the following to their `.bashrc` (linux) or `.bash_profile` (macos):

```sh
export NTL_RERUN_CACHE_DIR=$HOME
export NTL_RERUN_CACHE_NAME=cache
export NTL_RERUN_CACHE_MAX=100
```

The cache can also be customized through command line options:

- `--rerun-cache-dir` Defines a directory to store the cache file
- `--rerun-cache-name`: Filename to use for the cache
- `--no-rerun-cache`: Avoids the cache system completely

### UI Size

You can increase/reduce the size of the presented UI list using the `--size` or `-s` option. In this example we just increased the size of the list to show up to 12 items at once:

```
$ ntl -s 12
⬢  Node Task List
? Select a task to run:
❯ build
  generate-manual
  hello
  bomdia
  bonjour
  test
  test:dev
  test:ci
  test:integration
  test:unit
  test:e2e
  start
```

The default size value is 7 items.

<br />

## :arrows_counterclockwise: Repeat the last ran task

**ntl** provides many options to make it easier to rerun the last task, either through having it selected as default option the next time you run the `ntl` command, or by using one of the following:

- **The ultra convenient way**: `nt` command shorthand :sunglasses: (You should think of `nt` as: "ok, just run the last node task", in contrast to `ntl` which should be interpreted as: "ok, give me the node task list again") in case no previous task is available, running `nt` will behave exactly as `ntl`
- Using a `--rerun` or `-r` flag, e.g: `ntl -r`
- Prepending the `NTL_RERUN` env variable, e.g: `NTL_RERUN=true ntl`

<br />

## :m: Run multiple tasks

Using the `--multiple` or `-m` option, the interface becomes a checkbox-based list that allows you to select multiple tasks and run them in serial.

```sh
$ ntl -m
⬢  Node Task List
? Select a task to run:
 ◯ start
 ◉ test
❯◉ test:ci
```

Better yet, combine that with the **rerun** feature and you can repeat multiple tasks using the `nt` command.

<br />

## :white_check_mark: Tips

### ntl as default task

You can define `ntl` as a dev dependency and one of the tasks of your project, specially `start` - so whenever someone runs `npm start` or `yarn start` they get the convenient **ntl** interface. Like in the following `package.json` example:

```json
{
  "name": "<project>",
  "version": "1.0.0",
  "scripts": {
    "start": "ntl"
  },
  "devDependencies": {
    "ntl": "^5.0.0"
  }
}
```

### Exclude scripts

You can also define a task that invokes `ntl` while excluding other tasks, e.g:

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --coverage --watchAll",
    "coveralls": "jest --coverage --coverageReporters=text-lcov | coveralls",
    "tasks": "ntl --exclude coverall tasks"
  }
}
```

### Included command aliases

- `ntl` The default command
- `nodetasklist` Longhand version in case users have conflicting `ntl` commands
- `npm-tasklist` Legacy longhand version
- `nt` Rerun last script shortcut
- `nodetask` Rerun last script longhand


<br />

## :information_source: Help

Still feel like you could use some `--help` ?

```sh
Usage:
  ntl [<path>]             Build an interactive interface and run any script
  nt [<path>]              Rerun last executed script

Options:
  -a, --all                Includes pre and post scripts on the list   [boolean]
  -A, --autocomplete       Starts in autocomplete mode                 [boolean]
  -D, --debug              Prints to stderr any internal error         [boolean]
  -d, --descriptions       Displays the descriptions of each script    [boolean]
  -o, --descriptions-only  Limits output to scripts with a description [boolean]
  -h, --help               Shows this help message                     [boolean]
  -i, --info               Displays the contents of each script        [boolean]
  -e, --exclude            Excludes specific scripts                     [array]
  -m, --multiple           Allows the selection of multiple items      [boolean]
  -s, --size               Amount of lines to display at once           [number]
  --rerun-cache-dir        Defines the rerun task cache location        [string]
  --rerun-cache-name       Defines the rerun task cache filename        [string]
  --no-rerun-cache         Never write to or read from cache           [boolean]
  -v, --version            Show version number                         [boolean]
  -r, --rerun              Rerun last executed script                  [boolean]

Visit https://github.com/ruyadorno/ntl for more info
```

<br />

## License

[MIT](LICENSE) © 2019 [Ruy Adorno](http://ruyadorno.com)
