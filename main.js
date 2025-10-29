'use strict';

const path = require('node:path');
const fsp = require('node:fs/promises');
const fs = require('node:fs');
const { pipeline } = require('node:stream/promises');
const { setTimeout } = require('node:timers/promises');
const pRetry = require('p-retry').default;

const pRetryParams = {
  onFailedAttempt: async () => {
    await setTimeout(100);
  },
  // The number of milliseconds before starting the first retry.
  minTimeout: 100,
  retries: 3,
};

class NocoDB {
  #timeout;
  #token;
  #apiUrl;
  #baseName;
  #tables = {};

  constructor({ token, apiUrl, timeout = 5000, tables }) {
    this.#token = token;
    this.#apiUrl = apiUrl;
    this.#timeout = timeout;
    if (tables) this.#tables = tables;
  }

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

  fetch = async (endpoint, requestParams, queryParams) => {
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
      const response = await pRetry(() => fetch(url, params), pRetryParams);

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
   * @returns {Promise<import('./Api').BaseType[] | import('./Api').BaseType>} если указано название базы - возвращает объект базы, если нет - возвращает список баз
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

  /**
   * для получения таблицы
   * @param {string} tableName название таблицы
   * @returns {import('./Api').TableType} объект таблицы
   */
  #getTable = (tableName) => {
    const table = this.#tables[tableName];
    if (!table) throw new Error(`Таблица ${tableName} не найдена.`);
    return table;
  };

  getWebhooks = async (tableName) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v1/db/meta/tables/${table.id}/hooks`;
    const data = await this.fetch(endpoint);
    return data.list;
  };

  createWebhook = async (tableName, webhook = {}) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v1/db/meta/tables/${table.id}/hooks`;
    return await this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  };

  updateWebhook = async (hookId, webhook = {}) => {
    const endpoint = `/api/v1/db/meta/hooks/${hookId}`;
    return await this.fetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(webhook),
    });
  };

  getAll = async (tableName, params = {}) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v2/tables/${table.id}/records`;
    return await this.fetch(endpoint, null, params);
  };

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

  getOne = async (tableName, id, params) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v2/tables/${table.id}/records/${id}`;
    return await this.fetch(endpoint, null, params);
  };

  create = async (tableName, data) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v2/tables/${table.id}/records`;

    const params = {
      method: 'POST',
    };

    if (data) {
      params.body = JSON.stringify(data);
    }

    return await this.fetch(endpoint, params);
  };

  createLink = async (tableName, linkId, recordId, data) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v2/tables/${table.id}/links/${linkId}/records/${recordId}`;

    const params = {
      method: 'POST',
    };

    if (data) {
      params.body = JSON.stringify(data);
    }

    return await this.fetch(endpoint, params);
  };

  update = async (tableName, data) => {
    const table = this.#getTable(tableName);
    const endpoint = `/api/v2/tables/${table.id}/records`;

    const params = {
      method: 'PATCH',
    };

    if (data) {
      params.body = JSON.stringify(data);
    }

    return await this.fetch(endpoint, params);
  };

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

  downloadAttachment = async (attachment, directory) => {
    const { path: endpoint, title } = attachment;
    const url = new URL(endpoint, this.#apiUrl);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    const filePath = path.join(directory, title);
    const fileStream = fs.createWriteStream(filePath, { autoClose: true });

    await pipeline(response.body, fileStream);

    return filePath;
  };
}

module.exports = NocoDB;
