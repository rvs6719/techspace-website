const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');
const apiRoutes = require('./routes/api');
const contactsRoutes = require('./routes/contacts');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Определяем окружение
const isProduction = process.env.NODE_ENV === 'production';

// CORS настройки
app.use(cors({
  origin: isProduction
    ? ['https://your-app.vercel.app', 'http://localhost:3000']
    : 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json());

// Статические файлы - ВАЖНО для Vercel
app.use(express.static(path.join(__dirname, '../frontend')));

// Логирование
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api', contactsRoutes);

// Serve frontend для всех остальных routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Database check endpoint
app.get('/api/db-check', async (req, res) => {
    try {
      const { pool } = require('./database');
      const client = await pool.connect();

      // Проверяем таблицы
      const messages = await client.query('SELECT COUNT(*) FROM messages');
      const contacts = await client.query('SELECT COUNT(*) FROM contacts');

      client.release();

      res.json({
        status: 'OK',
        database: 'Connected',
        tables: {
          messages: parseInt(messages.rows[0].count),
          contacts: parseInt(contacts.rows[0].count)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        database: 'Disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

// Инициализация базы данных и запуск сервера
// Инициализация базы данных и запуск сервера
const startServer = async () => {
    console.log('🚀 Starting server...');
    console.log('📁 Environment:', process.env.NODE_ENV || 'development');

    try {
      // В продакшене тоже инициализируем базу
      await initDB();

      app.listen(PORT, () => {
        console.log(`🎉 Server running on port ${PORT}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected to Supabase' : 'Local'}`);
      });
    } catch (error) {
      console.error('💥 Failed to start server:', error);
      // В продакшене продолжаем работать даже если БД не подключилась
      app.listen(PORT, () => {
        console.log(`🚨 Server running in fallback mode on port ${PORT}`);
        console.log('⚠️ Database features will not work');
      });
    }
  };

startServer();