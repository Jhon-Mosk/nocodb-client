/* eslint-disable strict */
import {
  AnyObject,
  BoolType,
  IdType,
  MetaType,
  StringOrNullOrBooleanOrNumberType,
  StringOrNullType,
  TextOrNullType,
} from './types';

export interface BaseQueryParams {
  /** Название полей перечисленные через запятую. */
  fields?: string;
  /** Название полей перечисленные через запятую для сортировки строк, строки будут сортироваться в порядке возрастания на основе предоставленных столбцов. Для сортировки по убыванию укажите префикс - вместе с именем столбца. */
  sort?: string;
  /** Можно использовать для фильтрации строк, которая принимает сложные условия. Подробнее: https://docs.nocodb.com/developer-resources/rest-apis#comparison-operators. */
  where?: string;
  /** Используется для разбиения на страницы, размер коллекции ответов зависит от значения ограничения со значением по умолчанию 25 и максимальным значением 1000. */
  limit?: number;
  /** Используется для разбиения на страницы, ответ будет перемешан, если для него установлено значение 1. */
  shuffle?: string;
  /** Используется для нумерации страниц, значение помогает выбрать коллекцию из определенного индекса. */
  offset?: number;
  [key: string]: any;
}

/**
 * Model for Paginated
 */
export interface PaginatedType {
  /** Is the current page the first page */
  isFirstPage?: boolean;
  /** Is the current page the last page */
  isLastPage?: boolean;
  /**
   * The current page
   * @example 1
   */
  page?: number;
  /**
   * The current offset and it will be present only when the page is not included
   * @example 1
   */
  offset?: number;
  /**
   * The number of pages
   * @example 10
   */
  pageSize?: number;
  /**
   * The number of rows in the given result
   * @example 1
   */
  totalRows?: number;
}

export interface TableRecords {
  list: AnyObject[];
  pageInfo: PaginatedType;
}

/**
 * Model for Attachment Request
 */
export interface AttachmentReqType {
  /** The mimetype of the attachment */
  mimetype?: string;
  /** The file path of the attachment */
  path?: string;
  /** The size of the attachment */
  size?: number;
  /** The title of the attachment used in UI */
  title?: string;
  /** Attachment URL to be uploaded via upload-by-url */
  url?: string;
  /** The name of the attachment file name */
  fileName?: string;
}

/**
 * Model for Hook
 */
export interface HookType {
  /** Is the hook active? */
  active?: BoolType;
  /** Is the hook aysnc? */
  async?: BoolType;
  /**
   * Hook Description
   * @example This is my hook description
   */
  description?: string;
  /**
   * Environment for the hook
   * @example all
   */
  env?: string;
  /**
   * Event Type for the operation
   * @example after
   */
  event?: 'after' | 'before' | 'manual';
  /**
   * Foreign Key to Model
   * @example md_rsu68aqjsbyqtl
   */
  fk_model_id?: string;
  /** Unique ID */
  id?: IdType;
  /** Hook Notification including info such as type, payload, method, body, and etc */
  notification?: object | string;
  /**
   * Hook Operation
   * @example insert
   */
  operation?:
    | 'insert'
    | 'update'
    | 'delete'
    | 'bulkInsert'
    | 'bulkUpdate'
    | 'bulkDelete'
    | 'trigger';
  /**
   * Retry Count
   * @example 10
   */
  retries?: number;
  /**
   * Retry Interval
   * @example 60000
   */
  retry_interval?: number;
  /**
   * Timeout
   * @example 60000
   */
  timeout?: number;
  /**
   * Hook Title
   * @example My Webhook
   */
  title?: string;
  /** Hook Type */
  type?: string;
  /**
   * Hook Version
   * @example v2
   */
  version?: 'v1' | 'v2';
}

/**
 * Model for Formula
 */
export interface FormulaType {
  /** Error Message */
  error?: string;
  /** Foreign Key to Column */
  fk_column_id?: IdType;
  /**
   * Formula with column ID replaced
   * @example CONCAT("FOO", {{cl_c5knoi4xs4sfpt}})
   */
  formula?: string;
  /**
   * Original Formula inputted in UI
   * @example CONCAT("FOO", {Title})
   */
  formula_raw?: string;
  /** Unique ID */
  id?: IdType;
  /** Parsed Formula Tree */
  parsed_tree?: any;
}

/**
 * Model for LinkToAnotherRecord
 */
export interface LinkToAnotherRecordType {
  deleted?: string;
  dr?: string;
  fk_child_column_id?: string;
  /** Foreign Key to Column */
  fk_column_id?: IdType;
  fk_index_name?: string;
  fk_relation_view_id?: string;
  fk_mm_child_column_id?: string;
  fk_mm_model_id?: string;
  fk_mm_parent_column_id?: string;
  fk_parent_column_id?: string;
  fk_related_model_id?: string;
  /** Unique ID */
  id?: IdType;
  order?: string;
  type?: string;
  ur?: string;
  /** Model for Bool */
  virtual?: BoolType;
}

/**
 * Model for Lookup
 */
export interface LookupType {
  /** Unique ID */
  id?: IdType;
  /** Foreign Key to Column */
  fk_column_id?: IdType;
  /** Foreign Key to Lookup Column */
  fk_lookup_column_id?: IdType;
  /** Foreign Key to Relation Column */
  fk_relation_column_id?: IdType;
  /**
   * The order among the list
   * @example 1
   */
  order?: number;
}

/**
 * Model for Rollup
 */
export interface RollupType {
  /** Unique ID */
  id?: IdType;
  /** Foreign Key to Column */
  fk_column_id?: IdType;
  /** Foreign to Relation Column */
  fk_relation_column_id?: IdType;
  /** Foreign to Rollup Column */
  fk_rollup_column_id?: IdType;
  /**
   * Rollup Function
   * @example count
   */
  rollup_function?:
    | 'count'
    | 'min'
    | 'max'
    | 'avg'
    | 'sum'
    | 'countDistinct'
    | 'sumDistinct'
    | 'avgDistinct';
}

/**
 * Model for SelectOption
 */
export interface SelectOptionType {
  /** Unique ID */
  id?: IdType;
  /**
   * Option Title
   *
   * @example Option A
   */
  title?: string;
  /** Foreign Key to Column */
  fk_column_id?: IdType;
  /**
   * Option Color
   * @example #cfdffe
   */
  color?: string;
  /**
   * The order among the options
   * @example 1
   */
  order?: number;
}

/**
 * Model for SelectOptions
 */
export interface SelectOptionsType {
  /** Array of select options */
  options: SelectOptionType[];
}

/**
 * Model for Column
 */
export interface ColumnType {
  /** Is Auto-Increment? */
  ai?: BoolType;
  /** Auto Update Timestamp */
  au?: BoolType;
  /** Column Description */
  description?: TextOrNullType;
  /**
   * Source ID that this column belongs to
   * @example ds_krsappzu9f8vmo
   */
  source_id?: string;
  /** Column Comment */
  cc?: string;
  /** Column Default */
  cdf?: StringOrNullOrBooleanOrNumberType;
  /** Character Maximum Length */
  clen?: number | null | string;
  /** Column Options */
  colOptions?:
    | FormulaType
    | LinkToAnotherRecordType
    | LookupType
    | RollupType
    | SelectOptionsType
    | object
    | (FormulaType &
        LinkToAnotherRecordType &
        LookupType &
        RollupType &
        SelectOptionsType &
        object);
  /**
   * Column Name
   * @example title
   */
  column_name?: string;
  /** Column Ordinal Position */
  cop?: string;
  /** Character Set Name */
  csn?: StringOrNullType;
  /**
   * Column Type
   * @example varchar(45)
   */
  ct?: string;
  /** Is Deleted? */
  deleted?: BoolType;
  /**
   * Data Type in DB
   * @example varchar
   */
  dt?: string;
  /**
   * Data Type X
   * @example specificType
   */
  dtx?: string;
  /** Data Type X Precision */
  dtxp?: null | number | string;
  /** Data Type X Scale */
  dtxs?: null | number | string;
  /**
   * Model ID that this column belongs to
   * @example md_yvwvbt2i78rgcm
   */
  fk_model_id?: string;
  /** Unique ID */
  id?: IdType;
  /** Meta Info */
  meta?: MetaType;
  /** Numeric Precision */
  np?: number | null | string;
  /** Numeric Scale */
  ns?: number | null | string;
  /** The order of the list of columns */
  order?: number;
  /** Is Primary Key? */
  pk?: BoolType;
  /** Is Primary Value? */
  pv?: BoolType;
  /** Is Required? */
  rqd?: BoolType;
  /** Is System Column? */
  system?: BoolType;
  /**
   * Column Title
   * @example Title
   */
  title?: string;
  /**
   * The data type in UI
   * @example SingleLineText
   */
  uidt?:
    | 'Attachment'
    | 'AutoNumber'
    | 'Barcode'
    | 'Button'
    | 'Checkbox'
    | 'Collaborator'
    | 'Count'
    | 'CreatedTime'
    | 'Currency'
    | 'Date'
    | 'DateTime'
    | 'Decimal'
    | 'Duration'
    | 'Email'
    | 'Formula'
    | 'ForeignKey'
    | 'GeoData'
    | 'Geometry'
    | 'ID'
    | 'JSON'
    | 'LastModifiedTime'
    | 'LongText'
    | 'LinkToAnotherRecord'
    | 'Lookup'
    | 'MultiSelect'
    | 'Number'
    | 'Percent'
    | 'PhoneNumber'
    | 'Rating'
    | 'Rollup'
    | 'SingleLineText'
    | 'SingleSelect'
    | 'SpecificDBType'
    | 'Time'
    | 'URL'
    | 'Year'
    | 'QrCode'
    | 'Links'
    | 'User'
    | 'CreatedBy'
    | 'LastModifiedBy'
    | 'AI'
    | 'Order';
  /** Is Unsigned? */
  un?: BoolType;
  /** Is unique? */
  unique?: BoolType;
  /** Is Visible? */
  visible?: BoolType;
  /** Is this column readonly? */
  readonly?: BoolType;
}

/**
 * Model for Table
 */
export interface TableType {
  /** Unique Source ID */
  source_id?: string;
  /** The columns included in this table */
  columns?: ColumnType[];
  /** Column Models grouped by IDs */
  columnsById?: Record<string, any>;
  /** Hash of columns */
  columnsHash?: string;
  /** Model for Bool */
  deleted?: BoolType;
  /** Is this table enabled? */
  enabled?: BoolType;
  /** Unique Table ID */
  id?: string;
  /** Meta Data */
  meta?: MetaType;
  /** Is this table used for M2M */
  mm?: BoolType;
  /** The order of the list of tables */
  order?: number;
  /** Currently not in use */
  pinned?: BoolType;
  /** Unique Base ID */
  base_id?: string;
  /** Table Description */
  description?: TextOrNullType;
  /** Table Name. Prefix will be added for XCDB bases. */
  table_name?: string;
  /** Currently not in use */
  tags?: StringOrNullType;
  /** Table Title */
  title: string;
  /** Table Type */
  type?: string;
  /** Is this table synced? */
  synced?: BoolType;
}
