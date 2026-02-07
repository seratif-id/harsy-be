import 'dotenv/config';
import { Pool } from 'pg';

async function testConnection() {
  const url = new URL(process.env.DATABASE_URL!);
  
  console.log('Testing connection to:', url.hostname);

  const pool = new Pool({
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port),
    database: url.pathname.substring(1),
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Successfully connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
