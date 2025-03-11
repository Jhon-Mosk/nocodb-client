'use strict';

const path = require('node:path');
const fsp = require('node:fs/promises');

class NocoDB {
  #timeout;
  #token;
  #apiUrl;
  #baseName;
  #tables = {};

  /**
   * @constructor
   * @param {object} config -конфигурация
   * @param {string} config.token - токен для авторизации
   * @param {string} config.apiUrl - адрес API NocoDB
   * @param {number} [config.timeout] - таймаут запроса
   * @param {object} [config.tables] - словарь таблиц, ключ - название таблицы, значение - идентификатор таблицы
   */
  constructor({ token, apiUrl, timeout = 5000, tables }) {
    this.#token = token;
    this.#apiUrl = apiUrl;
    this.#timeout = timeout;
    if (tables) this.#tables = tables;
  }

  /**
   * подключение к базе
   * @param {string} baseName название базы
   * @returns {Promise<void>}
   */
  connect = async (baseName) => {
    if (!baseName) throw new Error('Не указано название базы');
    const base = await this.#getBases(baseName);
    this.#baseName = baseName;

    const endpoint = `/api/v2/meta/bases/${base.id}/tables`;
    const tables = await this.fetch(endpoint);
    this.#tables = tables.list.reduce((acc, table) => {
      acc[table.title] = table;
      return acc;
    }, {});
  };

  /**
   * для запросов к NocoDB
   * @param {string} endpoint эндпоинт
   * @param {object} [requestParams] параметры запроса
   * @param {object} [queryParams] параметры запроса
   * @returns {Promise<object|null>} объект с результатами запроса или null если запись не найдена
   */
  fetch = async (endpoint, requestParams = {}, queryParams) => {
    const params = {
      signal: AbortSignal.timeout(this.#timeout),
      headers: {
        accept: 'application/json',
        'xc-token': this.#token,
        'Content-Type': 'application/json',
      },
    };

    if (requestParams) {
      const headers = Object.assign(params.headers, requestParams.headers);
      if (requestParams.body instanceof FormData) {
        delete headers['Content-Type'];
      }
      Object.assign(params, requestParams);
      params.headers = headers;
    }

    const url = new URL(endpoint, this.#apiUrl);

    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        url.searchParams.append(key, queryParams[key]);
      });
    }

    try {
      const response = await fetch(url, params);

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 404) {
        return null;
      }

      const { status, statusText } = response;
      const error = new Error(`${status}: ${statusText}`);

      try {
        error.code = status;
        error.body = await response.json();
      } catch (error) {
        console.error(error);
      }

      throw error;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error(`Превышено время ожидания: ${this.#timeout} мс.`);
      }
      if (error.name === 'AbortError') {
        throw new Error('Запрос прерван пользователем.');
      }
      if (error.name === 'TypeError') {
        throw new Error(
          'Метод AbortSignal.timeout() не поддерживается в текущем окружении.',
        );
      }

      throw error;
    }
  };

  /**
   * для получения списка баз
   * @param {string} baseName название базы
   * @returns {Promise<[{}]|{}>} если указано название базы - возвращает объект базы, если нет - возвращает список баз
   */
  #getBases = async (baseName) => {
    const endpoint = '/api/v2/meta/bases';
    const bases = await this.fetch(endpoint);
    if (!bases.pageInfo.isLastPage) throw new Error('Не все базы получены.');
    if (baseName) {
      const base = bases.list.find((base) => base.title === baseName);
      if (!base) throw new Error(`База ${baseName} не найдена.`);
      return base;
    }
    return bases.list;
  };

  #getTable = (tableName) => {
    const table = this.#tables[tableName];
    if (!table) throw new Error(`Таблица ${tableName} не найдена.`);
    return table;
  };

  /**
   * для получения списка вебхуков
   * https://all-apis.nocodb.com/#tag/DB-Table-Webhook/operation/db-table-webhook-list
   * @param {string} tableName - название таблицы
   * @returns {Promise<Array>} с объектами вебхуков
   */
  getWebhooks = async (tableName) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v1/db/meta/tables/${table.id}/hooks`;
    const data = await this.fetch(endpoint);
    return data.list;
  };

  /**
 * для создания вебхука
 * https://all-apis.nocodb.com/#tag/DB-Table-Webhook/operation/db-table-webhook-create
 * @param {string} tableName - название таблицы
 * @param {object} body - тело запроса
 * @param {number|boolean} [body.active] - включенный или нет
 * @param {number|boolean} [body.async] - асинхронный или нет
 * @param {string} [body.description] - описание <= 255 символов
 * @param {string} [body.env] - окружение для вебхука, известное значение "all"
 * @param {string} body.event - тип события: "after", "before"
 * @param {string} [body.fk_model_id] - внешний ключ к модели
 * @param {string} [body.id] - уникальный идентификатор [ 0 .. 20 ] символов
 * @param {object|string} body.notification - уведомление о перехвате, включая такую информацию, как тип, полезная нагрузка, метод, тело и т. д.
 * @param {string} body.operation - операция перехвата: "insert", "update", "delete", "bulkInsert", "bulkUpdate", "bulkDelete"
 * @param {number} [body.retries] - количество повторов
 * @param {number} [body.retry_interval] - интервал повторов
 * @param {number} [body.timeout] - таймаут
 * @param {string} body.title - название перехватчика
 * @param {string} [body.type] - тип перехватчика
 * @param {number|boolean} [body.condition] - связан ли этот перехватчик с какими-то фильтрами
 * @param {boolean} body.payload - не описан в документации, но без него не отправиться вебхук с типом URL. Требуется true, чтобы использовать payload из notification
 * @returns {Promise<object>} созданный вебхук
 * @example body = {
    active: 1,
    async: 0,
    description: "This is my hook description",
    env: "all",
    event: "after",
    payload: true,
    notification: {
      type: "URL",
      payload: {
        body: { chat_id: 68***53, text: "{{ json data }}" },
        parameters: [{}],
        headers: [{}],
        auth: "",
        path: "https://api.telegram.org/bot56***Rk/sendMessage",
      },
    },
    type: "URL",
    operation: "insert",
    retries: 3,
    retry_interval: 60000,
    timeout: 60000,
    title: "webhook by api",
    condition: 0,
  }
 */
  createWebhook = async (tableName, body = {}) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v1/db/meta/tables/${table.id}/hooks`;
    return await this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  /**
   * для обновления вебхука
   * https://all-apis.nocodb.com/#tag/DB-Table-Webhook/operation/db-table-webhook-update
   * @param {string} hookId - идентификатор вебхука
   * @param {object} body - тело запроса
   * @param {number|boolean} [body.active] - включенный или нет
   * @param {number|boolean} [body.async] - асинхронный или нет
   * @param {string} [body.description] - описание <= 255 символов
   * @param {string} [body.env] - окружение для вебхука, известное значение "all"
   * @param {string} [body.event] - тип события: "after", "before"
   * @param {string} [body.fk_model_id] - внешний ключ к модели
   * @param {string} [body.id] - уникальный идентификатор [ 0 .. 20 ] символов
   * @param {object|string} [body.notification] - уведомление о перехвате, включая такую информацию, как тип, полезная нагрузка, метод, тело и т. д.
   * @param {string} [body.operation] - операция перехвата: "insert", "update", "delete", "bulkInsert", "bulkUpdate", "bulkDelete"
   * @param {number} [body.retries] - количество повторов
   * @param {number} [body.retry_interval] - интервал повторов
   * @param {number} [body.timeout] - таймаут
   * @param {string} [body.title] - название перехватчика
   * @param {string} [body.type] - тип перехватчика
   * @param {string} [body.version] - версия перехватчика: "v1", "v2"
   * @param {boolean} [body.payload] - не описан в документации, но без него не отправиться вебхук с типом URL. Требуется true, чтобы использовать payload из notification
   * @returns {Promise<object>} созданный вебхук
   * @returns
   */
  updateWebhook = async (hookId, body = {}) => {
    const endpoint = `/api/v1/db/meta/hooks/${hookId}`;
    return await this.fetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  };

  /**
   * для запроса всех записей
   * @param {string} tableName название таблицы
   * @param {object} params параметры запроса
   * @param {string} [params.fields] название полей перечисленные через запятую
   * @param {string} [params.sort] название полей перечисленные через запятую для сортировки строк, строки будут сортироваться в порядке возрастания на основе предоставленных столбцов. Для сортировки по убыванию укажите префикс - вместе с именем столбца.
   * @param {string} [params.where] это можно использовать для фильтрации строк, которая принимает сложные условия. Подробнее: https://docs.nocodb.com/developer-resources/rest-apis#comparison-operators
   * @param {number} [params.limit = 25] используется для разбиения на страницы, размер коллекции ответов зависит от значения ограничения со значением по умолчанию 25 и максимальным значением 1000
   * @param {string} [params.shuffle] используется для разбиения на страницы, ответ будет перемешан, если для него установлено значение 1
   * @param {string} [params.offset] используется для нумерации страниц, значение помогает выбрать коллекцию из определенного индекса
   * @returns {Promise<{"list": [], "pageInfo": { "totalRows": 0, "page": 1, "pageSize": 25, "isFirstPage": true, "isLastPage": true }}} объект с результатами запроса
   */
  getAll = async (tableName, params = {}) => {
    const table = this.#getTable(tableName);
    const searchParams = new URLSearchParams(params);
    const endpoint = `/api/v2/tables/${
      table.id
    }/records?${searchParams.toString()}`;
    return await this.fetch(endpoint);
  };

  /**
   * для запроса больше 1000 записей из NocoDB
   * @param {string} tableName - название таблицы
   * @param {Object} params - параметры для функции запроса данных
   * @returns {Promise<{"list": [], "pageInfo": { "totalRows": 0, "page": 1, "pageSize": 25, "isFirstPage": true, "isLastPage": true }}} объект с результатами запроса
   */
  getOver1000 = async (tableName, params = {}) => {
    const result = {
      list: [],
      pageInfo: null,
    };
    let offset = 0;

    while (true) {
      try {
        const data = await this.getAll(tableName, {
          ...params,
          limit: 1000,
          offset,
        });

        result.list.push(...data.list);
        result.pageInfo = data.pageInfo;

        if (data.pageInfo.isLastPage) {
          break;
        }
        offset = data.pageInfo.page * data.pageInfo.pageSize;
      } catch (error) {
        console.log(error);
        throw new Error('При запросе больше 1000 записей возникла ошибка');
      }
    }

    return result;
  };

  /**
   * для запроса записи по первичному ключу
   * @param {string} tableName название таблицы
   * @param {number|string} id идентификатор записи
   * @returns {Promise<object|null>} объект с результатами запроса или null если запись не найдена
   */
  getOne = async (tableName, id) => {
    const table = this.#getTable(tableName);
    return await this.fetch(`/api/v2/tables/${table.id}/records/${id}`);
  };

  /**
   * для создания
   * @param {string} tableName название таблицы
   * @param {object} data с данными для записи, должен содержать id, если таблица без автоикремента
   * @returns {Promise<{pk: value}>} объект с первичным ключом созданной записи
   */
  create = async (tableName, data) => {
    const table = this.#getTable(tableName);

    const params = {
      method: 'POST',
    };

    if (data) {
      params.body = JSON.stringify(data);
    }
    console.log(params);
    return await this.fetch(`/api/v2/tables/${table.id}/records`, params);
  };

  /**
   * для создания ссылки
   * @param {string} tableName название таблицы
   * @param {string} linkId идентификатор поля ссылки
   * @param {number} recordId первичный ключ записи
   * @param {[{}]} data c первичными ключами записей из таблицы на которую ссылается linkId
   * @returns {Promise<boolean>}
   */
  createLink = async (tableName, linkId, recordId, data) => {
    const table = this.#getTable(tableName);

    const params = {
      method: 'POST',
    };

    if (data) {
      params.body = JSON.stringify(data);
    }

    return await this.fetch(
      `/api/v2/tables/${table.id}/links/${linkId}/records/${recordId}`,

      params,
    );
  };

  /**
   * для обновления
   * @param {string} tableName название таблицы
   * @param {{}} data с данными для обновления, должны содержать первичный ключ
   * @returns {Promise<{}>} объект с данными по обновлённой записи
   */
  update = async (tableName, data) => {
    const table = this.#getTable(tableName);

    const params = {
      method: 'PATCH',
    };

    if (data) {
      params.body = JSON.stringify(data);
    }

    return await this.fetch(`/api/v2/tables/${table.id}/records`, params);
  };

  /**
   * для загрузки вложений
   * @param {string} tableName - название таблиц
   * @param {[ string | { content: Buffer, filename: string }]} attachments - массив абсолютных путей к файлам, либо объект с буферами, filename должно содержать расширение файла
   * @returns {Promise<[{ path: string, title: string, mimetype: string, size: number, width: number, height: number, signedPath: string }]>} объект с описаниями загруженных вложений
   */
  uploadAttachments = async (tableName, files) => {
    const mime = (await import('mime')).default;
    const endpoint = '/api/v2/storage/upload';
    const query = { path: `noco/${this.#baseName}/${tableName}/attachments` };

    const formData = new FormData();

    const addFileToFormData = (file, filename) => {
      const type = mime.getType(filename);
      if (!type) throw new Error('filename must contain a valid extension');
      const blob = new Blob([file], { type });
      formData.append(filename, blob, filename);
    };

    await Promise.all(
      files.map(async (attachment) => {
        if (typeof attachment === 'string') {
          const fileName = path.basename(attachment);
          const file = await fsp.readFile(attachment);
          addFileToFormData(file, fileName);
          return;
        }

        if (typeof attachment === 'object') {
          const { content, filename } = attachment;

          if (!(content instanceof Buffer)) {
            throw new Error('content must be a Buffer');
          }
          if (typeof filename !== 'string') {
            throw new Error('filename must be a string');
          }

          addFileToFormData(content, filename);
          return;
        }

        throw new Error('unsupported attachment type');
      }),
    );

    const params = {
      method: 'POST',
      body: formData,
    };

    return await this.fetch(endpoint, params, query);
  };
}

module.exports = NocoDB;
