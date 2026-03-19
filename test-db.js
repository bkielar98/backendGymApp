import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

client.connect()
  .then(() => {
    console.log('Połączenie z bazą danych udane')
    return client.query('SELECT 1 as test')
  })
  .then(res => {
    console.log('Wynik:', res.rows)
    client.end()
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą danych:', err)
    client.end()
  })