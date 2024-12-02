import { sequelize } from '../src/sequelize'
import request from 'supertest'
import app from '../src/app'
import { createDbConnection } from '../src/database'
import { RunMigrations } from '../src/seeding'

let usuariRic = {
  "username": "usuariRic",
  "mail": "ric@mail.com",
  "password": "1234"
}

let u: any

beforeAll(async () => {
  createDbConnection()
  await sequelize.sync({ force: true })
  await RunMigrations()
  u = await request(app).post('/users').send(usuariRic)
  const ur = await request(app).post('/users/login').send(usuariRic)
  const e = await request(app).post('/edificis?default=true').set('Authorization','Bearer ' + ur.body.accessToken)
  energiaOriginal = e.body.energia
  dinersOriginal = u.body.diners
});

let energiaOriginal: number
let dinersOriginal: number


afterAll(async () => {
  await sequelize.dropAllSchemas({})
  await sequelize.close()
});

describe('POST /aplicarMillora general', () => {
  it('no existeix la millora', async () => {
    const response = await request(app).post('/edificis/'+ u.body.id +'/aplicarMillora?milloraId=100')
    expect(response.statusCode).toEqual(404)
  })
  it('no existeix edifici', async () => {
    const response = await request(app).post('/edificis/50/aplicarMillora?milloraId=1')
    expect(response.statusCode).toEqual(404)
  })
  it('millora aplicada correctament', async () => {
    const response = await request(app).post('/edificis/'+ u.body.id +'/aplicarMillora?milloraId=1')
    expect(response.statusCode).toEqual(200)
  })
  it('té aplicades el màxim número de millores', async () => {
    const response = await request(app).post('/edificis/'+ u.body.id +'/aplicarMillora?milloraId=1')
    expect(response.statusCode).toEqual(404)
  })
})

describe('actualitzar dades', () => {
  it('diners', async () => {
    const response = await request(app).get('/users/'+ u.body.id +'')
    expect(response.body.diners).toEqual(dinersOriginal - 2000)
  })
  it('energia', async () => {
    const response = await request(app).get('/edificis/'+ u.body.id +'')
    expect(response.body.energia).toEqual(energiaOriginal - 5)
  })
  it('aplicacions', async () => {
    const response = await request(app).get('/edificis/'+ u.body.id +'/aplicacions')
    expect(response.body[0].milloraId).toEqual(1)
    expect(response.body[0].edificiId).toEqual(u.body.id)
  })
  it('actualitzar lletra', async () => {
    const response = await request(app).get('/edificis/'+ u.body.id)
    expect(response.body.classificacio).toMatch('E')
  })
})

describe('GET /milloresAplicables', () => {
  it('no existeix categoria', async () => {
    const response = await request(app).get('/edificis/1/milloresAplicables?categoriaId=20&esDEdifici=true')
    expect(response.statusCode).toEqual(404)
  })
  it('no existeix edifici', async () => {
    const response = await request(app).get('/edificis/50/milloresAplicables?categoriaId=2&esDEdifici=true')
    expect(response.statusCode).toEqual(404)
  })
  it('pot aplicar millores generals en aquesta categoria', async () => {
    const response = await request(app).get('/edificis/1/milloresAplicables?categoriaId=2&esDEdifici=true')
    expect(response.body[0].id).toEqual(14)
  })
  it('ja no surt la millora recent aplicada', async () => {
    const millora = await request(app).post('/edificis/1/aplicarMillora?milloraId=14')
    const response = await request(app).get('/edificis/1/milloresAplicables?categoriaId=2&esDEdifici=true')
    expect(response.body[0].id).toEqual(19)
  })
})

describe('POST /aplicarMillora pis', () => {
  it('1a aplicació', async () => {
    const response = await request(app).post('/edificis/1/aplicarMillora?milloraId=26')
    expect(response.statusCode).toEqual(200)
  })
  it('2a aplicació', async () => {
    const response = await request(app).post('/edificis/1/aplicarMillora?milloraId=26')
    expect(response.statusCode).toEqual(200)
  })
})
