import { Model, Column, Table, ForeignKey, CreatedAt, UpdatedAt, AllowNull, BelongsToMany } from 'sequelize-typescript'
import { Categoria } from './Categoria'
import { LletraEnergetica } from './LletraEnergetica'
import { TeAplicades } from './TeAplicades'
import { EdificiDUsuari } from './EdificiDUsuari'

@Table
export class Millora extends Model {
  @AllowNull(false)
  @Column
    nomCat!: string

  @AllowNull(false)
  @Column
    nomEsp!: string

  @AllowNull(false)
  @Column
    nomEng!: string

  @AllowNull(false)
  @Column
    descripcioCat!: string

  @AllowNull(false)
  @Column
    descripcioEsp!: string

  @AllowNull(false)
  @Column
    descripcioEng!: string

  @AllowNull(false)
  @Column
    reasoningCat!: string

  @AllowNull(false)
  @Column
    reasoningEsp!: string

  @AllowNull(false)
  @Column
    reasoningEng!: string

  @AllowNull(false)
  @Column
    cost!: number

  @AllowNull(false)
  @Column
    reduccioEnergia!: number

  @AllowNull(false)
  @Column
    reduccioCO2!: number

  @AllowNull(false)
  @Column
    milloraFelicitat!: number

  @AllowNull(false)
  @Column
    esDEdifici!: boolean

  @AllowNull(false)
  @Column
    tempsDObra!: number

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date

  @ForeignKey(() => Categoria)
  @AllowNull(false)
  @Column
    categoriaId!: number

  @ForeignKey(() => LletraEnergetica)
  @AllowNull(false)
  @Column
    lletraId!: number

  @BelongsToMany(() => EdificiDUsuari, () => TeAplicades)
    edificis?: EdificiDUsuari[]
}
