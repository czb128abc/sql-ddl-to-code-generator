import { Parser } from 'sql-ddl-to-json-schema';
import type { JSONSchema7 } from 'json-schema';
import { camelCase } from 'change-case-all';
import { readFile } from './fileUtil';

function convertSchemaData(srcJsonSchema: JSONSchema7) {
  const jsonSchema = { ...srcJsonSchema };
  jsonSchema.title = camelCase(jsonSchema.title!);
  const keys = Object.keys(jsonSchema.properties!);
  const properties = {};
  keys.forEach((key) => {
    properties[camelCase(key)] = jsonSchema.properties![key];
  });
  jsonSchema.properties = properties;
  return jsonSchema;
}

export function readAllSql(filePath: string): JSONSchema7[] {
  console.info('读取 sql 文件,等待写入文件');
  const ddlSql = readFile(filePath);
  const parser = new Parser('mysql');
  /**
   * Read on for available options.
   */
  const options = { useRef: false };
  parser.feed(ddlSql);

  /**
   * You can get the parsed results in JSON format...
   */
  const parsedJsonFormat = parser.results;

  /**
   * And pass it to be formatted in a compact JSON format...
   */
  const compactJsonTablesArray = parser.toCompactJson(parsedJsonFormat);
  const jsonSchemas: JSONSchema7[] = parser.toJsonSchemaArray(options, compactJsonTablesArray);
  return jsonSchemas.map((item) => convertSchemaData(item));
}

export function readSql(ddlText: string): JSONSchema7 {
  const parser = new Parser('mysql');
  /**
   * Read on for available options.
   */
  const options = { useRef: false };
  parser.feed(ddlText);

  /**
   * You can get the parsed results in JSON format...
   */
  const parsedJsonFormat = parser.results;

  /**
   * And pass it to be formatted in a compact JSON format...
   */
  const compactJsonTablesArray = parser.toCompactJson(parsedJsonFormat);
  const jsonSchema: JSONSchema7 = parser.toJsonSchemaArray(options, compactJsonTablesArray)[0];
  return convertSchemaData(jsonSchema);
}
