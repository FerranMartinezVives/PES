import { Router } from 'express'
import { RecompensaRanking } from '../models/RecompensaRanking'

export const recompensa = Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
recompensa.get('', async (req, res, next) => {
  try {
    res.json(await RecompensaRanking.findAll())
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
recompensa.get('/:id', async (req, res, next) => {
  try {
    const recompensa = await RecompensaRanking.findByPk(req.params.id)
    if (recompensa == null) { res.status(404).json({ message: 'No existeix cap recompensa amb aquest id' }) } else res.json(recompensa)
  } catch (exc) {
    next(exc)
  }
})
