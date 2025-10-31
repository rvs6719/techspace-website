const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Простая авторизация (для демо - в продакшене используйте нормальную аутентификацию)
const ADMIN_PASSWORD = 'admin123';

// Страница админки
router.get('/admin', async (req, res) => {
  try {
    const contacts = await pool.query(`
      SELECT * FROM contacts
      ORDER BY created_at DESC
    `);

    const messages = await pool.query('SELECT COUNT(*) FROM messages');
    const contactsCount = await pool.query('SELECT COUNT(*) FROM contacts');

    res.json({
      stats: {
        totalMessages: parseInt(messages.rows[0].count),
        totalContacts: parseInt(contactsCount.rows[0].count),
        newContacts: contacts.rows.filter(c => c.status === 'new').length
      },
      contacts: contacts.rows
    });

  } catch (err) {
    console.error('Admin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;