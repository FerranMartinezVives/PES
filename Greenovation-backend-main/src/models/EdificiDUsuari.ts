import {
  Model,
  Column,
  Table,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  AllowNull,
  Default,
  Unique,
  DataType,
  BelongsToMany
} from 'sequelize-typescript'
import { User } from './User'
import { Millora } from './Millora'
import { TeAplicades } from './TeAplicades'

@Table
export class EdificiDUsuari extends Model {
  @AllowNull(false)
  @Column
    nom!: string

  @AllowNull(false)
  @Column
    poblacio!: string

  @AllowNull(false)
  @Column
    direccio!: string

  @AllowNull(false)
  @Column(DataType.FLOAT)
    energia!: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
    emissions!: number

  @AllowNull(false)
  @Column
    ve!: boolean

  @AllowNull(false)
  @Column
    solar_fv!: boolean

  @AllowNull(false)
  @Column
    solar_ter!: boolean

  @AllowNull(false)
  @Column
    classificacio!: string

  @Default(75)
  @Column
    felicitatVeins!: number

  @Default(100)
  @Column
    dinersAlMes!: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
    energiaIni!: number

  @AllowNull(false)
  @Column
    classificacioIni!: string

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date

  @ForeignKey(() => User)
  @Unique
  @AllowNull(false)
  @Column
    userId!: number

  @BelongsToMany(() => Millora, () => TeAplicades)
    millores?: Millora[]
}
