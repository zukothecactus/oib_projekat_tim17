import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import http from 'http';

dotenv.config({ path: __dirname + '/../../.env' });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'app_prod';
const DB_PASSWORD = process.env.DB_PASSWORD || 'prod_pass';
const DB_NAME = process.env.DB_NAME || 'prost_production_db';
const APP_PORTS = [Number(process.env.PORT || 5400), 5100];

async function checkDb() {
  try {
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    const [countRows] = await conn.query("SELECT COUNT(*) AS cnt FROM plants");
    // @ts-ignore
    const cnt = (Array.isArray(countRows) && countRows[0]) ? countRows[0].cnt : countRows;
    console.log('DB COUNT:', cnt);

    const [rows] = await conn.query("SELECT id, common_name, latin_name, aromatic_strength, origin_country, status, created_at FROM plants LIMIT 5");
    // @ts-ignore
    console.log('SAMPLE ROWS:', JSON.stringify(rows, null, 2));

    await conn.end();
  } catch (err) {
    console.error('DB error:', err && (err as Error).message ? (err as Error).message : err);
  }
}

function checkHttp() {
  return new Promise<void>(async (resolve) => {
    for (const port of APP_PORTS) {
      await new Promise<void>((res) => {
        const url = `http://localhost:${port}/api/v1/production/plants`;
        http.get(url, (r) => {
          const { statusCode } = r;
          let raw = '';
          r.setEncoding('utf8');
          r.on('data', (chunk) => { raw += chunk; });
          r.on('end', () => {
            console.log('HTTP tried port', port, 'status:', statusCode);
            try { console.log('HTTP JSON:', JSON.stringify(JSON.parse(raw), null, 2)); }
            catch { console.log('HTTP raw:', raw.substring(0, 1000)); }
            res();
          });
        }).on('error', (e) => {
          console.log('HTTP port', port, 'error:', e && (e as Error).message);
          res();
        });
      });
    }
    resolve();
  });
}

(async () => {
  console.log('Checking database and HTTP endpoint...');
  await checkDb();
  await checkHttp();
  console.log('Done.');
})();
