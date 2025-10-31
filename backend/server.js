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

// Инициализация базы данных и запуск сервера
const startServer = async () => {
  console.log('🚀 Starting server...');
  console.log('📁 Environment:', process.env.NODE_ENV || 'development');

  try {
    if (process.env.NODE_ENV !== 'production') {
      // В разработке инициализируем базу
      await initDB();
    }

    app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    // В продакшене продолжаем работать даже без БД
    if (process.env.NODE_ENV === 'production') {
      app.listen(PORT, () => {
        console.log(`🚨 Server running in fallback mode on port ${PORT}`);
      });
    }
  }
};

startServer();