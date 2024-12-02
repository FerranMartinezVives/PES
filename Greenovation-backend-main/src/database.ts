// eslint-disable-next-line @typescript-eslint/no-var-requires
const sqlite3 = require('sqlite3').verbose()
const filepath = './test.db'

export function createDbConnection (): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const db = new sqlite3.Database(filepath, (error: { message: any }) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (error) {
      console.error(error.message)
    }
  })
  console.log('Connection with SQLite has been established')
}
