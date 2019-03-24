const fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    mkdirp = require('mkdirp');

const less2scss = (src, dst) => {
    if (src){
        const pathList = src.split(",");
        pathList.forEach(beginPath => {

            beginPath && beginPath.trim();

            /**
             * Resolve ~ with NodeJs
             */

            if (beginPath[0] === '~') {
                beginPath = path.join(process.env.HOME, beginPath.slice(1));
            }

            let curPathType = fs.lstatSync(beginPath),
                lessFiles = [],
                destinationPath = dst;

            if (curPathType.isDirectory()) {
                lessFiles = getFileList(beginPath, ".less");
            }

            if (curPathType.isFile()) {
                lessFiles.push(beginPath);
            }

            lessFiles.length && init(lessFiles, beginPath, destinationPath);

        });
    } else {
        console.log("No file entered.");
    }
};

const getFileList = (fromPath, validExt = ".less") => {

    let results = [];
    const list = fs.readdirSync(fromPath);

    list.forEach(function (file) {
        file = fromPath + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results.push(...getFileList(file, validExt));
        } else {
            let ext = path.extname(file),
                validExts = _.isArray(validExt) ? validExt : [validExt];

            ~validExts.indexOf(ext) && results.push(file);

        }
    });
    return results;
};

const init = (lessFiles, beginPath, destinationPath) => {
    lessFiles.forEach((file) => {
        replaceLess(file, beginPath, destinationPath);
    });
    console.log("Enjoy your SCSS files ;)");
};

const replaceLess = (file, beginPath, destinationPath) => {
    let content = fs.readFileSync(file, "utf8");
    const scssContent = content.replace(/\/less\//g, '/scss/')
        .replace(/\.less/g, '.scss')
        .replace(/@/g, '$')
        .replace(/\%\((.*?)\);/g,function(all){
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
        .replace(/@mixin\s*([\w\-]*)\s*\((.*);(.*)\)/g,function(all){
            all = all.replace(/;/g,',');
            return all;
        })
        .replace(/(\s)\.(hook[a-zA-Z\-\d]+);/g, '$1@include $2();')
        .replace(/(\s)\.([\w\-]*)\s*\((.*)\);*/g,'$1@include $2($3);')
        .replace(/(\s)\.([^\d\s\"]+);/g,'$1@include $2;')
        .replace(/@include\s*([\w\-]*)\s*\((.*);(.*)\)/g,function(all){
            all = all.replace(/;/g,',');
            return all;
        })
        .replace(/\).*?;!important/," !important)")
        .replace(/\$(import|charset|media|font-face|page[\s:]|-ms-viewport|keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes|-moz-document)/g, '@$1')
        .replace(/\$\{/g, '#{$')
        .replace(/~("[^"]+")/g, 'unquote($1)')
        .replace(/&:extend\((.*?)\)/g,"@extend $1")
        .replace(/@extend\s*(.*?)\s*?all;/g,"@extend $1;")
        .replace(/([\W])spin\(/g,'$1adjust-hue(')
        .replace(/(\W)fade\(([^)]+?)% *\)/g,'$1rgba($2%/100.0%)')
        .replace(/(\W)fade\(/g,'$1rgba(')
        .replace(/~(\s*['"])/g,'$1')
        .replace(/(.[\w\-]+?)&/g,"$1 &")
        .replace(/#([\w\-]*)\s*\{([^\}]*@mixin[\s\S]*)\}/g,function(all,$1,$2){
            all = all.replace(/#[\w\-]*\s*\{([^\}]*@mixin[\s\S]*)\}/,"$1");
            all = all.replace(/@mixin\s*([\w\-]*)/g,"@mixin "+$1+"_$1");
            return all;
        })
        .replace(/#([\w\-]*)\s*>\s@include\s([\w\-]*)\((.*)\);/g,"@include $1_$2($3);")
        .replace(/&(&+)/g, function(match, p1){return "&" + p1.replace(/&/g,"#{&}")});
    makeFile(file, scssContent, beginPath, destinationPath);
};

const makeFile = (file, scssContent, beginPath, destinationPath) => {

    const isFile = (file === beginPath),
        samePath = (beginPath === destinationPath);

    if (!samePath){
        if (!fs.existsSync(destinationPath)){
            mkdirp.sync(destinationPath);
        }
    }

    let fileBaseName = path.basename(file);

    if (isFile || !samePath){

        if (!isFile){
            destinationPath = path.dirname(
                file.replace(beginPath, destinationPath)
            );

            if (!fs.existsSync(destinationPath)){
                mkdirp.sync(destinationPath);
            }

        }

        if (!samePath)
            destinationPath+="/"+fileBaseName;

    }
    else {
        destinationPath+="/"+fileBaseName;
    }


    destinationPath = destinationPath.replace(".less", ".scss");

    fs.writeFileSync(destinationPath, scssContent);

    console.log("Finished writing to "+destinationPath);

};

module.exports = less2scss;
