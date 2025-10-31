const { Pool } = require('pg');

console.log('🔌 Configuring database connection...');

// Конфигурация для разных окружений
const getDbConfig = () => {
  // Если есть DATABASE_URL (для Supabase), используем её
  if (process.env.DATABASE_URL) {
    console.log('📊 Using DATABASE_URL from environment');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }

  // Локальная разработка
  return {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mywebsite',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
  };
};

const pool = new Pool(getDbConfig());

// Простая функция проверки подключения
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    console.log('✅ Database connection successful:', result.rows[0].time);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Инициализация базы данных
const initDB = async () => {
  console.log('🔄 Starting database initialization...');

  const connected = await testConnection();
  if (!connected) {
    throw new Error('Cannot connect to database');
  }

  try {
    // Таблица сообщений
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица контактов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'new'
      )
    `);

    console.log('✅ Database tables initialized');
    return true;

  } catch (err) {
    console.error('❌ Database initialization error:', err);
    throw err;
  }
};

module.exports = { pool, initDB, testConnection };