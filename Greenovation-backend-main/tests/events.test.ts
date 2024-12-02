import { sequelize } from '../src/sequelize'
import request from 'supertest'
import app from '../src/app'
import { createDbConnection } from '../src/database'
import { RunMigrations } from '../src/seeding'

beforeAll(async () => {
  createDbConnection()
  await sequelize.sync({ force: true })
  await RunMigrations()
});

afterAll(async () => {
  await sequelize.dropAllSchemas({})
  await sequelize.close()
});

describe('GET /events', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/events')
    expect(response.statusCode).toEqual(200)
  })
})

describe('GET /events/:id', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/events/1')
    expect(response.statusCode).toEqual(200)
  })
})

describe('GET /events/lletra/:lletra', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/events/lletra/F')
    expect(response.statusCode).toEqual(200)
  })
})

describe('GET /events/lletraIAnteriors/:lletra', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/events/lletraIAnteriors/D')
    expect(response.statusCode).toEqual(200)
  })
})