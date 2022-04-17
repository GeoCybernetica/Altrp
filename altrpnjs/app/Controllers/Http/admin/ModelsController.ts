import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Model from 'App/Models/Model'
import Source from 'App/Models/Source'
import Accessors from 'App/Models/Accessor'
import empty from '../../../../helpers/empty'
import CategoryObject from 'App/Models/CategoryObject'
import Event from '@ioc:Adonis/Core/Event'
import Column from 'App/Models/Column'
import Relationship from 'App/Models/Relationship'
import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'
import {string} from '@ioc:Adonis/Core/Helpers'
import Table from 'App/Models/Table'
import Controller from 'App/Models/Controller'
import ModelGenerator from 'App/Generators/ModelGenerator'
import Role from 'App/Models/Role'
import SourceRole from 'App/Models/SourceRole'
import guid from '../../../../helpers/guid'
import SQLEditor from 'App/Models/SQLEditor'
import {schema, rules} from '@ioc:Adonis/Core/Validator'
import {parseInt} from 'lodash'
import {ModelPaginatorContract} from "@ioc:Adonis/Lucid/Orm"
import Logger from "@ioc:Adonis/Core/Logger";

export default class ModelsController {
  async index({response, request}: HttpContextContract) {
    const modelToUpdate = await Model.query().whereNull('guid').select('*')
    await Promise.all(modelToUpdate.map(async (m:Model) =>{
      m.guid = guid()
      await m.save()
      Logger.info(`Model id ${m.id} guid write!`)
    }))
    const params = request.qs();
    const page = parseInt(params.page) || 1
    const pageSize = params.pageSize || 20

    let query = Model.query()
    if (params.categories) {
      let categoriesQuery = request.qs().categories.split(',')
      query = query.leftJoin('altrp_category_objects', 'altrp_category_objects.object_guid', '=', 'altrp_models.guid')
        .whereIn('altrp_category_objects.category_guid', categoriesQuery)
    }

    if (params.s) {
      let searches = params.s.split(' ')
      query = query.where(subQuery => {
        for (let s of searches) {
          if (!s.trim()) {
            continue
          }
          subQuery.where(subSubQuery => {
            return subSubQuery.orWhere('title', 'like', `%${s}%`)
              .orWhere('name', 'like', `%${s}%`)
              .orWhere('description', 'like', `%${s}%`)
          })
        }
        return subQuery
      })
    }
    let sql = query.toSQL().sql
    let models:ModelPaginatorContract<Model> = await query
      .orderBy('title',)
      .select('altrp_models.*')
      .preload('categories')
      .paginate(page, pageSize)

    const count = models.getMeta().total
    const pageCount = models.getMeta().last_page

  //@ts-ignore
    models = models.all().map(model => {
      return model.serialize()
    })
    return response.json({
      count,
      pageCount,
      models,
      sql
    })
  }

  static modelSchema = schema.create({
    title: schema.string({trim: true},),
  })

  async updateModel({response, params, request}: HttpContextContract) {

    let model = await Model.find(params.id)
    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })

    }
    let modelData = request.all()
    model.merge({
      description: modelData.description || '',
      title: modelData.title || '',
      soft_deletes: modelData.soft_deletes,
      time_stamps: modelData.time_stamps,
      parent_model_id: modelData.parent_model_id || null,
    })
    Event.emit('model:updating', model)
    await model.save()
    Event.emit('model:updated', model)
    modelData = await model.serialize()
    await CategoryObject.query().where('object_guid', modelData.guid).delete()

    if (!empty(request.all().categories)) {
      await Promise.all(request.all().categories.map(async c => {
        let newCatObj = new CategoryObject()
        // @ts-ignore
        newCatObj.fill(
          {
            category_guid: c.value,
            // @ts-ignore
            object_guid: model.guid,
            object_type: 'Model'
          }
        )
        return await newCatObj.save()
      }))
    }
    return response.json({success: true, data: modelData})
  }

  async getModel({response, params}: HttpContextContract) {

    let model = await Model.find(params.id)

    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })

    }
    await model.load('categories')

    let m = model.serialize()
    m.categories = m.categories.map(c => {
      return {
        value: c.guid,
        label: c.title,
      }
    })
    return response.json(m)
  }

  async getModelFields({response, params}: HttpContextContract) {
    const model = await Model.query().where('id', params.id)
      .preload('table', query => {
        // @ts-ignore
        query.preload('columns')
      })
      .first()
    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })

    }

    return response.json(model?.table?.columns || [])
  }

  async getModelRelations({response, params}: HttpContextContract) {

    const model = await Model.query().where('id', params.id)
      .preload('altrp_relationships')
      .first()
    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })

    }

    return response.json(model?.altrp_relationships || [])
  }

  public async deleteModelRow(httpContext: HttpContextContract) {
    const id = parseInt(httpContext.params.id);

    const rowId = parseInt(httpContext.params.row);

    const model = await Model.query().where('id', id).firstOrFail();

    httpContext.params[model.name] = rowId


    try {
      return {
        data: await Controller.callControllerMethod(id, 'destroy', httpContext),
        success: true
      }
    } catch (e) {
      return httpContext.response.status(500).json({
        success: false,
        message: e.message,
        trace: e.stack.split('\n'),
      })
    }
  }

  public async addModelRow(httpContext: HttpContextContract) {
    const id = parseInt(httpContext.params.id);

    try {
      return {
        data: await Controller.callControllerMethod(id, 'add', httpContext),
        success: true
      }
    } catch (e) {
      return httpContext.response.status(500).json({
        success: false,
        message: e.message,
        trace: e.stack.split('\n'),
      })
    }
  }

  public async updateModelRow(httpContext: HttpContextContract) {
    const id = parseInt(httpContext.params.id);

    const rowId = parseInt(httpContext.params.row);

    const model = await Model.query().where('id', id).firstOrFail();


    httpContext.params[model.name] = rowId


    try {
      return {
        data: await Controller.callControllerMethod(id, 'update', httpContext),
        success: true
      }
    } catch (e) {
      return httpContext.response.status(500).json({
        success: false,
        message: e.message,
        trace: e.stack.split('\n'),
      })
    }
  }

  public async showModel(httpContext: HttpContextContract) {
    const id = parseInt(httpContext.params.id);
    try {
      return {
        data: await Controller.callControllerMethod(id, 'index', httpContext),
        success: true
      }
    } catch (e) {
      return httpContext.response.status(500).json({
        success: false,
        message: e.message,
        trace: e.stack.split('\n'),
      })
    }
  }

  async options({response}) {
    let models = await Model.query().orderBy('title').select('*')

    return response.json({options: models.map(model => ({label: model.title, value: model.id})), pageCount: 0})
  }

  async checkRelationName({response, request, params}: HttpContextContract) {

    let model = await Model.find(params.id)

    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })

    }
    return response.json(
      {
        taken: !await Relationship.query().where({
          model_id: model.id,
          name: request.qs().name || ''
        }).first()
      })
  }

  async modelNameIsFree({response, request}: HttpContextContract) {

    return response.json(
      {
        taken: !await Model.query().where({
          name: request.qs().name || ''
        }).first()
      })
  }

  async getDataSources(contract: HttpContextContract) {
    return contract.response.json(await this.getDataSourcesAndPageCount(contract))
  }

  async getDataSourcesAndPageCount({request}: HttpContextContract) {

    const params = request.qs()
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10

    const sources = await Source.query().paginate(page, pageSize)

    return {
      count: sources.getMeta().total,
      pageCount: sources.getMeta().last_page,
      data_sources: sources.all()
    }

    // if(page) {
    //   const sources = await Source.query().offset((page - 1)*pageSize).limit(pageSize).select('*');
    //   return {
    //     data_sources: sources,
    //     pageCount: 0
    //   }
    // } else {
    //   const sources = await Source.query().select('*')
    //   return {
    //     data_sources: sources,
    //     pageCount: 0
    //   }
    // }
    // filtration(templatesQuery, request, [
    //   'title',
    // ])


  }

  async getDataSourcesOptionsByModel({response, params}: HttpContextContract) {

    let model = await Model.find(params.id)

    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })

    }
    const sources = await Source.query().where('model_id', params.id)
      .preload('altrp_model', modelsQuery => {
        modelsQuery.preload('table')
      })
    return response.json(sources.map(source => {
      return {
        value: source.id,
        label: source.title,
        web_url: source.web_url,

      }
    }))
  }

  async getAccessors({params, response}: HttpContextContract) {
    let accessors = await Accessors.query().where('model_id', params.id).select()
    return response.json(accessors)
  }

  async storeModel({request, response, auth}: HttpContextContract) {
    let modelData = request.all()
    let model = new Model()
    const table = new Table()
    table.fill({
      name: string.pluralize(modelData.name),
      title: modelData.title,
      description: modelData.description,
      // @ts-ignore
      user_id: auth?.user?.id,
    })
    await table.save()
    model.fill({
      description: modelData.description || '',
      title: modelData.title || '',
      name: modelData.name || '',
      soft_deletes: modelData.soft_deletes,
      guid: guid(),
      time_stamps: modelData.time_stamps,
      id: modelData.id,
      parent_model_id: modelData.parent_model_id || null,
      table_id: table.id,
    })
    await model.save()
    const id_column = new Column()
    id_column.fill({
      name: 'id',
      title: 'ID',
      description: 'ID',
      null: true,
      type: 'bigInteger',
      table_id: table.id,
      model_id: model.id,
      // @ts-ignore
      user_id: auth?.user?.id,
    })
    await id_column.save()
    if (modelData.time_stamps) {
      const created_at_column = new Column()
      created_at_column.fill({
        name: 'created_at',
        title: 'created_at',
        description: 'created_at',
        null: true,
        type: 'timestamp',
        table_id: table.id,
        model_id: model.id,
        // @ts-ignore
        user_id: auth?.user?.id,
      })
      await created_at_column.save()
      const updated_at_column = new Column()
      updated_at_column.fill({
        name: 'updated_at',
        title: 'updated_at',
        description: 'updated_at',
        null: true,
        type: 'timestamp',
        model_id: model.id,
        table_id: table.id,
        // @ts-ignore
        user_id: auth?.user?.id,
      })
      await updated_at_column.save()
    }
    if (modelData.soft_deletes) {
      const deleted_at_column = new Column()
      deleted_at_column.fill({
        name: 'deleted_at',
        title: 'deleted_at',
        description: 'deleted_at',
        type: 'timestamp',
        null: true,
        model_id: model.id,
        table_id: table.id,
        // @ts-ignore
        user_id: auth?.user?.id,
      })
      await deleted_at_column.save()
    }
    const controller = new Controller()
    controller.fill({
      model_id: model.id,
      description: model.description,
    })

    await controller.save()

    let sources = [
      (new Source()).fill({
        url: `/filters/${table.name}/{column}`,
        api_url: `/filters/${table.name}/{column}`,
        type: `filters`,
        request_type: `get`,
        name: `Filters ${model.name}`,
        title: `Filters ${model.name}`,
        auth: true,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
      (new Source()).fill({
        url: `/${table.name}/{${model.name}}/{column}`,
        api_url: `/${table.name}/{${model.name}}/{column}`,
        type: `update_column`,
        request_type: `put`,
        name: `Update column ${model.name}`,
        title: `Update column ${model.name}`,
        auth: true,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
      (new Source()).fill({
        url: `/${table.name}/{${model.name}}`,
        api_url: `/${table.name}/{${model.name}}`,
        type: `delete`,
        request_type: `delete`,
        name: `Delete ${model.name}`,
        title: `Delete ${model.name}`,
        auth: true,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
      (new Source()).fill({
        url: `/${table.name}/{${model.name}}`,
        api_url: `/${table.name}/{${model.name}}`,
        type: `update`,
        request_type: `put`,
        name: `Update ${model.name}`,
        title: `Update ${model.name}`,
        auth: true,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
      (new Source()).fill({
        url: `/${table.name}`,
        api_url: `/${table.name}`,
        type: `add`,
        request_type: `post`,
        name: `Add ${model.name}`,
        title: `Add ${model.name}`,
        auth: true,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
      (new Source()).fill({
        url: `/${table.name}`,
        api_url: `/${table.name}`,
        type: `get`,
        request_type: `get`,
        name: `Get  ${model.name}`,
        title: `Get  ${model.name}`,
        auth: false,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
      (new Source()).fill({
        url: `/${table.name}/{${model.name}}`,
        api_url: `/${table.name}/{${model.name}}`,
        type: `show`,
        request_type: `get`,
        name: `Show  ${model.name}`,
        title: `Show ${model.name}`,
        auth: false,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
      (new Source()).fill({
        url: `/{${model.name}}_options`,
        api_url: `/{${model.name}}_options`,
        type: `options`,
        request_type: `get`,
        name: `Get options ${model.name}`,
        title: `Get options ${model.name}`,
        auth: false,
        need_all_roles: false,
        controller_id: controller.id,
        model_id: model.id,
      }),
    ]

    await Promise.all(sources.map(s => s.save()))

    const adminRole = await Role.query().where('name', 'admin').first()

    if (adminRole) {
      await Promise.all(sources.map(s => {
        return (new SourceRole()).fill({
          role_id: adminRole.id,
          source_id: s.id,
        }).save()
      }))
    }

    Event.emit('model:updated', model)
    const client = Database.connection(Env.get('DB_CONNECTION'))
    try {

      await client.schema.createTableIfNotExists(table.name, table => {
        table.bigIncrements('id')
        if (modelData.soft_deletes) {
          table.timestamp('deleted_at')
        }
        if (modelData.time_stamps) {
          table.timestamp('updated_at')
          table.timestamp('created_at')
        }
      })
    } catch (e) {
      await (new ModelGenerator).deleteFiles(model)
      await model.delete()
      await Promise.all(sources.map(s => s.delete()))
      await controller.delete()
      await Column.query().where('table_id', table.id).delete()
      await table.delete()
      await client.schema.dropTableIfExists(table.name)
      response.status(500)
      return response.json({success: false, trace: e?.stack.split('\n')})
    }

    if (!empty(modelData.categories)) {
      await Promise.all(modelData.categories.map(async c => {
        let newCatObj = new CategoryObject()
        newCatObj.fill(
          {
            category_guid: c.value,
            object_guid: model.guid,
            object_type: 'Model'
          }
        )
        return await newCatObj.save()
      }))
    }
    await model.load('categories')


    return response.json(model)

  }

  async deleteModel({params, response}: HttpContextContract) {

    let model = await Model.find(params.id)

    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })
    }
    const table = await Table.find(model.table_id)
    const controller = await Controller.query().where('model_id', model.id).first()
    if (controller) {
      const sources = await Source.query().where('controller_id', controller?.id).select('*')
      if (
        sources[0]) {
        await sources[0].load('roles')

      }
      await Promise.all(sources.map(s => {
        return s.related('roles').detach()
      }))
      await Promise.all(sources.map(s => {
        return s.related('permissions').detach()
      }))
      await Promise.all(sources.map(s => {
        return s.delete()
      }))

      await controller.delete()
    }
    await (new ModelGenerator).deleteFiles(model)


    if (table) {
      await Column.query().where('table_id', table.id).delete()
      await model.delete()
      await table.delete()
    } else {
      await model.delete()
    }

    return response.json({success: true})
  }

  async getModelFieldOptions({params, response}) {
    let model = await Model.find(params.id)

    if (!model) {
      response.status(404)
      return response.json({
        success: false,
        message: 'Model not found'
      })
    }

    await model.load('table', table => {
      table.preload('columns')
    })
    return response.json({options: model?.table.columns.map(c => ({value: c.id, label: c.title})) || []})
  }

  public async models_options({request, response}: HttpContextContract) {
    let search_text = request.qs().s || ''
    let data_sources: any[] = []
    if (request.qs().with_sql_queries == 0) {
      return response.json(
        await Model.getModelsOptions(
          request.qs().with_names!=0,
          request.qs().not_plural,
          search_text
        ))
    } else {
      let model_data_sources: any[] = []
      for (let modelsOption of await Model.getModelsOptions(
        request.qs().with_names !=0,
        request.qs().not_plural,
        search_text
      )) {
        if (modelsOption['value'] === 'user') {
          continue
        }
        model_data_sources.push({
          'label':
            modelsOption['label'],
          'value':
            modelsOption['value'],
          'type':
            'model_query'
        })
      }

      if (model_data_sources.length) {
        data_sources.push({
          'label':
            'Models',
          'options':
          model_data_sources,
          'type':
            'models query'
        })
      }
      /**
       * Добавляем варианты с SQL-editors
       */
      let sql_editors_data_sources: any[] = []

      let _sqls:any = SQLEditor.query().where('title', 'LIKE', '%' + search_text + '%')

      await  _sqls.preload('model', query=>{
        query.preload('altrp_table')
      })
      _sqls = await _sqls.select('*')
      for (let sql of _sqls) {
        sql_editors_data_sources.push({
          'label': sql.model.title + ': ' + sql.title,
          'value': '/ajax/models/queries/' + sql.model.altrp_table.name + '/' + sql.name,
          'sql_name': sql.name,
          'type': 'sql_datasource'
        })

      }

      if (sql_editors_data_sources.length)
        data_sources.push({
          'label':
            'Data from SQLEditors',
          'options':
          sql_editors_data_sources,
        })
    }
    return response.json(data_sources)
  }


  async showDataSource({response, params}:HttpContextContract){
      let dataSource = await Source.query().where('id', params.id)
          .preload('roles').preload('permissions')
          .first()
      if(!dataSource) {
        response.status(404)
        return response.json({
          success: false,
          message: 'Datasource not found'
        })
      }

      let data = dataSource.toJSON()

      data['access'] = {'roles' : [], 'permissions' : []}
      let sourceRoles = dataSource['roles']
      let sourcePermissions = dataSource['permissions']
      // @ts-ignore
      delete dataSource.roles
      // @ts-ignore
      delete dataSource.permissions
      if (sourceRoles) {
          for (let sourceRole of sourceRoles) {
            data['access']['roles'].push(sourceRole['role']['id'])
          }
      }

      if (sourcePermissions) {
          for (let sourcePermission of sourcePermissions) {
            data['access']['permissions'].push(sourcePermission['permission']['id'])
          }
      }

      return response.json(data)
  }


  async updateDataSource({response, request, params}:HttpContextContract){

      const dataSourceSchema = schema.create({
        title: schema.string({trim: true}, [
          rules.maxLength(32)
        ]),
        name: schema.string({trim: true}, [
          rules.maxLength(32)
        ]),
      })

      await request.validate({schema: dataSourceSchema})

      let dataSource = await Source.query().where('id', params.id).first()
      if(!dataSource) {
        response.status(404)
        return response.json({
          success: false,
          message: 'Datasource not found'
        })
      }

      let data = request.all()

      if (data['access']['roles'].lenght <= 1) {
          data['need_all_roles'] = 0
      }

      dataSource.merge(data)
      await dataSource.save()
      return response.json({
        success: true,
        data: dataSource
      })
    }

    async storeDataSource({response, request}:HttpContextContract)
    {
        const dataSourceSchema = schema.create({
          title: schema.string({trim: true}, [
            rules.maxLength(32)
          ]),
          name: schema.string({trim: true}, [
            rules.maxLength(32)
          ]),
        })

        await request.validate({schema: dataSourceSchema})

        let dataSource = await Source.create(request.all())

        return response.json({
          success: true,
          data: dataSource
        })
    }


    async getDataSourceOptions(contract: HttpContextContract)
    {
        let result = await this.getDataSourcesAndPageCount(contract)
        let options : any = []
        for (let source of result['data_sources']) {
            options.push({
              value : source.id,
              label : source.name,
            })
        }
        options = {
            options : options,
            pageCount : result['pageCount']
        }
        return contract.response.json(options)
    }


    async destroyDataSource({response, params}:HttpContextContract)
    {
        let dataSource = await Source.find(params.id)
        if(!dataSource) {
          response.status(404)
          return response.json({
            success: false,
            message: 'Datasource not found'
          })
        }
        await dataSource.delete()

        return response.json({
            success: true
          })

    }


    async getDataSourcesByModel({response, params}:HttpContextContract)
    {
        let data_sources = await Source.query().where('model_id',params.model_id).select(['title as label', 'id as value'])
        return response.json(data_sources)
    }

}
