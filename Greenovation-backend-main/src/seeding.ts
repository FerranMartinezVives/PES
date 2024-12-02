import { Categoria } from './models/Categoria'
import { LletraEnergetica } from './models/LletraEnergetica'
import { Millora } from './models/Millora'
import { Event } from './models/Event'
import { Mission } from './models/Mission'
import { MissionEvent } from './models/MissionEvent'
import { User } from './models/User'
import { EdificiDUsuari } from './models/EdificiDUsuari'
import { RecompensaRanking } from './models/RecompensaRanking'

export async function RunMigrations (): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs')
  let obj = JSON.parse(fs.readFileSync('./src/seeders/categories.json', 'utf8'))
  await Categoria.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/lletres.json', 'utf8'))
  await LletraEnergetica.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/millores.json', 'utf8'))
  await Millora.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/milloresPisAPis.json', 'utf8'))
  await Millora.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/events.json', 'utf8'))
  await Event.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/users.json', 'utf8'))
  await User.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/edificis.json', 'utf8'))
  await EdificiDUsuari.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/recompenses.json', 'utf8'))
  await RecompensaRanking.bulkCreate(obj)
  obj = JSON.parse(fs.readFileSync('./src/seeders/missions.json', 'utf8'))
  await Mission.bulkCreate(obj)
  await assignEventsToMissions()
}

async function assignEventsToMissions (): Promise<void> {
  const allEvents = await Event.findAll()
  for (const e of allEvents) {
    await MissionEvent.create({ missionId: 1, eventId: e.id })
  }

  await MissionEvent.create({ missionId: 2, eventId: 1 })
  await MissionEvent.create({ missionId: 2, eventId: 2 })
  await MissionEvent.create({ missionId: 2, eventId: 8 })
  await MissionEvent.create({ missionId: 2, eventId: 9 })

  await MissionEvent.create({ missionId: 3, eventId: 3 })
  await MissionEvent.create({ missionId: 3, eventId: 4 })
  await MissionEvent.create({ missionId: 3, eventId: 5 })
  await MissionEvent.create({ missionId: 3, eventId: 10 })
}
