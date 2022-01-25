const { Client } = require('pg');
const app = require('express')();
const crypto = require('crypto');
const HashRing = require('hashring');
const hr = new HashRing();

hr.add('5433');
hr.add('5434');
hr.add('5435');

const clients = {
  '5433': new Client({
    'host': 'docker.for.lin.localhost',
    'port': '5433',
    'user': 'postgres',
    'password': 'postgres',
    'database': 'postgres'
  }),
  '5434': new Client({
    'host': 'docker.for.lin.localhost',
    'port': '5434',
    'user': 'postgres',
    'password': 'postgres',
    'database': 'postgres'
  }),
  '5435': new Client({
    'host': 'docker.for.lin.localhost',
    'port': '5435',
    'user': 'postgres',
    'password': 'postgres',
    'database': 'postgres'
  })
}

connect();

async function connect() {
  await clients['5433'].connect();
  await clients['5434'].connect();
  await clients['5435'].connect();
}

app.get('/:urlId', async (req, res) => {
  const urlId = req.params.urlId;
  const server = hr.get(urlId);
  const result = await clients[server].query('SELECT * FROM URL_TABLE WHERE url_id = $1', [urlId]);

  if (result.rowCount > 0) {
    res.send({ ...result.rows[0], server });
  } else {
    res.sendStatus(404);
  }
});

app.post('/', async (req, res) => {
  const url = req.query.url;

  // Consistent Hashing
  const hash = crypto.createHash('sha256').update(url).digest('base64');
  const urlId = hash.substr(0, 5);
  const server = hr.get(urlId);

  await clients[server].query('INSERT INTO URL_TABLE (url, url_id) VALUES ($1, $2)', [url, urlId]);

  res.send({
    urlId,
    url,
    server
  })
});

app.listen(8081, () => console.log('Listening on port 8081'));
