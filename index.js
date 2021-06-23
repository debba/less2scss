const fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    glob = require('glob'),
    os = require('os');

const less2scss = (src, dst) => {
    if (src) {
        const pathList = src.split(',');
        let lessFiles = [],
            destinationPath = dst;

        pathList.forEach(beginPath => {

            beginPath && beginPath.trim();

            /**
             * Resolve ~ with NodeJs
             */

            if (beginPath[0] === '~') {
                beginPath = path.join(os.homedir(), beginPath.slice(1));
            }

            beginPath = path.resolve(beginPath);

            let curPathType = fs.lstatSync(beginPath);

            if (curPathType.isDirectory()) {
                lessFiles = glob.sync(`${beginPath}/*.less`);
            }

            if (curPathType.isFile()) {
                lessFiles.push(beginPath);
            }

        });

        if (lessFiles.length) {
            lessFiles.forEach(file => {
                const scssContent = replaceLess(file);
                writeFile(file, scssContent, destinationPath);
            });
            console.log('Enjoy your SCSS files ;)');
        } else {
            console.log('No LESS file found.')
        }
    } else {
        console.log('No file entered.');
    }
};

const replaceLess = file => {
    let content = fs.readFileSync(file, 'utf8');
    return content.replace(/\/less\//g, '/scss/')
        .replace(/\.less/g, '.scss')
        .replace(/@/g, '$')
        .replace(/\%\((.*?)\);/g, function (all) {
            let arr = all.match(/argb\(.*?\)/g);
            if (arr instanceof Array) {
                for (let i = 0, n = arr.length; i < n; i++) {
                    arr[i] = arr[i].replace(/argb\(\$(.*?)\)/g, "${$1}");
                }
                all = all.replace(/,argb\(.*?\)/g, "");
                var i = -1;
                all = all.replace(/\%d/g, function (al) {
                    i++;
                    return arr[i];
                });
                all = all.replace(/\%/, '');
                return all;
            }
        })
        .replace(/ e\(/g, ' unquote(')
        .replace(/\.([\w\-]*)\s*\((.*)\)\s*\{/g, '@mixin $1($2){')
        .replace(/@mixin\s*([\w\-]*)\s*\((.*)\)\s*\{\s*\}/g, '// @mixin $1($2){}')
        .replace(/@mixin\s*([\w\-]*)\s*\((.*);(.*)\)/g, function (all) {
            all = all.replace(/;/g, ',');
            return all;
        })
        .replace(/(\s)\.(hook[a-zA-Z\-\d]+);/g, '$1@include $2();')
        .replace(/(\s)\.([\w\-]*)\s*\((.*)\);*/g, '$1@include $2($3);')
        .replace(/(\s)\.([^\d\s\"]+);/g, '$1@include $2;')
        .replace(/@include\s*([\w\-]*)\s*\((.*);(.*)\)/g, function (all) {
            all = all.replace(/;/g, ',');
            return all;
        })
        .replace(/\).*?;!important/, " !important)")
        .replace(/\$(import|charset|media|font-face|page[\s:]|-ms-viewport|keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes|-moz-document)/g, '@$1')
        .replace(/\$\{/g, '#{$')
        .replace(/~("[^"]+")/g, 'unquote($1)')
        .replace(/&:extend\((.*?)\)/g, "@extend $1")
        .replace(/@extend\s*(.*?)\s*?all;/g, "@extend $1;")
        .replace(/([\W])spin\(/g, '$1adjust-hue(')
        .replace(/(\W)fade\(([^)]+?)% *\)/g, '$1rgba($2%/100.0%)')
        .replace(/(\W)fade\(/g, '$1rgba(')
        .replace(/~(\s*['"])/g, '$1')
        .replace(/(.[\w\-]+?)&/g, "$1 &")
        .replace(/#([\w\-]*)\s*\{([^\}]*@mixin[\s\S]*)\}/g, function (all, $1, $2) {
            all = all.replace(/#[\w\-]*\s*\{([^\}]*@mixin[\s\S]*)\}/, "$1");
            all = all.replace(/@mixin\s*([\w\-]*)/g, "@mixin " + $1 + "_$1");
            return all;
        })
        .replace(/#([\w\-]*)\s*>\s@include\s([\w\-]*)\((.*)\);/g, "@include $1_$2($3);")
        .replace(/&(&+)/g, function (match, p1) {
            return "&" + p1.replace(/&/g, "#{&}")
        });
};

const writeFile = (file, scssContent, destinationPath) => {

    let outputFile;

    if (destinationPath) {
        if (!fs.existsSync(destinationPath)) {
            mkdirp.sync(destinationPath);
        }

        outputFile = path.resolve(destinationPath, path.basename(file)).replace('.less', '.scss');
    } else {
        outputFile = file.replace('.less', '.scss')
    }

    fs.writeFileSync(outputFile, scssContent);

    console.log('Finished writing to ' + outputFile);
};

module.exports = less2scss;
