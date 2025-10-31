const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Получить все контакты (для админки)
router.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавить новый контакт
router.post('/contacts', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Валидация
  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Поля "Имя", "Email" и "Сообщение" обязательны для заполнения'
    });
  }

  // Простая валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Пожалуйста, введите корректный email адрес'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, subject || 'Без темы', message]
    );

    console.log('✅ New contact form submitted:', {
      name: name,
      email: email,
      subject: subject || 'Без темы'
    });

    res.json({
      success: true,
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
      contact: result.rows[0]
    });

  } catch (err) {
    console.error('Error saving contact:', err);
    res.status(500).json({
      error: 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.'
    });
  }
});

// Обновить статус контакта
router.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE contacts SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Контакт не найден' });
    }

    res.json({
      success: true,
      contact: result.rows[0]
    });

  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;