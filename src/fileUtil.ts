import * as fs from 'fs';

interface FileRule {
  path: string;
  dir: string;
  fileName: string;
}

const jsFilter = (pathItem: string) => {
  const fileSuffixes = ['ts', 'tsx', 'js', 'jsx', 'md'];
  const includes = fileSuffixes.includes(pathItem.split('.')[1]);
  return includes;
};

export function getFiles(dirPath: string) {
  const list: FileRule[] = [];
  const getLeaf = (path: string) => {
    const dirs = fs.readdirSync(path);
    dirs.forEach((pathItem) => {
      const states = fs.statSync(`${path}/${pathItem}`);
      if (states.isDirectory()) {
        getLeaf(`${path}/${pathItem}`);
      } else if (jsFilter(pathItem)) {
        const temp: FileRule = {
          path: `${path}/${pathItem}`,
          dir: path,
          fileName: pathItem,
        };
        list.push(temp);
      }
    });
  };
  getLeaf(dirPath);
  return list;
}

export function readFile(path: string): string {
  // @ts-ignore
  const result = fs.readFileSync(path, { encoding: 'utf-8' });
  return result;
}

export function writeFile(dir: string, path: string, text: string) {
  try {
    console.log('写入文件', path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path, text, { encoding: 'utf-8' });
  } catch (error) {
    console.log('🚀 ~ file: const.ts ~ line 41 ~ createFile ~ error', error);
  }
}
