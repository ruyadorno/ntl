# ntl

[![NPM version](https://badge.fury.io/js/ntl.svg)](https://npmjs.org/package/ntl)
[![Build Status](https://travis-ci.org/ruyadorno/ntl.svg?branch=master)](https://travis-ci.org/ruyadorno/ntl)
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/ruyadorno/ipt/master/LICENSE)
[![Join the chat at https://gitter.im/ipipeto/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipipeto/Lobby)

> Npm Task List

Interactive cli menu to list and run npm tasks.

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

<br />

## More info

cli options can also be invoked as their shorter alias:

- `-a` -> `--all`
- `-m` -> `--multiple`
- `-s` -> `--size`
- `-i` -> `--info`
- `-d` -> `--descriptions`
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

[MIT](LICENSE) © 2018 [Ruy Adorno](http://ruyadorno.com)

