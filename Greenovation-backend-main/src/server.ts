import { createServer } from 'http'
import app from './app'
import { sequelize } from './sequelize'
import { RunMigrations } from './seeding'

const port = process.env.PORT ?? 3000

void (async () => {
  await sequelize.sync({ force: true })
  await RunMigrations()
  createServer(app)
    .listen(
      port,
      () => { console.info(`Server running on port ${port}`) }
    )
})()
