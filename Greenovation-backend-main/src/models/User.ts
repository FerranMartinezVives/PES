import {
  Model,
  Column,
  Table,
  CreatedAt,
  UpdatedAt,
  HasOne,
  Unique,
  AllowNull,
  Default,
  BelongsToMany, DataType, Min, IsIn
} from 'sequelize-typescript'
import { EdificiDUsuari } from './EdificiDUsuari'
import { MissionInProgress } from './MissionInProgress'
import { CompletedMission } from './CompletedMission'
import { Mission } from './Mission'

@Table
export class User extends Model {
  @Unique
  @AllowNull(false)
  @Column
    username!: string

  @Unique
  @AllowNull(false)
  @Column
    mail!: string

  @AllowNull(false)
  @Column
    password!: string

  @Default(15000)
  @AllowNull(false)
  @Column
    diners!: number

  @Default(1)
  @AllowNull(false)
  @Min(1)
  @Column(DataType.INTEGER)
    avatar!: number

  @Default('en')
  @AllowNull(false)
  @IsIn([['en', 'ca', 'es']])
  @Column
    idioma!: string

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date

  @HasOne(() => EdificiDUsuari, 'userId')
    edifici?: EdificiDUsuari

  @BelongsToMany(() => Mission, () => MissionInProgress)
    missionsInProgress?: Mission[]

  @BelongsToMany(() => Mission, () => CompletedMission)
    completedMissions?: Mission[]

  @Unique
  @AllowNull(true)
  @Column
    googleId?: string
}
