import {
  Table,
  Column,
  Model,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
  ForeignKey, PrimaryKey, AutoIncrement
} from 'sequelize-typescript'
import { Mission } from './Mission'
import { Event } from './Event'
import { MissionInProgress } from './MissionInProgress'
import { CompletedEvent } from './CompletedEvent'

@Table
export class MissionEvent extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
    id!: number

  @ForeignKey(() => Mission)
  @AllowNull(false)
  @Column
    missionId!: number

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column
    eventId!: number

  @BelongsToMany(() => MissionInProgress, () => CompletedEvent)
    missionsWhereCompleted?: MissionInProgress[]

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
