[![NPM](https://nodei.co/npm/less2scss.png)](https://nodei.co/npm/less2scss.png/)
[![npm version](https://badge.fury.io/js/less2scss.svg)](https://badge.fury.io/js/less2scss)

less2scss
-------------------

This npm package will convert all your less files to scss.

You can provide an entire folder, this package will scan all less files whose find in subfolders and it'll create SCSS files in the same folder or in the new directory provided recreating the source hierarchy. 

Installation
-------------

Install it via npm:

```	
$ npm install -g less2scss
```
Usage
------
Go to your terminal and type the following:
```
$ less2scss -s path1,path2,path3 -d [destinationFolder]
```
Paths could be a mixture of SCSS files and directories.

It will convert all of the scss files of the corresponding paths provided and will store the SCSS files in the destinationFolder if it's provided or in the same directory.

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

License
--------
less2scss is licensed under : The Apache Software License, Version 2.0. You can find a copy of the license (http://www.apache.org/licenses/LICENSE-2.0.txt)

Enjoy ;)
