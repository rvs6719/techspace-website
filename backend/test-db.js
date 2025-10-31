const { Client } = require('pg');

console.log('🧪 Simple PostgreSQL connection test...');

const client = new Client({
  user: 'postgres',
  host: '172.28.66.193',
  database: 'mywebsite',
  password: '123456',
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('✅ CONNECTED SUCCESSFULLY!');
    return client.query('SELECT version() as version');
  })
  .then(result => {
    console.log('📋 PostgreSQL version:', result.rows[0].version.split(',')[0]);
    return client.query('SELECT current_database() as db');
  })
  .then(result => {
    console.log('💾 Database:', result.rows[0].db);
    console.log('🎉 EVERYTHING WORKS!');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ CONNECTION FAILED:');
    console.log('Error message:', err.message);
    console.log('Error code:', err.code);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if container is running: docker ps');
    console.log('2. Check logs: docker logs mywebsite-postgres');
    console.log('3. Verify password in docker-compose.yml');
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });