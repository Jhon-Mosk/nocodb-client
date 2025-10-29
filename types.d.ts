/* eslint-disable strict */
export type AnyObject = {
  [key: string]: any;
};

/**
 * Model for Bool
 */
export type BoolType = number | boolean | null;

/**
 * Model for ID
 */
export type IdType = string;

export type QueryParamsType = Record<string | number, any>;

/**
 * Model for TextOrNull
 */
export type TextOrNullType = string | null;

/**
 * Model for StringOrNullOrBooleanOrNumber
 */
export type StringOrNullOrBooleanOrNumberType =
  | string
  | null
  | boolean
  | number;

/**
 * Model for StringOrNull
 */
export type StringOrNullType = string | null;

/**
 * Model for Meta
 */
export type MetaType = null | object | string;
