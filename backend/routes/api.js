const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Получить все сообщения
router.get('/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавить новое сообщение
router.post('/messages', async (req, res) => {
  const { userName, message } = req.body;

  if (!userName || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (user_name, message) VALUES ($1, $2) RETURNING *',
      [userName, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику
router.get('/stats', async (req, res) => {
  try {
    const messagesCount = await pool.query('SELECT COUNT(*) FROM messages');
    const usersCount = await pool.query('SELECT COUNT(DISTINCT user_name) FROM messages');

    res.json({
      totalMessages: parseInt(messagesCount.rows[0].count),
      totalUsers: parseInt(usersCount.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;