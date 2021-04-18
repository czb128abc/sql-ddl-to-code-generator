import path from 'path';
export const removeTxt = `
SET FOREIGN_KEY_CHECKS = 1;
`;
export const removeTxt1 = `
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
`;
export default {
  oneLevelName: 'basicDataMgt',
  currentPath: process.cwd(),
  outputDir: path.resolve(process.cwd(), './output'),
  enumList: [
    'close_type##关闭类型：MOBILE-手机，DEVICE-设备自停，SERVER-服务器，OVER_TIME-超时，OVER_AMOUNT-超额，OVER_ENERGY-超量',
  ],
};
