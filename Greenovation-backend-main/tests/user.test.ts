import {sequelize} from "../src/sequelize"
import request from "supertest"
import app from "../src/app"
import {createDbConnection} from "../src/database"

beforeAll(async () => {
  createDbConnection()
  await sequelize.sync({force: true})
});

afterAll(async () => {
  await sequelize.truncate()
  await sequelize.close()
});

let body = {
  'username': 'GreenovationEnjoyer',
  'mail': 'greenovationenjoyer@gmail.com',
  'password': '1234'
}

let body1 = {
  'mail': 'greenovationenjoyer@gmail.com',
  'password': '1234'
}

let body2 = {
  'username': 'GreenovationEnjoyer',
  'password': '1234'
}

let body3 = {
  'username': 'GreenovationEnjoyer',
  'mail': 'greenovationenjoyer@gmail.com'
}

let bodyIncorrectUsername = {
  'username': 'GreenovationHater',
  'password': '1234'
}

let bodyIncorrectPassword = {
  'username': 'GreenovationEnjoyer',
  'password': '4321'
}

let bodyEdit = {
  'username': 'Edited Username'
}

let bodyIncorrectAvatar = {
  'avatar': -1
}

describe('GET /users', () => {
  it('returns code 200', async () => {
    const response = await request(app).get('/users')
    expect(response.statusCode).toBe(200)
  })
})

describe('POST user, confirm repeats are not allowed and GET user information', () => {
  it('returns code 201', async () => {
    const response = await request(app)
      .post('/users')
      .send(body)
    expect(response.statusCode).toBe(201)
  })
  it('returns code 400', async () => {
    const response = await request(app)
      .post('/users')
      .send(body)
    expect(response.statusCode).toBe(400)
  })
  it('returns uploaded information', async () => {
    const response = await request(app)
      .get('/users/1')
    let reqUser = response.body
    let valid = 1 == reqUser.id && body.username == reqUser.username && body.mail == reqUser.mail && reqUser.avatar == 1
    expect(valid).toBe(true)
  })
})

describe('POST incorrect user', () => {
  it('returns code 400 when no username', async () => {
    const response = await request(app)
      .post('/users')
      .send(body1)
    expect(response.statusCode).toBe(400)
  })
  it('returns code 400 when no mail', async () => {
    const response = await request(app)
      .post('/users')
      .send(body2)
    expect(response.statusCode).toBe(400)
  })
  it('returns code 400 when no mail', async () => {
    const response = await request(app)
      .post('/users')
      .send(body3)
    expect(response.statusCode).toBe(400)
  })
})

describe('login', () => {
  it('returns code 400 when missing username', async () => {
    await request(app)
      .post('/users')
      .send(body)
    const response = await request(app)
      .post('/users/login')
      .send(body1)
    expect(response.statusCode).toBe(400)
  })
  it('returns code 404 when user not found', async () => {
    const response = await request(app)
      .post('/users/login')
      .send(bodyIncorrectUsername)
    expect(response.statusCode).toBe(404)
  })
  it('returns code 401 when missing password', async () => {
    const response = await request(app)
      .post('/users/login')
      .send(bodyIncorrectPassword)
    expect(response.statusCode).toBe(401)
  })
  it('returns code 200 when correct information', async () => {
    const response = await request(app)
      .post('/users/login')
      .send(body)
    expect(response.statusCode).toBe(200)
  })
})

describe('DELETE /users/:id with verification', () => {
  let token: import("superagent/lib/node/response")
  it('returns code 400 when no token', async () => {
    await request(app)
      .post('/users')
      .send(body)
    const response = await request(app)
      .delete('/users/1')
    expect(response.statusCode).toBe(400)
  })
  it('returns code 403 when incorrect token', async () => {
    await request(app)
      .post('/users')
      .send(body)
    const response = await request(app)
      .delete('/users/1')
      .set('Authorization','Bearer IamNotAValidToken')
    expect(response.statusCode).toBe(403)
  })
  it('returns code 204 when OK', async () => {
    token = await request(app)
      .post('/users/login')
      .send(body)
    const response = await request(app)
      .delete('/users/1')
      .set('Authorization','Bearer ' + token.body.accessToken)
    expect(response.statusCode).toBe(204)
  })
  it('returns code 404 when user does not exist', async () => {
    const response = await request(app)
      .delete('/users/1')
      .set('Authorization','Bearer ' + token.body.accessToken)
    expect(response.statusCode).toBe(404)
  })
})

describe('PUT /users/:id', () => {
  it('returns code 200', async () => {
    await request(app)
      .post('/users')
      .send(body)
    const token = await request(app)
      .post('/users/login')
      .send(body)
    await request(app)
      .put('/users/1')
      .set('Authorization','Bearer ' + token.body.accessToken)
      .send(bodyEdit)
    const response = await request(app)
      .get('/users/1')
    expect(response.body.username == bodyEdit.username)
  })
  it('returns code 200', async () => {
    const token = await request(app)
      .post('/users/login')
      .send(body)
    const response = await request(app)
      .put('/users/' + token.body.id)
      .set('Authorization','Bearer ' + token.body.accessToken)
      .send(bodyIncorrectAvatar)
    expect(response.statusCode).toBe(400)
  })
})
