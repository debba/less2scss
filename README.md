[![NPM](https://nodei.co/npm/less2scss.png)](https://nodei.co/npm/less2scss.png/)
[![npm version](https://badge.fury.io/js/less2scss.svg)](https://badge.fury.io/js/less2scss)

less2scss
-------------------

This npm package will convert all your less files to scss.

You can provide an entire folder, this package will scan all less files whose find in subfolders and it'll create SCSS files in the same folder or in the new directory provided recreating the source hierarchy. 

Install
-------------

Install it via npm:

```bash
$ npm install less2scss --global
```
Usage
------
`less2scss` offers a single command line interface:

```bash
$ less2scss
```

Will print an help:

```
Usage: less2scss [options]

This utility quickly converts all your less files to scss.

Options:
-V, --version                 output the version number
-s, --src <sourcePaths>       comma separated source paths
-d, --dst <dstPath>           destination path
-e, --exclude <excludePaths>  comma separated exclude paths
-r, --recursive               allow to recursively walk directories (default: false)
-h, --help                    display help for command
```

Options
--------
You can pass the following options via CLI arguments.

| Description                                                                                                                             | Short command | Full command       | Mandatory | Default value |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------ | ------------------ | ------------------ |
| Comma separated LESS files and paths                                                                                                    | `-s`          | `--src`            | Yes | - |
| Destination path for converted SCSS files (if provided). If not provided, it will be the same directory                                                          | `-d`          | `--dst` | No |   Same directory of files provided      |
| Comma separated exclude paths                                                        | `-e`          | `--exclude`            | No | - |
| Allow to recursively walk directories                                                          | `-r`          | `--recursive`            | No | false |

**Note:**

For excluding files and path we use [ignore](https://www.npmjs.com/package/ignore) package.

_`ignore` is a manager, filter and parser which implemented in pure JavaScript according to the .gitignore spec 2.22.1.

**All paths provided must be relative to the source path**

Examples
--------

#### Convert LESS files inside a folder excluding `node_modules` and `vendor` subfolders.

```bash
$ less2scss -s ./less_folder  -d ./scss_folder -r -e 'node_modules,vendor'
```

#### Convert LESS files inside a folder excluding all subfolders whose name begins with `test`.

```bash
$ less2scss -s ./less_folder  -d ./scss_folder -r -e 'node_modules,vendor'
```

Notice
--------
Be careful, something may not be converted properly.

It's an automatic conversion tool, you can fix errors manually later.

Credits
--------

Some convertion rules are inspired by:

- [Gulp Less to Scss](https://github.com/steelydylan/gulp-less-to-scss]) by steelydylan .
- [Less Scss Convertor](https://github.com/tarun29061990/less-scss-convertor) by 
tarun29061990 .

Contributing
--------
If you have suggestions for enhancements or ideas for new features that could be useful, please open a pull request or open an issue.

License
--------
less2scss is licensed under : The Apache Software License, Version 2.0. You can find a copy of the license (http://www.apache.org/licenses/LICENSE-2.0.txt)

Enjoy ;)
