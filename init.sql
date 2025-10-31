-- Даем все права пользователю admin
ALTER USER admin WITH SUPERUSER;

-- Создаем таблицы если их нет
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем тестовые данные
INSERT INTO messages (user_name, message)
VALUES ('Администратор', 'Добро пожаловать на сайт!')
ON CONFLICT DO NOTHING;