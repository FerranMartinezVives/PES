import { Router } from 'express'
import { LletraEnergetica } from '../models/LletraEnergetica'

export const lletra = Router()

export async function getLletra (classificacio: string): Promise<LletraEnergetica | null> {
  const lletra = await LletraEnergetica.findOne({ where: { lletra: classificacio } })
  return lletra
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
lletra.get('/perLletra/:lletra', async (req, res, next) => {
  try {
    const lletra = await LletraEnergetica.findOne({ where: { lletra: req.params.lletra } })
    if (lletra == null) { res.status(404).json({ message: 'No existeix cap lletra amb aquesta etiqueta' }) } else res.json(lletra)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
lletra.get('', async (req, res, next) => {
  try {
    res.json(await LletraEnergetica.findAll())
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
lletra.get('/:id', async (req, res, next) => {
  try {
    const lletra = await LletraEnergetica.findByPk(req.params.id)
    if (lletra == null) { res.status(404).json({ message: 'No existeix cap lletra amb aquest id' }) } else res.json(lletra)
  } catch (exc) {
    next(exc)
  }
})
