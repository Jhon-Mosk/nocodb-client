# NocoDB Client

Простая и типизированная библиотека для взаимодействия с [NocoDB](https://nocodb.com/) через REST API. Позволяет управлять таблицами, записями, вложениями и вебхуками.

Работа была протестирована с версии 0.255.2 до 0.262.5.

## Установка

```bash
npm install nocodb-client
# или
yarn add nocodb-client
```

## Быстрый старт

```js
import NocoDB from 'nocodb-client';

const nc = new NocoDB({
  token: 'YOUR_API_TOKEN',
  apiUrl: 'https://your-nocodb-instance.com',
  baseName: 'your-base-name',
  timeout: 10000, // опционально, по умолчанию 5000
});

// Получить все записи из таблицы "Tasks"
const tasks = await nc.getAll('Tasks');

// Создать новую запись
const newTask = await nc.create('Tasks', { title: 'Новая задача', status: 'todo' });

// Получить одну запись по ID
const task = await nc.getOne('Tasks', newTask.id);

// Обновить запись
await nc.update('Tasks', { id: task.id, status: 'done' });

// Создать вебхук
await nc.createWebhook('Tasks', {
  type: 'URL',
  url: 'https://your-webhook-endpoint.com/nocodb',
  event: 'create',
  payload: true, // обязательно для URL-вебхуков
});

// Загрузить вложения
const attachments = await nc.uploadAttachments('tableName', ['absolute path to file 1', 'absolute path to file 2']);
await nc.create('tableName', {
      fieldName1: 'fieldValue',
      fieldName2: 2,
      attachments,
    });

// Загрузить вложения
const filePaths = ['absolute path to file 1', 'absolute path to file 2'];
  const buffers = filePaths.map((filePath) => {
    const buffer = fs.readFileSync(filePath);
    return { content: buffer, filename: path.basename(filePath) };
  });
  const attachments = await nc.uploadAttachments('tableName', buffers);
  await nc.create('tableName', {
      fieldName1: 'fieldValue',
      fieldName2: 2,
      attachments,
    });
```

## Конфигурация

При создании экземпляра `NocoDB` требуется передать объект конфигурации:

| Параметр   | Тип    | Обязательный | Описание                                              |
| ---------- | ------ | ------------ | ----------------------------------------------------- |
| `token`    | string | ✅            | API-токен из NocoDB (Project → Settings → API tokens) |
| `apiUrl`   | string | ✅            | Базовый URL вашего NocoDB-инстанса                    |
| `baseName` | string | ✅            | Название базы данных (project)                        |
| `timeout`  | number | ❌            | Таймаут запросов в миллисекундах (по умолчанию: 5000) |

## Основные методы

### Записи

- `getAll(tableName, params?)` — получить все записи (до 1000)
- `getOver1000(tableName, params?)` — получить более 1000 записей (с пагинацией под капотом)
- `getOne(tableName, id, params?)` — получить одну запись по ID
- `create(tableName, data)` — создать запись
- `update(tableName, data)` — обновить запись (должна содержать первичный ключ)
- `count(tableName, params?)` — получить количество записей

### Связи

- `createLink(tableName, linkId, recordId, data)` — создать связь между записями

### Вложения

- `uploadAttachments(tableName, files)` — загрузить файлы (локальные пути или буферы)
- `downloadAttachment(attachment, directory)` — скачать вложение по URL и сохранить локально

### Вебхуки

- `getWebhooks(tableName)` — получить список вебхуков таблицы
- `createWebhook(tableName, webhook)` — создать вебхук
- `updateWebhook(hookId, webhook)` — обновить вебхук

> ⚠️ Для URL-вебхуков обязательно указывайте `payload: true`, иначе полезная нагрузка не будет отправляться.

## Типы

Библиотека полностью типизирована с использованием TypeScript. Основные интерфейсы:

- `HookType` — структура вебхука
- `TableRecords` — результат запроса записей
- `BaseQueryParams` — параметры фильтрации, сортировки и пагинации
- `AttachmentReqType` — метаданные вложения

## Требования

- Node.js ≥ 18
- TypeScript ≥ 4.5 (если используется в TS-проекте)

## Лицензия

MIT
```
