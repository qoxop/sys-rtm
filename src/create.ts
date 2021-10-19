/**
 * 创建模版
 */
import path from 'path';
import { bufferString, fileTransfer } from './utils/fs-tools';

const templatesDir = path.resolve(__dirname, '../templates');

const DefaultTemplate = {
    name: 'my-app-name',
    path: path.resolve(templatesDir, './default'),
    getTransform: (name: string) => bufferString((_: string, code: string) => code.replace('my-app-name', name))
}

const templates: {[key: string]: typeof DefaultTemplate } = {
    default: DefaultTemplate,
}

export const create = async (tplName = 'default', name = 'my-app') => {
    const template = templates[tplName];
    if (template) {
        fileTransfer(
            template.path,
            path.resolve(process.cwd(), `./${name}`),
            template.getTransform(name)
        )
    } else {
        throw new Error(`${tplName} 模版不存在～`);
    }
}