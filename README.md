# ntl

[![NPM version](https://badge.fury.io/js/ntl.svg)](https://npmjs.org/package/ntl)
[![Build Status](https://travis-ci.org/ruyadorno/ntl.svg?branch=master)](https://travis-ci.org/ruyadorno/ntl)
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/ruyadorno/ipt/master/LICENSE)
[![Join the chat at https://gitter.im/ipipeto/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipipeto/Lobby)

Interactive cli tool that lists and run `package.json` scripts.

![demo gif](http://i.imgur.com/ZjjQ7Vi.gif?1)

> An [iPipeTo](https://github.com/ruyadorno/ipt) workflow

<br />

## Install

```
$ npm install -g ntl
```

**OR**

just run it at once using **npx**:

```sh
npx ntl
```

There's also a longhand command you can run if you experience conflicts:

```sh
npx -p ntl npm-tasklist
```

<br />

## Usage

**cd** to a folder containing a `package.json` files that has configured **scripts**, then:

```sh
ntl
```

You can also specify a project folder containing a `package.json` file:

```sh
ntl ./my-node-project
```

Longhand project folder example:

```sh
npm-tasklist ./my-node-project
```

<br />

## Custom runner

If you want to use a custom runner, e.g: `yarn` you can either use a environment variable:

```sh
NTL_RUNNER=yarn ntl
```

OR you can also define a `runner` property in the `ntl` configuration within your `package.json`:

```json
{
  "ntl": {
    "runner": "yarn"
  }
}
```

<br />

## Exclude scripts

Example _package.json_:

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

You can define a list of scripts to be excluded from the interactive menu:

```
$ ntl --exclude coverall tasks
✔  Npm Task List - v3.0.0
? Select a task to run: (Use arrow keys)
❯ test
  test:watch
  coveralls
```

You can also use a wildcard character to exclude multiple scripts with one string:

```
$ ntl --exclude "test*"
✔  Npm Task List - v3.0.0
? Select a task to run: (Use arrow keys)
❯ coveralls
  tasks
```

<br />

## Using task descriptions

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

These descriptions will be shown anytime you run ntl using the option: `ntl -d`

<br />

## More info

cli options can also be invoked as their shorter alias:

- `-a` -> `--all`
- `-m` -> `--multiple`
- `-s` -> `--size`
- `-i` -> `--info`
- `-d` -> `--descriptions`
- `-e` -> `--exclude`
- `-h` -> `--help`
- `-v` -> `--version`

Here is what the help page looks like:

```sh
ntl --help

Usage:
  ntl [<path>]

Options:
  -a, --all                Includes pre and post scripts on the list   [boolean]
  -A, --autocomplete       Starts in autocomplete mode                 [boolean]
  -D, --debug              Prints to stderr any internal error         [boolean]
  -d, --descriptions       Displays the descriptions of each script    [boolean]
  -e, --exclude            Excludes specific scripts                     [array]
  -o, --descriptions-only  Limits output to scripts with a description [boolean]
  -h, --help               Shows this help message                     [boolean]
  -i, --info               Displays the contents of each script        [boolean]
  -m, --multiple           Allows the selection of multiple items      [boolean]
  -s, --size               Amount of lines to display at once           [number]
  -v, --version            Show version number                         [boolean]

Visit https://github.com/ruyadorno/ntl for more info
```

<br />

## License

[MIT](LICENSE) © 2019 [Ruy Adorno](http://ruyadorno.com)
