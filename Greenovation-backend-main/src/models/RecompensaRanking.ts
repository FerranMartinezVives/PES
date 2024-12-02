import { Model, Column, Table, CreatedAt, UpdatedAt, AllowNull, Unique } from 'sequelize-typescript'

@Table
export class RecompensaRanking extends Model {
  @AllowNull(false)
  @Unique
  @Column
    posicio!: string

  @AllowNull(false)
  @Column
    recompensa!: number

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date
}
