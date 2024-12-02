import { Table, Column, Model, AllowNull, CreatedAt, UpdatedAt, BelongsToMany } from 'sequelize-typescript'
import { Mission } from './Mission'
import { MissionEvent } from './MissionEvent'

@Table
export class Event extends Model {
  @AllowNull(false)
  @Column
    nameCat!: string

  @AllowNull(false)
  @Column
    nameEsp!: string

  @AllowNull(false)
  @Column
    nameEng!: string

  @AllowNull(false)
  @Column
    descriptionCat!: string

  @AllowNull(false)
  @Column
    descriptionEsp!: string

  @AllowNull(false)
  @Column
    descriptionEng!: string

  @Column
    energy!: number

  @Column
    CO2!: number

  @Column
    happiness!: number

  @AllowNull(false)
  @Column
    money!: number

  @BelongsToMany(() => Mission, () => MissionEvent)
    missions?: Mission[]

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
