import { Model, Column, Table, CreatedAt, UpdatedAt, AllowNull, Unique, HasMany } from 'sequelize-typescript'
import { Millora } from './Millora'
import { Event } from './Event'

@Table
export class LletraEnergetica extends Model {
  @AllowNull(false)
  @Unique
  @Column
    lletra!: string

  @AllowNull(false)
  @Column
    maxConsum!: number

  @AllowNull(false)
  @Column
    maxEmissions!: number

  @AllowNull(false)
  @Column
    costInspeccio!: number

  @AllowNull(false)
  @Column
    multiplicador!: number

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date

  @HasMany(() => Millora, 'lletraId')
    millores?: Millora[]

  @HasMany(() => Event, 'lletraId')
    events?: Event[]
}
