import { Sequelize } from 'sequelize-typescript'

export let sequelize: Sequelize
if (process.env.NODE_ENV == 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../test.db',
    // eslint-disable-next-line n/no-path-concat
    models: [__dirname + '/models']
  })
} else {
  sequelize = new Sequelize({
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: 'sys',
    host: process.env.DB_HOST ?? 'db',
    port: 3306,
    dialect: 'mysql',
    // eslint-disable-next-line n/no-path-concat
    models: [__dirname + '/models']
  })
}
/*
export const sequelize = new Sequelize({
  username: 'root',
  password: '123456',
  database: 'sys',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  // eslint-disable-next-line n/no-path-concat
  models: [__dirname + '/models']
})
*/
