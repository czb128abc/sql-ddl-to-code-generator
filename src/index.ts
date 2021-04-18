import * as changeCaseAll from 'change-case-all';
import type { JSONSchema7 } from 'json-schema';
import moment from 'moment';
import path from 'path';
import config from './config';
import { readAllSql } from './ddlSchema';
import { getFiles, readFile, writeFile } from './fileUtil';
import { artRender, calcEnumSrcList, parseEnumList } from './util';

function getArtTemplateData(schema: JSONSchema7) {
  const moduleName = `${schema.title}`;
  const list = Object.keys(schema.properties!).map((item) => {
    return {
      key: item,
      // title: schema.properties![item].,
      properties: schema.properties![item],
    };
  });
  const enumStrList = calcEnumSrcList(schema);
  const data = {
    schema,
    oneLevelName: config.oneLevelName,
    list,
    // @ts-ignore
    listKeyStr: JSON.stringify(Object.keys(schema.properties!, '', '  ')),
    functionName: schema.description,
    namespace: `${config.oneLevelName}${changeCaseAll.upperCaseFirst(moduleName)}`,
    moduleName,
    moduleNameUpperCaseFirst: changeCaseAll.upperCaseFirst(moduleName),
    // 当前时间
    currentDateTime: moment().endOf('second').format('YYYY-MM-DD HH:mm:ss'),
    // 当前日期
    currentDate: moment().format('YYYY-MM-DD'),
    enumList: parseEnumList([...enumStrList]),
  };
  // @ts-ignore
  data.JSONStr = JSON.stringify(data, '', '  ');
  return data;
}

export function dealJsonSchemas(schema: JSONSchema7) {
  const data = getArtTemplateData(schema);

  const files = getFiles(path.resolve(config.currentPath, './template'));
  files.forEach((item) => {
    const text = readFile(item.path);
    const targetText = artRender(text, data);
    const dirName = changeCaseAll.paramCase(data.schema.title!);
    if (item.dir.includes('template/mock')) {
      const rootDir = `${config.outputDir}/mock/${dirName}`;
      const targetDir = item.dir.replace(`${config.currentPath}/template/mock`, rootDir);
      const targetPath = `${targetDir}/${item.fileName.replace('.art', '')}`;
      writeFile(targetDir, targetPath, targetText);
    } else if (item.dir.includes('template/page')) {
      const pageRootDir = `${config.outputDir}/page/${changeCaseAll.paramCase(
        config.oneLevelName,
      )}/${dirName}`;
      const pageTargetDir = item.dir.replace(`${config.currentPath}/template/page`, pageRootDir);
      const pageTargetPath = `${pageTargetDir}/${item.fileName.replace('.art', '')}`;
      writeFile(pageTargetDir, pageTargetPath, targetText);
    }
  });
  return data;
}

export function main() {
  const list = readAllSql(`${config.currentPath}/sql-ddl.sql`);
  const data = list.map((item) => {
    return dealJsonSchemas(item);
  });
}

main();
