import { Router } from 'express'
import { TeAplicades } from '../models/TeAplicades'

export const aplicades = Router()

export async function getAplicacio (millora: number, edifici: number): Promise<TeAplicades | null> {
  const aplicacio = await TeAplicades.findOne({ where: { edificiId: edifici, milloraId: millora } })
  return aplicacio
}

export async function getAplicacionsPerEdifici (edifici: number): Promise<TeAplicades[]> {
  const aplicacio = await TeAplicades.findAll({ where: { edificiId: edifici } })
  return aplicacio
}

export async function afegeixAplicacio (millora: number, edifici: number): Promise<TeAplicades> {
  const body = {
    edificiId: edifici,
    milloraId: millora,
    totalCompres: 1
  }
  const aplicacio = await TeAplicades.create(body)
  return aplicacio
}

export async function augmentarTotalCompres (millora: number, edifici: number, quantitat: number): Promise<void> {
  const aplicacio = await TeAplicades.findOne({ where: { edificiId: edifici, milloraId: millora } })
  await aplicacio?.increment('totalCompres', { by: quantitat })
}
