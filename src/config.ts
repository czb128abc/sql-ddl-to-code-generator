import dotenv from 'dotenv';
import moment from 'moment';
import path from 'path';

dotenv.config();
export const removeTxt = `
SET FOREIGN_KEY_CHECKS = 1;
`;
export const removeTxt1 = `
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
`;

const {
  parentFuncName = 'system',
  outputDir = './output',
  sqlFilePath = './sql-ddl.sql',
} = process.env;

const dateTime = moment().endOf('second').format('YYYY-MM-DD_HH-mm-ss');
const config = {
  oneLevelName: parentFuncName,
  currentPath: process.cwd(),
  outputDir: path.resolve(process.cwd(), `${outputDir}/${dateTime}`),
  sqlFilePath: path.resolve(process.cwd(), sqlFilePath),
  enumList: [],
};
console.info('正在读取配置文件');
console.dir(config);
export default config;
