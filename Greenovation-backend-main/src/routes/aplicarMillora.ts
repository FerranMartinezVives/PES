import { augmentarFelicitat, getEdifici, reduirEmissions, reduirEnergia } from './edificisdusuari'
import { augmentarTotalCompres, afegeixAplicacio, getAplicacio, getAplicacionsPerEdifici } from './teAplicades'
import { getMillora, getMilloresPerCategoriaILletra } from './millora'
import { getUser, pagar, pujaDeLletra } from './users'
import { existeixCategoria } from './categoria'
import { getLletra } from './lletraEnergetica'

export async function aplicarMillora (milloraID: number, edificiID: number): Promise<string> {
  const edifici = await getEdifici(edificiID)
  if (edifici == null) return 'No existeix edifici'
  const millora = await getMillora(milloraID)
  if (millora == null) return 'No existeix la millora'
  const user = await getUser(edifici.userId)
  if (user != null && user.diners < millora.cost) return 'No ho pot pagar'

  let aplicacio = await getAplicacio(milloraID, edificiID)
  if (aplicacio == null) aplicacio = await afegeixAplicacio(milloraID, edificiID)
  else if (millora.esDEdifici) return 'No pot aplicar més millores'
  else {
    if (aplicacio.totalCompres == 10) return 'No pot aplicar més millores'
    await augmentarTotalCompres(milloraID, edificiID, 1)
    aplicacio = await getAplicacio(milloraID, edificiID)
  }
  await pagar(edifici.userId, millora.cost)
  if (edifici.energia > 0) await reduirEnergia(edificiID, millora.reduccioEnergia)
  await reduirEmissions(edificiID, edifici.emissions)
  if (edifici.felicitatVeins < 100) await augmentarFelicitat(edificiID, millora.milloraFelicitat)

  const lletra = await getLletra(edifici.classificacio)
  if (lletra == null) return 'No existeix la lletra'
  if (await pujaDeLletra(edificiID, lletra.maxConsum)) return 'Ha pujat de lletra'
  return 'OK'
}

export async function milloresAplicables (edificiID: number, categoriaID: number, esDEdifici: boolean): Promise<any> {
  const edifici = await getEdifici(edificiID)
  if (edifici == null) return 'No existeix edifici'
  if (!await existeixCategoria(categoriaID)) return 'No existeix categoria'
  let millores = await getMilloresPerCategoriaILletra(esDEdifici, categoriaID, edifici.classificacio)

  // s'ha de treure les millores ja aplicades
  const aplicacions = await getAplicacionsPerEdifici(edificiID)
  for (let i = 0; i < aplicacions.length; i++) {
    if (esDEdifici) millores = millores.filter(c => c.id !== aplicacions[i].milloraId)
    else if (aplicacions[i].totalCompres == 10) millores = millores.filter(c => c.id !== aplicacions[i].milloraId)
  }

  if (millores.length == 0) return 'No hi ha millores a aplicar'
  return millores
}
