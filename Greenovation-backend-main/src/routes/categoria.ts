import { Router } from 'express'
import { Categoria } from '../models/Categoria'

export const categoria = Router()

export async function existeixCategoria (id: number): Promise<boolean> {
  const cat = await Categoria.findByPk(id)
  if (cat == null) return false
  return true
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
categoria.get('', async (req, res, next) => {
  try {
    res.json(await Categoria.findAll())
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
categoria.get('/:id', async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id)
    if (categoria == null) { res.status(404).json({ message: 'No existeix cap categoria amb aquest id' }) } else res.json(categoria)
  } catch (exc) {
    next(exc)
  }
})
