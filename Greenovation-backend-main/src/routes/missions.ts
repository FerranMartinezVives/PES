import { Router } from 'express'
import { Mission } from '../models/Mission'
import { LletraEnergetica } from '../models/LletraEnergetica'
import { Event } from '../models/Event'
import { MissionEvent } from '../models/MissionEvent'

export const missions = Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
missions.get('', async (req, res, next) => {
  try {
    res.status(200).json(await Mission.findAll())
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
missions.get('/:id', async (req, res, next) => {
  try {
    const mission = await Mission.findByPk(req.params.id)
    if (mission == null) res.status(404).json({ message: 'No mission found with this id' })
    else res.status(200).json(mission)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
missions.get('/lletra/:lletra', async (req, res, next) => {
  try {
    const lletra = await LletraEnergetica.findOne({ where: { lletra: req.params.lletra } })
    if (lletra == null) res.status(404).json({ message: 'The letter does not exist' })
    else res.status(200).json(await Mission.findAll({ where: { lletraId: lletra.id } }))
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
missions.get('/lletraIAnteriors/:lletra', async (req, res, next) => {
  try {
    const lletra = await LletraEnergetica.findOne({ where: { lletra: req.params.lletra } })
    if (lletra == null) res.status(404).json({ message: 'The letter does not exist' })
    else {
      let missions: Mission[] = []
      for (let i = req.params.lletra.charCodeAt(0) - 64; i <= 7; i++) {
        missions = missions.concat(await Mission.findAll({ where: { lletraId: i } }))
      }
      missions.sort((a, b) => { return a.id - b.id })
      res.status(200).json(missions)
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
missions.get('/:id/events', async (req, res, next) => {
  try {
    const mission = await Mission.findOne({ where: { id: req.params.id } })
    if (mission == null) res.status(404).json({ message: 'No mission found with this id' })
    else {
      const events: Event[] = []
      const missionEvents = await MissionEvent.findAll({ where: { missionId: req.params.id } })
      for (const mE of missionEvents) {
        const e = await Event.findOne({ where: { id: mE.eventId } })
        if (e == null) res.status(404).json({ message: 'An event of the mission does not exist' })
        else events.push(e)
      }
      res.status(200).json(events)
    }
  } catch (exc) {
    next(exc)
  }
})
