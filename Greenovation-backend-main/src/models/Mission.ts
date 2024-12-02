import { Table, Column, Model, AllowNull, BelongsToMany, CreatedAt, UpdatedAt, ForeignKey } from 'sequelize-typescript'
import { LletraEnergetica } from './LletraEnergetica'
import { Event } from './Event'
import { User } from './User'
import { MissionInProgress } from './MissionInProgress'
import { CompletedMission } from './CompletedMission'
import { MissionEvent } from './MissionEvent'

@Table
export class Mission extends Model {
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

  @AllowNull(false)
  @Column
    eventsForCompletion!: number

  @ForeignKey(() => LletraEnergetica)
  @AllowNull(false)
  @Column
    lletraId!: number

  @Column
    energy!: number

  @Column
    CO2!: number

  @Column
    happiness!: number

  @Column
    money!: number

  @BelongsToMany(() => Event, () => MissionEvent)
    events?: Event[]

  @BelongsToMany(() => User, () => MissionInProgress)
    progressingUsers?: User[]

  @BelongsToMany(() => User, () => CompletedMission)
    completedUsers?: User[]

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
