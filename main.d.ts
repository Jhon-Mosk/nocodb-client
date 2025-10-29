/* eslint-disable strict */
import {
  AttachmentReqType,
  BaseQueryParams,
  HookType,
  TableRecords,
} from './interfaces';
import { AnyObject } from './types';

declare module './main.js' {
  /**
   * Конфигурация для инициализации NocoDB.
   */
  interface NocoDBConfig {
    /** Токен для авторизации. */
    token: string;
    /** URL API NocoDB. */
    apiUrl: string;
    /** Название базы данных */
    baseName: string;
    /** Таймаут для запросов в миллисекундах. */
    timeout?: number;
  }

  /**
   * Класс для работы с NocoDB.
   */
  class NocoDB {
    /**
     * Создает экземпляр NocoDB.
     * @param config Конфигурация для инициализации NocoDB.
     */
    constructor(config: NocoDBConfig);

    /**
     * Получает вебхуки для указанной таблицы.
     * @link https://all-apis.nocodb.com/#tag/DB-Table-Webhook/operation/db-table-webhook-list
     * @param tableName Название таблицы.
     * @returns Promise<HookType[]>
     */
    getWebhooks(tableName: string): Promise<HookType[]>;

    /**
     * Создает вебхук для указанной таблицы.
     * @link https://all-apis.nocodb.com/#tag/DB-Table-Webhook/operation/db-table-webhook-create
     * @param tableName Название таблицы.
     * @param webhook Вебхук.
     * @param {boolean} webhook.payload - не описан в документации, но без него не отправиться вебхук с типом URL. Требуется true, чтобы использовать payload из notification
     * @returns Promise<HookType>
     */
    createWebhook(
      tableName: string,
      webhook: Partial<HookType>,
    ): Promise<HookType>;

    /**
     * Обновляет вебхук для указанного идентификатора.
     * @link https://all-apis.nocodb.com/#tag/DB-Table-Webhook/operation/db-table-webhook-update
     * @param hookId Идентификатор вебхука.
     * @param webhook Вебхук.
     * @param {boolean} webhook.payload - не описан в документации, но без него не отправиться вебхук с типом URL. Требуется true, чтобы использовать payload из notification
     * @returns Promise<HookType>
     */
    updateWebhook(
      hookId: string,
      webhook: Partial<HookType>,
    ): Promise<HookType>;

    /**
     * Запрос всех записей из указанной таблицы.
     * @param tableName Название таблицы.
     * @param params Параметры запроса.
     * @returns Promise<TableRecords>
     */
    getAll(tableName: string, params?: BaseQueryParams): Promise<TableRecords>;

    /**
     * Запрос больше 1000 записей из указанной таблицы.
     * @param tableName Название таблицы.
     * @param params Параметры запроса.
     * @returns Promise<TableRecords>
     */
    getOver1000(
      tableName: string,
      params?: BaseQueryParams,
    ): Promise<TableRecords>;

    /**
     * Запрос одной записи из указанной таблицы по первичному ключу.
     * @param tableName Название таблицы.
     * @param id Идентификатор записи.
     * @param params Параметры запроса.
     * @param {string} [params.fields] название полей перечисленные через запятую
     * @returns Promise<AnyObject | null>
     */
    getOne(
      tableName: string,
      id: number | string,
      params?: BaseQueryParams,
    ): Promise<AnyObject | null>;

    /**
     * Создание записи в указанной таблице.
     * @param tableName Название таблицы.
     * @param data Данные записи, должны содержать id, если таблица без автоикремента.
     * @returns Promise<AnyObject> объект с первичным ключом созданной записи
     */
    create(tableName: string, data: AnyObject): Promise<AnyObject>;

    /**
     * Создание связи между записями в указанной таблице.
     * @param tableName Название таблицы.
     * @param linkId Идентификатор связываемой записи.
     * @param recordId Идентификатор записи, к которой привязывается связь.
     * @param data C первичными ключами записей из таблицы на которую ссылается linkId
     * @returns Promise<boolean>
     */
    createLink(
      tableName: string,
      linkId: string,
      recordId: number,
      data: AnyObject[],
    ): Promise<boolean>;

    /**
     * Обновление записи в указанной таблице.
     * @param tableName Название таблицы.
     * @param data Данные записи, должны содержать первичный ключ.
     * @returns Promise<AnyObject> объект с первичным ключом обновленной записи
     */
    update(tableName: string, data: AnyObject): Promise<AnyObject>;

    /**
     * Загрузка файлов в указанную таблицу.
     * @param tableName Название таблицы.
     * @param files Файлы.
     * @returns Promise<AttachmentReqType>
     */
    uploadAttachments(
      tableName: string,
      files: [string | { content: Buffer; filename: string }],
    ): Promise<AttachmentReqType>;

    /**
     * Загружает вложение с URL-адреса и сохраняет его в указанном месте.
     * @param attachment Вложение NocoDB.
     * @param directory Путь к каталогу, в который нужно сохранить вложение.
     * @returns Promise<string> file path.
     */
    downloadAttachment(
      attachment: AttachmentReqType,
      directory: string,
    ): Promise<string>;

    /**
     * Количество записей в таблице.
     * @param tableName Название таблицы.
     * @param params Параметры запроса.
     * @returns Promise<{ count: number }>
     */
    count(
      tableName: string,
      params?: BaseQueryParams,
    ): Promise<{ count: number }>;
  }

  export = NocoDB;
}
