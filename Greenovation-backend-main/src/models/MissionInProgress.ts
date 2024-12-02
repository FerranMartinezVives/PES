import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  Default
} from 'sequelize-typescript'
import { User } from './User'
import { Mission } from './Mission'
import { CompletedEvent } from './CompletedEvent'
import { MissionEvent } from './MissionEvent'

@Table
export class MissionInProgress extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
    id!: number

  @ForeignKey(() => Mission)
  @AllowNull(false)
  @Column
    missionId!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
    userId!: number

  @AllowNull(false)
  @Default(0)
  @Column
    numCompletedEvents!: number

  @BelongsToMany(() => MissionEvent, () => CompletedEvent)
    completedEvents?: MissionEvent[]

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
