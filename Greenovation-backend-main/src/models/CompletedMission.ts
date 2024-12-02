import { Table, Column, Model, AllowNull, CreatedAt, UpdatedAt, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript'
import { User } from './User'
import { Mission } from './Mission'

@Table
export class CompletedMission extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
    id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
    userId!: number

  @ForeignKey(() => Mission)
  @AllowNull(false)
  @Column
    missionId!: number

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
