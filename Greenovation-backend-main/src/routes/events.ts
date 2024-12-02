import { Router } from 'express'
import { Event } from '../models/Event'
import { LletraEnergetica } from '../models/LletraEnergetica'

export const events = Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.get('', async (req, res, next) => {
  try {
    res.status(200).json(await Event.findAll())
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (event == null) res.status(404).json({ message: 'No event found with this id' })
    else res.status(200).json(event)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.get('/lletra/:lletra', async (req, res, next) => {
  try {
    const lletra = await LletraEnergetica.findOne({ where: { lletra: req.params.lletra } })
    if (lletra == null) res.status(404).json({ message: 'The letter does not exist' })
    else {
      res.status(200).json(await Event.findAll({ where: { lletraId: lletra.id } }))
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
events.get('/lletraIAnteriors/:lletra', async (req, res, next) => {
  try {
    const lletra = await LletraEnergetica.findOne({ where: { lletra: req.params.lletra } })
    if (lletra == null) res.status(404).json({ message: 'The letter does not exist' })
    else {
      let events: Event[] = []
      for (let i = req.params.lletra.charCodeAt(0) - 64; i <= 7; i++) {
        events = events.concat(await Event.findAll({ where: { lletraId: i } }))
      }
      res.status(200).json(events)
    }
  } catch (exc) {
    next(exc)
  }
})
