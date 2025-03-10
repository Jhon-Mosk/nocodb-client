# node-nocodb
NocoDb client for Node.js

## Usage NocoDb client

```js
const {
  env: { NOCODB_API_TOKEN, NOCODB_API_URL },
} = require('node:process');
const NocoDB = require('./main.js');

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
const NocoDB = require('../main.js');

const config = {
  token: NOCODB_API_TOKEN,
  apiUrl: NOCODB_API_URL,
};

const run = async () => {
  const baseName = 'baseName';
  const db = new NocoDB(config);
  await db.connect(baseName);
  const attachments = await db.uploadAttachments('tableName', ['absolute path to file 1', 'absolute path to file 2']);
  const result = await db.create('tableName', {
      fieldName1: 'fieldValue',
      fieldName2: 2,
      attachments,
    });
};

run().catch(console.error);
```
