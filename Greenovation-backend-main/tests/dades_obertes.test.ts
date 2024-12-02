import request from 'supertest'
import app from '../src/app'

describe('GET /dadesObertes', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/dadesObertes')
    expect(response.statusCode).toBe(200)
  })
  it('searches according to parameters', async () => {
    const response = await request(app).get('/dadesObertes?poblacio=Barcelona')
    expect(response.statusCode).toBe(200)
    expect(response.body[0].poblacio).toEqual('Barcelona')
  })
})

describe('GET /dadesObertes/alternatives',() =>{
  it('returns code 200 and buildings with expected coordinates', async () => {
    const response = await request(app).get('/dadesObertes/alternatives?latitude=41.388099&longitude=2.148293&radius=100')
    expect(response.statusCode).toBe(200)
    let latitude = response.body[0].georeferencia.coordinates[1]
    let longitude = response.body[0].georeferencia.coordinates[0]
    let valid = 2.14 <= longitude && 2.15 >= longitude && 41.38 <= latitude && 41.39 >= latitude
    expect(valid).toEqual(true)
  })
})
