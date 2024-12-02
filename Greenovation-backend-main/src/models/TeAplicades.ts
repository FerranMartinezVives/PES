import { Model, Column, Table, ForeignKey, CreatedAt, UpdatedAt, AllowNull } from 'sequelize-typescript'
import { EdificiDUsuari } from './EdificiDUsuari'
import { Millora } from './Millora'

@Table
export class TeAplicades extends Model {
  @ForeignKey(() => EdificiDUsuari)
  @AllowNull(false)
  @Column
    edificiId!: number

  @ForeignKey(() => Millora)
  @AllowNull(false)
  @Column
    milloraId!: number

  @AllowNull(false)
  @Column
    totalCompres!: number

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
