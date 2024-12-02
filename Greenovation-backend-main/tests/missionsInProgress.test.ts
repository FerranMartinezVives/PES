import { sequelize } from '../src/sequelize'
import request from 'supertest'
import app from '../src/app'
import { createDbConnection } from '../src/database'
import { RunMigrations } from '../src/seeding'
import {response} from "express";

let user = {
  "username": "username1",
  "mail": "user@mail.com",
  "password": "password",
  "diners": 100
}

let user2 = {
  "username": "username2",
  "mail": "user2@mail.com",
  "password": "password",
  "diners": 0
}

let user3 = {
  "username": "username3",
  "mail": "user3@mail.com",
  "password": "password",
  "diners": 0
}

let ur: any, ur2: any, ur3: any
let accessToken: string, accessToken2 :string, accessToken3: string

beforeAll(async () => {
  createDbConnection()
  await sequelize.sync({ force: true })
  await RunMigrations()
  await request(app).post('/users').send(user)
  await request(app).post('/users').send(user2)
  await request(app).post('/users').send(user3)
  ur = await request(app).post('/users/login').send(user)
  ur2 = await request(app).post('/users/login').send(user2)
  ur3 = await request(app).post('/users/login').send(user3)
  accessToken = ur.body.accessToken
  accessToken2 = ur2.body.accessToken
  accessToken3 = ur3.body.accessToken
  await request(app).post('/edificis?default=true').set('Authorization','Bearer ' + ur.body.accessToken)
  await request(app).post('/edificis?default=true').set('Authorization','Bearer ' + ur2.body.accessToken)
});

afterAll(async () => {
  await sequelize.dropAllSchemas({})
  await sequelize.close()
});

describe('GET /users/:id/availableEvents', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/users/'+ ur.body.id +'/availableEvents')
    expect(response.body.length).toEqual(10)
  })
})

describe('POST /users/:id/completedEvent', () => {
  it('returns code 201', async () => {
    const response = await request(app)
      .post('/users/'+ ur.body.id +'/completedEvent?eventId=1')
      .set('Authorization','Bearer ' + accessToken)
    expect(response.statusCode).toEqual(201)
  })
  it('returns code 400 (already completed)', async () => {
    await request(app)
      .post('/users/'+ ur.body.id +'/completedEvent?eventId=6')
      .set('Authorization','Bearer ' + accessToken)
    const response = await request(app)
      .post('/users/'+ ur.body.id +'/completedEvent?eventId=6')
      .set('Authorization','Bearer ' + accessToken)
    expect(response.statusCode).toEqual(400)
  })
  it('returns code 404', async () => {
    const response = await request(app)
      .post('/users/'+ ur3.body.id +'/completedEvent?eventId=1')
      .set('Authorization','Bearer ' + accessToken3)
    expect(response.statusCode).toEqual(404)
  })
})

describe('POST /users/:id/completedMission', () => {
  it('returns code 201', async () => {
    await request(app)
      .post('/users/'+ ur.body.id +'/completedEvent?eventId=1')
      .set('Authorization','Bearer ' + accessToken)
    const response = await request(app)
    .post('/users/'+ ur.body.id +'/completedMission?missionId=1')
    .set('Authorization','Bearer ' + accessToken)
    expect(response.statusCode).toEqual(201)
  })
  it('returns code 400 (not enough events)', async () => {
    await request(app)
      .post('/users/'+ ur.body.id +'/completedEvent?eventId=1')
      .set('Authorization','Bearer ' + accessToken)
    const response = await request(app)
      .post('/users/'+ ur.body.id +'/completedMission?missionId=2')
      .set('Authorization','Bearer ' + accessToken)
    expect(response.statusCode).toEqual(400)
  })
  it('returns code 400 (already completed)', async () => {
    await request(app)
      .post('/users/'+ ur.body.id +'/completedEvent?eventId=1')
      .set('Authorization','Bearer ' + accessToken)
    await request(app)
      .post('/users/'+ ur.body.id +'/completedMission?missionId=1')
      .set('Authorization','Bearer ' + accessToken)
    const response = await request(app)
      .post('/users/'+ ur.body.id +'/completedMission?missionId=1')
      .set('Authorization','Bearer ' + accessToken)
    expect(response.statusCode).toEqual(400)
  })
})

describe('DELETE /users/:id/completedMissions', () => {
  it('returns code 204', async () => {
    const eventBody = { "eventId": 1 }
    await request(app)
      .post('/users/'+ ur.body.id +'/completedEvent')
      .set('Authorization','Bearer ' + accessToken)
      .send(eventBody)
    const missionBody = { "missionId": 1 }
    await request(app)
      .post('/users/'+ ur.body.id +'/completedMission')
      .set('Authorization','Bearer ' + accessToken)
      .send(missionBody)
    const response = await request(app)
      .delete('/users/'+ ur.body.id +'/completedMissions')
      .set('Authorization','Bearer ' + accessToken)
    expect(response.statusCode).toEqual(204)
  })
})