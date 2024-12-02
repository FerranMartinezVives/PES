import { sequelize } from '../src/sequelize'
import request from 'supertest'
import app from '../src/app'
import { createDbConnection } from '../src/database'
import { RunMigrations } from '../src/seeding'

beforeAll(async () => {
  createDbConnection()
  await sequelize.sync({force: true})
  await RunMigrations()
})

afterAll(async () => {
  await sequelize.dropAllSchemas({})
  await sequelize.close()
});

describe('GET /edificis/recompensaRanking', () => {
  it('returns error 404', async () => {
    const response = await request(app).get('/edificis/recompensesRanking/J')
    expect(response.statusCode).toBe(404)
  })
  it('returns les recompenses', async () => {
    const response = await request(app).get('/edificis/recompensesRanking/D')
    expect(response.body[0].recompensa).toBe(100 * 1.5)
  })
})
