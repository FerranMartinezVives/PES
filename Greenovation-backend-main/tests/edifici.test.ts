import request from 'supertest'
import app from '../src/app'
import {createDbConnection} from "../src/database";
import {sequelize} from "../src/sequelize";
import {EdificiDUsuari} from "../src/models/EdificiDUsuari";

beforeAll(async () => {
  createDbConnection()
  await sequelize.sync({force: true})
});

afterAll(async () => {
  await sequelize.truncate()
  await sequelize.close()
});

let user = {
  'username': 'GreenovationEnjoyer',
  'mail': 'greenovationenjoyer@gmail.com',
  'password': '1234'
}

let edificiBody = {
  'nom': 'EDIFICI BODY',
  'poblacio': 'Barcelona',
  'direccio':'Avinguda DIAGONAL 10',
  'energia': 100,
  'emissions': 100,
  've': true,
  'solar_fv': true,
  'solar_ter': true,
  'classificacio': 'A'
}

let modificacioEdifici = {
  'direccio':'Direccio prova del put amb id del user'
}

async function getToken() {
  await request(app)
    .post('/users')
    .send(user)
  const token = await request(app)
    .post('/users/login')
    .send(user)
  return token.body.accessToken
}

let token: string

describe('POST /edificis and data manipulation', () => {
  it('returns expected name on post', async () => {
    token = await getToken()
    const response = await request(app)
      .post('/edificis?num_cas=WWR5FS9Z3')
      .set('Authorization','Bearer ' + token)
    expect(response.body.nom).toBe('WWR5FS9Z3')
  })
  it('returns expected name on post', async () => {
    const response = await request(app)
      .post('/edificis?num_cas=WWR5FS9Z3')
      .set('Authorization','Bearer ' + token)
    expect(response.statusCode).toBe(400)
  })
  it('returns 404 on non-existing building put', async () => {
    const response = await request(app)
      .put('/edificis/user/2')
      .set('Authorization','Bearer ' + token)
      .send(modificacioEdifici)
    expect(response.statusCode).toBe(404)
  })
  it('returns correct data on put', async () => {
    const response = await request(app)
      .put('/edificis/user/1')
      .set('Authorization','Bearer ' + token)
      .send(modificacioEdifici)
    expect(response.body.direccio).toBe('Direccio prova del put amb id del user')
  })
  it('returns code 204 on delete', async () => {
    const response = await request(app)
      .delete('/edificis/user/1')
      .set('Authorization','Bearer ' + token)
    expect(response.statusCode).toBe(204)
  })
})

describe('POST /edificis default', () => {
  it('returns code 400 when assigning invalid value to default', async () => {
    token = await getToken()
    const response = await request(app)
      .post('/edificis?default=ERROR')
      .set('Authorization','Bearer ' + token)
    expect(response.statusCode).toBe(400)
  })
  it('returns expected name on post', async () => {
    const response = await request(app)
      .post('/edificis?default=true')
      .set('Authorization','Bearer ' + token)
    expect(response.body.nom).toBe('DEFAULT')
  })
  it('returns code 204 on delete', async () => {
    const response = await request(app)
      .delete('/edificis/user/1')
      .set('Authorization','Bearer ' + token)
    expect(response.statusCode).toBe(204)
  })
})

describe('POST /edificis from without default or building name', () => {
  it('returns error 400 on post', async () => {
    token = await getToken()
    const response = await request(app)
      .post('/edificis')
      .set('Authorization','Bearer ' + token)
      .send(edificiBody)
    expect(response.statusCode).toBe(400)
  })
})
