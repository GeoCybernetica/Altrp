import { DateTime } from 'luxon'
import {BaseModel, column, ManyToMany, manyToMany} from '@ioc:Adonis/Lucid/Orm'
import Permission from "App/Models/Permission";

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public display_name: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  public async hasPermission(value: Permission|number): Promise<boolean> {
    //@ts-ignore
    const relation = this.related("permissions");

    if(typeof value === "object") {
        const permission = await relation.query().where("id", value.id).first();

        return !!permission
    } else if(typeof value === "number") {
      const permission = await relation.query().where("id", value).first();

      return !!permission
    }

    return false
  }

  @manyToMany(() => Permission, {
    pivotTable: "permission_role",
    pivotForeignKey: "role_id",
  })
  permissions: ManyToMany<typeof Permission>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
