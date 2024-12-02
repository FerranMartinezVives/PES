import { sequelize } from '../src/sequelize'
import request from 'supertest'
import app from '../src/app'
import { createDbConnection } from '../src/database'
import { RunMigrations } from '../src/seeding'

beforeAll(async () => {
  createDbConnection()
  await sequelize.sync({force: true})
  await RunMigrations()
});

afterAll(async () => {
  await sequelize.dropAllSchemas({})
  await sequelize.close()
});

describe('GET /missions', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/missions')
    expect(response.statusCode).toEqual(200)
  })
})

describe('GET /missions/:id', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/missions/1')
    expect(response.statusCode).toEqual(200)
  })
  it('returns error 404', async () => {
    const response = await request(app).get('/missions/1000')
    expect(response.statusCode).toEqual(404)
  })
})

describe('GET /missions/perLletra', () => {
  it('no existeix la lletra', async () => {
    const response = await request(app).get('/missions/lletraIAnteriors/J')
    expect(response.statusCode).toEqual(404)
  })
  it('missions', async () => {
    const response = await request(app).get('/missions/lletraIAnteriors/F')
    expect(response.body[0].id).toEqual(1)
  })
})

describe('GET /missions/:id/events', () => {
  it ('returns code 200', async () => {
    const response = await request(app).get('/missions/1/events')
    expect(response.statusCode).toEqual(200)
  })
})