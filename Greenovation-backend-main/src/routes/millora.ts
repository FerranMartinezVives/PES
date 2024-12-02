import { Router } from 'express'
import { Millora } from '../models/Millora'

export const millora = Router()

export async function getMillora (id: number): Promise<Millora | null> {
  const millora = await Millora.findByPk(id)
  return millora
}

export async function getMilloresPerCategoriaILletra (generals: boolean, categoriaID: number, lletra: string): Promise<Millora[]> {
  let millores: Millora[] = []
  for (let i = lletra.charCodeAt(0) - 64; i <= 7; i++) {
    const m = await Millora.findAll({ where: { esDEdifici: generals, categoriaId: categoriaID, lletraId: i } })
    millores = millores.concat(m)
  }
  return millores
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
millora.get('', async (req, res, next) => {
  try {
    res.json(await Millora.findAll())
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
millora.get('/milloresDEdifici', async (req, res, next) => {
  try {
    const millores = await Millora.findAll({ where: { esDEdifici: true, categoriaId: req.query.categoriaId, lletraId: req.query.lletraId } })
    if (millores == null) { res.status(404).json({ message: 'No hi ha millores edifici' }) } else res.json(millores)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
millora.get('/milloresPisAPis', async (req, res) => {
  try {
    const millores = await Millora.findAll({ where: { esDEdifici: false, categoriaId: req.query.categoriaId, lletraId: req.query.lletraId } })
    if (millores == null) { res.status(404).json({ message: 'No hi ha millores pis a pis' }) } else res.json(millores)
  } catch (err) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
millora.get('/:id', async (req, res, next) => {
  try {
    const millora = await Millora.findByPk(req.params.id)
    if (millora == null) { res.status(404).json({ message: 'No existeix la millora' }) } else res.json(millora)
  } catch (exc) {
    next(exc)
  }
})
