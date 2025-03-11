# nocodb-client
NocoDb client for Node.js

## Installation

```bash
npm install nocodb-client
```

## Usage NocoDb client

```js
const {
  env: { NOCODB_API_TOKEN, NOCODB_API_URL },
} = require('node:process');
const NocoDB = require('nocodb-client');

const config = {
  token: NOCODB_API_TOKEN,
  apiUrl: NOCODB_API_URL,
};

const run = async () => {
  const baseName = 'baseName';
  const db = new NocoDB(config);
  await db.connect(baseName);
  const data = await db.getAll('tableName');
  console.log({ data: data.list });
};

run().catch(console.error);
```

```js
const {
  env: { NOCODB_API_TOKEN, NOCODB_API_URL },
} = require('node:process');
const NocoDB = require('nocodb-client');

const config = {
  token: NOCODB_API_TOKEN,
  apiUrl: NOCODB_API_URL,
};

const run = async () => {
  const baseName = 'baseName';
  const db = new NocoDB(config);
  await db.connect(baseName);
  const attachments = await db.uploadAttachments('tableName', ['absolute path to file 1', 'absolute path to file 2']);
  return await db.create('tableName', {
      fieldName1: 'fieldValue',
      fieldName2: 2,
      attachments,
    });
};

run().then(console.log).catch(console.error);
```

```js
const {
  env: { NOCODB_API_TOKEN, NOCODB_API_URL },
} = require('node:process');
const fs = require('node:fs');
const path = require('node:path');
const NocoDB = require('nocodb-client');

const config = {
  token: NOCODB_API_TOKEN,
  apiUrl: NOCODB_API_URL,
};

const run = async () => {
  const baseName = 'baseName';
  const db = new NocoDB(config);
  await db.connect(baseName);
  const filePaths = ['absolute path to file 1', 'absolute path to file 2'];
  const buffers = filePaths.map((filePath) => {
    const buffer = fs.readFileSync(filePath);
    return { content: buffer, filename: path.basename(filePath) };
  });
  const attachments = await db.uploadAttachments('tableName', buffers);
  return await db.create('tableName', {
      fieldName1: 'fieldValue',
      fieldName2: 2,
      attachments,
    });
};

run().then(console.log).catch(console.error);
```
