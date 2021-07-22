const fs = require("fs");

const {CodeGenerator} = require("@babel/generator");
const {parse} = require("@babel/parser");

const skipComments = (fullPath, content) => {
    try {
        const inCode = parse(content, {
            sourceType: "module",
            sourceFilename: "./test.js",
            plugins: ["jsx", "typescript", "decorators-legacy"]
        });
        return new CodeGenerator(inCode, {
            comments: false,
            decoratorsBeforeExport: false
        }).generate().code;
    } catch (e) {
        console.log(fullPath + " has error when parse/generate \n", e);
    }

    return content;
};

const removeComments = (dirname, goInside = true) => {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            return;
        }

        filenames.forEach(function (filename) {
            const fullPath = dirname + filename;

            if (fs.lstatSync(fullPath).isDirectory()) {
                goInside && removeComments(fullPath + "/");
                return;
            }

            if (!(filename.endsWith("js") || filename.endsWith("jsx") || filename.endsWith("ts") || filename.endsWith("tsx"))) {
                console.log("skip " + fullPath);
                return;
            }

            fs.readFile(fullPath, 'utf-8', function (err, content) {
                if (err) {
                    console.log("can not read file " + fullPath, err);
                    return;
                }

                const outCode = skipComments(fullPath, content);
                fs.writeFile(fullPath, outCode, err => {
                    if (err) {
                        console.log("error " + fullPath, err);
                    } else {
                        console.log("done " + fullPath);
                    }
                });
            });
        });
    });
};

const [node, js, ...param] = process.argv;
const paths = param.filter((p, i) => i % 2 === 0);
const isRecursions = param.filter((p, i) => i % 2 === 1);

for (let i = 0; i < paths.length; i++) {
    let goInside = true;
    if (!!isRecursions[i]) {
        goInside = isRecursions[i] === "true";
    }
    removeComments(paths[i] + "/", goInside);
}
