# ntl [![NPM version](https://badge.fury.io/js/ntl.svg)](https://npmjs.org/package/ntl) [![Build Status](https://travis-ci.org/ruyadorno/ntl.svg?branch=master)](https://travis-ci.org/ruyadorno/ntl)

> Npm Task List

Interactive cli menu to list and run npm tasks.

![demo gif](http://i.imgur.com/ZjjQ7Vi.gif?1)

## Install

```
$ npm install -g ntl
```


## Usage

**cd** to a folder containing a `package.json` files that has configured **scripts**, then:

```sh
ntl
```

You can also specify a project folder containing a `package.json` file:

```sh
ntl ./my-node-project
```


## More info

cli options can also be invoked as their shorter alias:

- `-a` -> `--all`
- `-m` -> `--multiple`
- `-i` -> `--info`
- `-h` -> `--help`
- `-v` -> `--version`

Here is what the help page looks like:

```sh
ntl --help

Usage:
  ntl [<path>]

Options:
  -v --version   Displays app version number
  -h --help      Shows this help message
  -a --all       Includes pre and post scripts on the list
  -m --multiple  Allows a selection of multiple tasks to run at once
  -i --info      Displays the contents of each script
```


## License

MIT © [Ruy Adorno](http://ruyadorno.com)

