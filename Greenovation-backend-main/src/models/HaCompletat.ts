import { Model, Column, Table, ForeignKey, CreatedAt, UpdatedAt, AllowNull } from 'sequelize-typescript'
import { User } from './User'
import { Event } from './Event'

@Table
export class HaCompletat extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
    userId!: number

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column
    eventId!: number

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
