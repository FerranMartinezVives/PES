import { Model, Column, Table, CreatedAt, UpdatedAt, AllowNull, HasMany } from 'sequelize-typescript'
import { Millora } from './Millora'

@Table
export class Categoria extends Model {
  @AllowNull(false)
  @Column
    nom!: string

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Column
    updatedAt!: Date

  @HasMany(() => Millora, 'categoriaId')
    millores?: Millora[]
}
