import { Router } from 'express'
import { EdificiDUsuari } from '../models/EdificiDUsuari'
import { getEdificis, type Response } from './dadesObertes'
import { validateToken, afegirDiners, addAvailableMissions, getUser } from './users'
import { CronJob } from 'cron'
import { TeAplicades } from '../models/TeAplicades'
import { aplicarMillora, milloresAplicables } from './aplicarMillora'
import { LletraEnergetica } from '../models/LletraEnergetica'
import { RecompensaRanking } from '../models/RecompensaRanking'
import Expo from 'expo-server-sdk'
import * as FirebaseService from '../FirebaseService'

export const edificisdusuari = Router()

const expo = new Expo()

const lletresDiners: Record<string, number> = {
  A: 7000,
  B: 6000,
  C: 5000,
  D: 4000,
  E: 3000,
  F: 2000,
  G: 1000
}
const maxCons: Record<string, number> = {
  A: 45,
  B: 65,
  C: 100,
  D: 155,
  E: 250,
  F: 320,
  G: Infinity
}
const minCons: Record<string, number> = {
  A: 0,
  B: 46,
  C: 66,
  D: 101,
  E: 156,
  F: 251,
  G: 321
}

const notificacions: Record<string, { title: string, body: string }> = {
  ca: {
    title: 'Mensualitat rebuda',
    body: 'Has rebut la mensualitat per gestionar el teu edifici'
  },
  es: {
    title: 'Mensualidad recibida',
    body: 'Has recibido la mensualidad por gestionar tu edificio'
  },
  en: {
    title: 'Monthly payment received',
    body: 'You have received your monthly payment for managing your building'
  }
}

function ajustarConsum (consum: any, lletra: string): number {
  consum = consum !== null ? consum : maxCons[lletra]
  consum = consum < minCons[lletra] || consum > maxCons[lletra] ? maxCons[lletra] : consum
  return consum
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const job = new CronJob(
  '0 25 9 * * 4',
  async function () {
    const edificis: EdificiDUsuari[] = await EdificiDUsuari.findAll()
    for (let i = 0; i < edificis.length; i++) {
      await afegirDiners(edificis[i].userId, edificis[i].dinersAlMes)
      const { token } = await FirebaseService.getToken(String(edificis[i].userId))
      if (token != null) {
        const user = await getUser(edificis[i].userId)
        if (user != null) {
          await expo.sendPushNotificationsAsync([
            {
              to: token,
              title: notificacions[user.idioma].title,
              body: notificacions[user.idioma].body
            }
          ])
        }
      }
    }
  },
  null,
  true,
  'Europe/Madrid')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const recompenses = new CronJob(
  '0 0 10 1,15 * *',
  async function () {
    const recompenses = await RecompensaRanking.findAll()
    for (let i = 65; i < 72; i++) {
      const edificis: EdificiDUsuari[] = await EdificiDUsuari.findAll({ where: { classificacio: String.fromCharCode(i) }, order: [['energia', 'ASC']] })
      const lletra = await LletraEnergetica.findOne({ where: { lletra: String.fromCharCode(i) } })
      let j = 0
      let y = 0
      while (j <= 10 && j != edificis.length) {
        if (lletra != null) await afegirDiners(edificis[j].userId, recompenses[y].recompensa * lletra.multiplicador)
        j++
        if (y < 3) y++
      }
    }
  },
  null,
  true,
  'Europe/Madrid')

export async function reduirEmissions (id: number, quantitat: number): Promise<void> {
  const edifici = await EdificiDUsuari.findByPk(id)
  await edifici?.decrement('emissions', { by: quantitat })
}

export async function getEdifici (id: number): Promise<EdificiDUsuari | null> {
  const edifici = await EdificiDUsuari.findByPk(id)
  return edifici
}

export async function reduirEnergia (id: number, quantitat: number): Promise<void> {
  const edifici = await EdificiDUsuari.findByPk(id)
  if (edifici != null && edifici.energia - quantitat >= 0) await edifici.decrement('energia', { by: quantitat })
  else if (edifici != null) edifici.energia = 0
}

export async function augmentarFelicitat (id: number, quantitat: number): Promise<void> {
  const edifici = await EdificiDUsuari.findByPk(id)
  if (edifici != null && edifici.felicitatVeins + quantitat <= 100) await edifici.increment('felicitatVeins', { by: quantitat })
  else if (edifici != null) edifici.felicitatVeins = 100
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.post('/', validateToken, async (req, res, next) => {
  if (req.query.default === 'true') {
    const body = {
      nom: 'DEFAULT',
      poblacio: 'Barcelona',
      direccio: 'Carrer PARIS 10',
      energia: '253',
      emissions: '65',
      ve: false,
      solar_fv: false,
      solar_ter: false,
      classificacio: 'F',
      dinersAlMes: 2000,
      energiaIni: '253',
      classificacioIni: 'F',
      // @ts-ignore
      userId: req.user.user
    }
    try {
      const edificidusuari = await EdificiDUsuari.create(body)
      // @ts-ignore
      await addAvailableMissions(req.user.user)
      res.status(201).json(edificidusuari)
    } catch {
      res.status(400).json({ message: 'Invalid parameters in the query' })
    }
  } else if (req.query.num_cas != null) {
    // @ts-ignore
    const id = req.user.user
    try {
      delete req.query.default
      const result: Response[] = await getEdificis(req)
      if (result.length === 0) res.status(404).json({ message: 'No building found with this identifier' })
      else {
        const entry = result[0]
        entry.energia_prim_ria_no_renovable = ajustarConsum(entry.energia_prim_ria_no_renovable, entry.qualificaci_de_consum_d)
        const body = {
          nom: entry.num_cas,
          poblacio: entry.poblacio,
          direccio: entry.adre_a + ' ' + entry.numero,
          energia: entry.energia_prim_ria_no_renovable,
          emissions: entry.emissions_de_co2,
          ve: entry.vehicle_electric === 'SI',
          solar_fv: entry.solar_fotovoltaica === 'SI',
          solar_ter: entry.solar_termica === 'SI',
          classificacio: entry.qualificaci_de_consum_d,
          dinersAlMes: lletresDiners[entry.qualificaci_de_consum_d],
          energiaIni: entry.energia_prim_ria_no_renovable,
          classificacioIni: entry.qualificaci_de_consum_d,
          userId: id
        }
        const edificidusuari = await EdificiDUsuari.create(body)
        await addAvailableMissions(id)
        res.status(201).json(edificidusuari)
      }
    } catch {
      res.status(400).json({ message: 'Invalid parameters in the query' })
    }
  } else {
    res.status(400).json({ message: 'Invalid request' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.post('/:id/aplicarMillora', async (req, res, next) => {
  try {
    const aplicacio = await aplicarMillora(Number(req.query.milloraId), Number(req.params.id))
    if (aplicacio === 'No existeix edifici') res.status(404).json({ message: 'Aquest edifici no existeix' })
    else if (aplicacio === 'No existeix la millora') res.status(404).json({ message: 'Aquesta millora no existeix' })
    else if (aplicacio === 'No ho pot pagar') res.status(404).json({ message: 'No hi ha suficients diners' })
    else if (aplicacio === 'No pot aplicar més millores') res.status(404).json({ message: 'Aquest edifici ja té el número màxim per aquesta millora' })
    else res.json(aplicacio)
  } catch (exc) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.get('', async (req, res, next) => {
  try {
    if (req.query.lletra != null) {
      res.json(await EdificiDUsuari.findAll({ where: { classificacio: req.query.lletra }, order: [['energia', 'ASC']] }))
    } else {
      res.json(await EdificiDUsuari.findAll({ order: [['classificacio', 'ASC'], ['energia', 'ASC']] }))
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.get('/user/:userId', async (req, res, next) => {
  try {
    const edifici = await EdificiDUsuari.findOne({ where: { userId: req.params.userId } })
    if (edifici == null) { res.status(404).json({ message: 'No building found whose user has this id' }) }
    res.json(edifici)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.get('/recompensesRanking/:lletra', async (req, res, next) => {
  try {
    const recompenses = await RecompensaRanking.findAll()
    const lletra = await LletraEnergetica.findOne({ where: { lletra: req.params.lletra } })
    if (lletra == null) res.status(404).json({ message: 'No existeix aquesta lletra' })
    else {
      for (let i = 0; i < recompenses.length; i++) {
        recompenses[i].recompensa *= lletra.multiplicador
      }
      res.json(recompenses)
    }
  } catch (exc) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.get('/:id/aplicacions', async (req, res, next) => {
  try {
    const aplicacions = await TeAplicades.findAll({ where: { edificiId: req.params.id } })
    if (aplicacions == null) { res.status(404).json({ message: 'Aquest edifici no té millores aplicades' }) }
    res.json(aplicacions)
  } catch (exc) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.get('/:id/milloresAplicables', async (req, res, next) => {
  try {
    let esDEdifici
    if (req.query.esDEdifici === 'true') esDEdifici = true
    else esDEdifici = false
    const millores = await milloresAplicables(Number(req.params.id), Number(req.query.categoriaId), esDEdifici)
    if (millores === 'No existeix edifici') res.status(404).json({ message: 'Aquest edifici no existeix' })
    else if (millores === 'No existeix categoria') res.status(404).json({ message: 'Aquesta categoria no existeix' })
    else if (millores === 'No hi ha millores a aplicar') res.status(404).json({ message: 'No hi ha millores aplicables' })
    else res.json(millores)
  } catch (exc) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.get('/:id', async (req, res, next) => {
  try {
    const edifici = await EdificiDUsuari.findByPk(req.params.id)
    if (edifici == null) { res.status(404).json({ message: 'No building found with this id' }) }
    res.json(edifici)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.put('/user/:userId', validateToken, async (req, res, next) => {
  try {
    delete req.body.id
    delete req.body.userId
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await EdificiDUsuari.update(req.body, { where: { userId: req.params.userId } })
    const edifici = await EdificiDUsuari.findOne({ where: { userId: req.params.userId } })
    if (edifici == null) {
      res.status(404).json({ message: 'No building found whose user has this id' })
    } else {
      // @ts-ignore
      if (req.params.userId != req.user.user) {
        res.status(401).json({ message: 'Unauthorized to edit this building' })
      } else {
        res.status(200).json(edifici)
      }
    }
  } catch (exc) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.put('/:id', validateToken, async (req, res, next) => {
  try {
    delete req.body.id
    delete req.body.userId
    let edifici = await EdificiDUsuari.findByPk(req.params.id)
    if (edifici == null) {
      res.status(404).json({ message: 'No building found with this id' })
    } else {
      // @ts-ignore
      if (edifici.userId != req.user.user) {
        res.status(401).json({ message: 'Unauthorized to edit this building' })
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await EdificiDUsuari.update(req.body, { where: { id: req.params.id } })
        edifici = await EdificiDUsuari.findByPk(req.params.id)
        res.status(200).json(edifici)
      }
    }
  } catch (exc) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.delete('/user/:userId', validateToken, async (req, res, next) => {
  try {
    const edifici = await EdificiDUsuari.findOne({ where: { userId: req.params.userId } })
    if (edifici == null) {
      res.status(404).json({ message: 'No building found whose user has this id' })
    } else {
      // @ts-ignore
      if (req.params.userId != req.user.user) {
        res.status(401).json({ message: 'Unauthorized to edit this building' })
      } else {
        await EdificiDUsuari.destroy({ where: { userId: req.params.userId } })
        res.sendStatus(204)
      }
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
edificisdusuari.delete('/:id', async (req, res, next) => {
  try {
    const edifici = await EdificiDUsuari.findByPk(req.params.id)
    if (edifici == null) {
      res.status(404).json({ message: 'No building found with this id' })
    } else {
      // @ts-ignore
      if (edifici?.userId != req.user.user) {
        res.status(401).json({ message: 'Unauthorized to edit this building' })
      } else {
        await EdificiDUsuari.destroy({ where: { id: req.params.id } })
        res.sendStatus(204)
      }
    }
  } catch (exc) {
    next(exc)
  }
})
