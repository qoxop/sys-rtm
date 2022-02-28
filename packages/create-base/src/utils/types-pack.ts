import fs from "fs";
import path from "path";
import { btkType, btkFile } from "@bricking/toolkit/dist";

import { paths } from "../../src/paths";
import { excludePackages } from "./constants";
import { getUserOptions } from "../../src/options";

export default () => {
    const cwd = process.cwd();
    const { bundle } = getUserOptions();
    let { defines = {}, output = './types' } = bundle.moduleDefines;
    if (!path.isAbsolute(output)) {
        output = path.resolve(cwd, output);
    }
    btkFile.del.sync(output);
    let hasIndex = false;
    Object.entries(defines).forEach(([key, value]) => {
        hasIndex = key === 'index';
        btkType.createTypeDefine({
            input: path.isAbsolute(value) ? value : path.resolve(cwd, value),
            output: path.resolve(output, `${key}.d.ts`),
            cwd,
        })
    });
    if (!fs.existsSync(paths.packageJson)) {
        throw new Error(`${paths.packageJson} 不存在～`);
    }
    const packageObj = require(paths.packageJson);
    delete packageObj.scripts;
    delete packageObj.publishConfig;
    delete packageObj.devDependencies;
    delete packageObj.main;

    const dependencies = packageObj.dependencies || {};

    Object.keys(dependencies).forEach(key => {
        if (dependencies[`@types/${key}`]) {
            delete dependencies[key];
        }
    })
    excludePackages
        .filter(name => name !== '@bricking/runtime')
        .forEach(name => dependencies[name] && (delete dependencies[name]));

    packageObj.peerDependencies = dependencies;
    delete packageObj.dependencies;

    if (hasIndex) {
        packageObj.types = 'index.d.ts';
    }
    fs.writeFileSync(
        path.resolve(output, './package.json'),
        JSON.stringify(packageObj, null, '\t'),
    );
    return output;
}