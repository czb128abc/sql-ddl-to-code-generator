import template from 'art-template';
import changeCaseAll from 'change-case-all';
import { JSONSchema7 } from 'json-schema';

interface EnumModel {
  name: string;
  comment: string;
  list: {
    enumKey: string;
    enumValue: string;
  }[];
}

const ENUM_SPLIT_KEY_TOP = ':';
const ENUM_SPLIT_KEY_NAME = '##';
const ENUM_SPLIT_KEY_VALUE_SETS = ',';
const ENUM_SPLIT_KEY_VALUE = '-';

export function isContainEnum(str: string) {
  let isContain = false;
  if (
    str.includes(ENUM_SPLIT_KEY_TOP) &&
    str.includes(ENUM_SPLIT_KEY_NAME) &&
    str.includes(ENUM_SPLIT_KEY_VALUE) &&
    str.includes(ENUM_SPLIT_KEY_VALUE)
  ) {
    isContain = true;
  }
  return isContain;
}

export function calcEnumSrcList(schema: JSONSchema7) {
  const enumStrList: string[] = [];
  Object.keys(schema.properties!).forEach((item) => {
    // @ts-ignore
    const str = `${item}${ENUM_SPLIT_KEY_NAME}${schema.properties![item].description}`;
    if (isContainEnum(replaceChinesePunctuation(str))) {
      enumStrList.push(str);
    }
  });
  return enumStrList;
}

export function replaceChinesePunctuation(str: string, replaceTrim: boolean = false) {
  const result = str.replace(/：/g, ':').replace(/，/g, ',').replace(/－/g, ',');
  if (replaceTrim) {
    return result.replace(/ /g, '');
  }
  return result;
}

/**
 * 批量解析枚举类型
    'close_type##关闭类型：MOBILE-手机，DEVICE-设备自停，SERVER-服务器，OVER_TIME-超时，OVER_AMOUNT-超额，OVER_ENERGY-超量',
 * @param enumStrList
 * @returns
 */
export function parseEnumList(enumStrList: string[]) {
  const list: EnumModel[] = [];
  enumStrList.forEach((item) => {
    // 处理中文标点符号
    const str = replaceChinesePunctuation(item, true);
    const [firstSet, secondSet] = str.split(ENUM_SPLIT_KEY_TOP);
    const [name, comment] = firstSet.split(ENUM_SPLIT_KEY_NAME);
    const enumKeyValueList = secondSet.split(ENUM_SPLIT_KEY_VALUE_SETS);
    const model: EnumModel = {
      name: `enum${changeCaseAll.upperCaseFirst(changeCaseAll.camelCase(name))}`.trim(),
      comment: `${comment}`.trim(),
      list: enumKeyValueList.map((keyValue) => {
        const [value, key] = keyValue.split(ENUM_SPLIT_KEY_VALUE);
        return {
          enumKey: key.trim(),
          enumValue: value.trim(),
        };
      }),
    };
    list.push(model);
  });
  return list;
}

export function artRender(source: string, data: any) {
  return template.render(source, data);
}

template.defaults.imports.camelCase = changeCaseAll.camelCase;
template.defaults.imports.paramCase = changeCaseAll.paramCase;
template.defaults.imports.upperCaseFirst = changeCaseAll.upperCaseFirst;
template.defaults.imports.log = console.log;
template.defaults.imports.replaceChinesePunctuation = replaceChinesePunctuation;

interface JSONSchemaProperties {
  description: string;
  type: string;
  maxLength: null;
  default: null | string | null;
  format: null | string;
}

function propertiesContainEnum(value: Record<string, JSONSchemaProperties>) {
  const { properties, key } = value;
  const str = `${key}${ENUM_SPLIT_KEY_NAME}${properties.description}`;
  return isContainEnum(replaceChinesePunctuation(str));
}

template.defaults.imports.calcMockValueForProperty = function (
  value: Record<string, JSONSchemaProperties>,
) {
  const { properties, key } = value;
  const str = `${key}${ENUM_SPLIT_KEY_NAME}${properties.description}`;
  if (isContainEnum(replaceChinesePunctuation(str))) {
    const enumModel = parseEnumList([str])[0];
    const valueListStr = JSON.stringify(enumModel.list.map((item) => item.enumValue));
    const keyListStr = JSON.stringify(enumModel.list.map((item) => item.enumKey));
    return `randomItem(${valueListStr}), // randomItem(${keyListStr})`;
  }
  if (properties.type === 'number') {
    return 'randomItem([12, 11, 10, 1])';
  }
  if (properties.format === 'date-time') {
    return 'newMoment().format(momentFormat.dateTime)';
  }

  return 'randomTitle(4,8)';
};

template.defaults.imports.calcFieldLabel = function (value: Record<string, JSONSchemaProperties>) {
  const { properties, key } = value;
  const str = `${key}${ENUM_SPLIT_KEY_NAME}${properties.description}`;
  if (isContainEnum(replaceChinesePunctuation(str))) {
    const enumModel = parseEnumList([str])[0];
    return `'${enumModel.comment}',// 添加枚举 fieldAttr.props: {allowClear: true,children: enumToOptions(${enumModel.name})},`;
  }
  return `'${properties.description}',`;
};

template.defaults.imports.calcFieldType = function (value: Record<string, JSONSchemaProperties>) {
  const { properties } = value;
  if (propertiesContainEnum(value)) {
    return 'select';
  }
  if (properties.type === 'number') {
    return 'text';
  }
  if (properties.format === 'date-time') {
    return 'datePicker';
  }

  return 'text';
};

template.defaults.imports.calcFieldOtherConfig = function (
  value: Record<string, JSONSchemaProperties>,
) {
  const { properties, key } = value;
  const str = `${key}${ENUM_SPLIT_KEY_NAME}${properties.description}`;
  if (propertiesContainEnum(value)) {
    const enumModel = parseEnumList([str])[0];
    return `{formatType: 'enum',enumObj: enumMap.${enumModel.name},}`;
  }
  let formatType = 'text';
  if (properties.type === 'number') {
    formatType = 'digit';
  }
  return `{ formatType:'${formatType}',}`;
};

template.defaults.imports.calcFieldFieldAttrProps = function (
  value: Record<string, JSONSchemaProperties>,
) {
  const { properties, key } = value;
  const str = `${key}${ENUM_SPLIT_KEY_NAME}${properties.description}`;
  if (propertiesContainEnum(value)) {
    const enumModel = parseEnumList([str])[0];
    return `{ allowClear: true, children: enumToOptions(enumMap.${enumModel.name}) }`;
  }
  return `{ }`;
};

export const artTemplate = template;
