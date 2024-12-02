import {
  Table,
  Column,
  Model,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript'
import { MissionInProgress } from './MissionInProgress'
import { MissionEvent } from './MissionEvent'

@Table
export class CompletedEvent extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
    id!: number

  @ForeignKey(() => MissionEvent)
  @AllowNull(false)
  @Column
    missionEventId!: number

  @ForeignKey(() => MissionInProgress)
  @AllowNull(false)
  @Column
    missionInProgressId!: number

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
