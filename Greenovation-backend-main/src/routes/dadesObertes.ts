import type express from 'express'
import { Router } from 'express'
import axios from 'axios'

export const dadesObertes = Router()

export interface Response {
  num_cas: string
  adre_a: string
  numero: string
  escala: string
  pis: string
  porta: string
  codi_postal: string
  poblacio: string
  comarca: string
  nom_provincia: string
  codi_poblacio: string
  codi_comarca: string
  codi_provincia: string
  referencia_cadastral: string
  zona_climatica: string
  metres_cadastre: number
  us_edifici: string
  qualificaci_de_consum_d: string
  energia_prim_ria_no_renovable: number
  qualificacio_d_emissions: string
  emissions_de_co2: number
  consum_d_energia_final: number
  cost_anual_aproximat_d_energia: number
  vehicle_electric: string
  solar_termica: string
  solar_fotovoltaica: string
  sistema_biomassa: string
  xarxa_districte: string
  energia_geotermica: string
  eina_de_certificacio: string
  valor_aillaments: number
  valor_finestres: number
  motiu_de_la_certificacio: string
  valor_aillaments_cte: number
  valor_finestres_cte: number
  utm_x: number
  utm_y: number
  normativa_construcci: string
  tipus_tramit: string
  qualificaci_emissions: string
  emissions_calefacci: number
  qualificaci_emissions_1: string
  emissions_refrigeraci: number
  qualificaci_emissions_acs: string
  emissions_acs: number
  emissions_enllumenament: number
  qualificaci_energia_calefacci: string
  energia_calefacci: number
  qualificaci_energia: string
  energia_refrigeraci: number
  qualificaci_energia_acs: string
  energia_acs: number
  energia_enllumenament: number
  qualificaci_energia_calefacci_1: string
  energia_calefacci_demanda: number
  qualificaci_energia_2: string
  energia_refrigeraci_demanda: number
  longitud: number
  latitud: number
  georeferencia: {
    type: string
    coordinates: [number, number]
  }
  rehabilitacio_energetica: string
  data_entrada: string
}
export async function getEdificis (req: express.Request): Promise<Response[]> {
  const options = {
    method: 'GET',
    url: 'https://analisi.transparenciacatalunya.cat/resource/j6ii-t3w2.json',
    params: req.query,
    headers: {
      accept: 'application/json'
    }
  }
  const response = axios.request(options)
  const { data } = await response
  return data
}

async function getAlternatives (req: express.Request): Promise<Response[]> {
  const query = {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    $where: 'within_circle(georeferencia, ' + req.query.latitude + ', ' + req.query.longitude + ', ' + req.query.radius + ')'
  }
  const options = {
    method: 'GET',
    url: 'https://analisi.transparenciacatalunya.cat/resource/j6ii-t3w2.json',
    params: query,
    headers: {
      accept: 'application/json'
    }
  }
  const response = axios.request(options)
  const { data } = await response
  return data
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
dadesObertes.get('', async (req, res) => {
  try {
    const result: Response[] = await getEdificis(req)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
dadesObertes.get('/alternatives', async (req, res) => {
  try {
    const result: Response[] = await getAlternatives(req)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: 'Invalid parameters in the query' })
  }
})
