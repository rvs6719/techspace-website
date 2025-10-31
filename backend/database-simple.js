const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔌 Using SQLite database...');

const initDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Создаем таблицу
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_name TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Добавляем тестовые данные
        db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (row.count === 0) {
            db.run(
              'INSERT INTO messages (user_name, message) VALUES (?, ?), (?, ?)',
              ['Администратор', 'Добро пожаловать!', 'Система', 'SQLite работает отлично!'],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                console.log('✅ SQLite database initialized with test data');
                resolve();
              }
            );
          } else {
            console.log('✅ SQLite database already initialized');
            resolve();
          }
        });
      });
    });
  });
};

// Обертка для совместимости с существующим кодом
const pool = {
  query: (text, params) => {
    return new Promise((resolve, reject) => {
      if (params) {
        db.all(text, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        db.all(text, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      }
    });
  }
};

module.exports = { pool, initDB, testConnection: () => Promise.resolve(true) };