const fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    glob = require('glob'),
    os = require('os'),
    colors = require('colors/safe'),
    replaceAll = require('string.prototype.replaceall');
const ignore = require("ignore");

const MESSAGE_PREFIX = {
    INFO: colors.yellow('[INFO]'),
    WARNING: colors.brightRed.bold('[WARNING]'),
    ERROR: colors.red.bold('[ERROR]'),
};

const resolve = (...pathSegments) => {
    let pathResolved =  path.resolve(...pathSegments);

    if (process.platform === 'win32') {
        pathResolved = pathResolved.split(path.sep).join("/");
    }

    return pathResolved;
}


const less2scss = (src, dst, recursive, exclude) => {
    if (src) {

        const pathList = src.split(','),
            excludedPaths = exclude && exclude.length > 0 ? exclude.split(',') : [];

        let lessFiles = [],
            destinationPath = dst;

        console.info(`${MESSAGE_PREFIX.INFO} ${colors.yellow(`Recursive option is ${colors.yellow.bold(recursive ? 'ON' : 'OFF')}`)}`);
        console.info(`${MESSAGE_PREFIX.INFO} ${colors.yellow(`Excluded paths: ${excludedPaths.length}`)}`);


        pathList.forEach(beginPath => {

            beginPath && beginPath.trim();

            if (beginPath[0] === '~') {
                beginPath = path.join(os.homedir(), beginPath.slice(1));
            }

            beginPath = resolve(beginPath);
            let curPathType = fs.lstatSync(beginPath);

            if (curPathType.isDirectory()) {

                let currLessFiles = ignore()
                    .add(excludedPaths).filter(
                        glob.sync(`${beginPath}/${recursive ? '**/*' : '*'}.less`, {
                            mark: true,
                            onlyFiles: true
                        }).map(
                            p => path.relative(beginPath, p)
                        )
                    ).map(
                        lessFile => ({
                            src: path.join(beginPath, lessFile),
                            relativePath: lessFile
                        })
                    )

                lessFiles = [...lessFiles, ...currLessFiles];

            }

            if (curPathType.isFile()) {
                lessFiles = [...lessFiles, {
                    src: beginPath,
                    relativePath: ''
                }];
            }

        });

        lessFiles = lessFiles
            .filter(
                ({src}, index) => lessFiles.map(lessFile => lessFile.src).indexOf(src) === index
            );

        if (lessFiles.length) {
            lessFiles.forEach(file => {
                const {src, relativePath} = file;
                const scssContent = replaceLess(src);
                writeFile(src, scssContent, destinationPath, relativePath);
            });
            console.log(`${MESSAGE_PREFIX.INFO} ${colors.green('Enjoy your SCSS files ;)')}`);
            console.log(`${colors.blue(`\n★ Pull requests and stars are always welcome.`)}`);
            console.log(`${colors.blue(`https://github.com/debba/less2scss`)}`);

        } else {
            console.log(`${MESSAGE_PREFIX.ERROR} ${colors.red.bold('No LESS file found.')}`);
        }
    } else {
        console.log(`${MESSAGE_PREFIX.ERROR} ${colors.red.bold('No file entered.')}`);
    }
};

const replaceLess = file => {
    let content = fs.readFileSync(file, 'utf8');
    let transformedContent = content.replace(/\/less\//g, '/scss/')
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
        })
        .replace(/@import +\( *css *\) +url/g, '@import url');

    // rewrite some built-in functions
    const mathBuiltInFunctions = ['pow', 'ceil', 'floor', 'round', 'min', 'max', 'abs', 'sqrt', 'sin', 'cos'];
    const regexMathBuiltIn = new RegExp(`\\b(${mathBuiltInFunctions.join('|')})\\(`, 'g');
    if (regexMathBuiltIn.test(transformedContent)) {
        transformedContent = '@use "sass:math";\n' + replaceAll(transformedContent, regexMathBuiltIn, (match, p1, index, input) => {
            console.log(`${MESSAGE_PREFIX.WARNING} There is math built-in function "${colors.bold(p1)}" check if rewrite is correct.\nFile ${file}:${input.substring(0, index).split('\n').length + 1}`)
            return `math.${match}`;
        });
    }

    return transformedContent;
};

const writeFile = (file, scssContent, destinationPath, relativePath) => {

    let outputFile;

    if (destinationPath) {

        const newPath = relativePath !== '' ? path.dirname(destinationPath + '/' + relativePath) : destinationPath;

        if (!fs.existsSync(newPath)) {
            mkdirp.sync(newPath);
        }

        outputFile = resolve(newPath, path.basename(file)).replace('.less', '.scss');
    } else {
        outputFile = file.replace('.less', '.scss');
    }

    fs.writeFileSync(outputFile, scssContent);

    console.log(`${colors.yellow('[INFO]')} Finished writing to ${outputFile}`);
};

module.exports = less2scss;
