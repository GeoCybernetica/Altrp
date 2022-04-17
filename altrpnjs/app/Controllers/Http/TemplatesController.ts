// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import validGuid from '../../../helpers/validGuid';

import { v4 as uuid } from "uuid";
import Template from "App/Models/Template";
import TemplateSetting from "App/Models/TemplateSetting";
import Page from "App/Models/Page";
import PagesTemplate from "App/Models/PagesTemplate";
import Category from "App/Models/Category";
import CategoryObject from "App/Models/CategoryObject";
import AltrpMeta from "App/Models/AltrpMeta";
import GlobalStyle from "App/Models/GlobalStyle";
import filtration from "../../../helpers/filtration";
import TemplateGenerator from "App/Generators/TemplateGenerator";
import Area from "App/Models/Area";

export default class TemplatesController {
  public async index({ request }) {
    const params = request.qs();
     const page = parseInt(params.page) || 1
    // const search = params.s
    // const orderType = params.order || "DESC"
    // const orderBy = params.order_by || "id"

     const pageSize = params.pageSize || 20

    const templatesQuery = Template.query()

    filtration(templatesQuery, request, [
      "title",
    ])

    const templates = await templatesQuery
      .preload("user")
      .preload("currentArea")
      .whereNotNull('guid')
      .whereNull('deleted_at')
      .where("type", "template")
      .preload("categories")
      .whereHas("currentArea", (query) => {
        if(params.area) {
          query.where("name", params.area)
        }
      })
      .orderBy('title')
      .paginate(page, pageSize)

    const modTemplates = templates.all().map( template => {
      return {
        categories: template.categories.map(category => {
          return category
        }),
        author: template.getAuthor(),
        area: template.getArea(),
        id: template.id,
        name: template.name,
        title: template.title,
        url: `/admin/editor?template_id=${template.id}`
      }
    })

    return {
      count: templates.getMeta().total,
      pageCount: templates.getMeta().last_page,
      templates: modTemplates
    }
  }

  public async settingsGet({ request, params }) {
    const setting = await TemplateSetting.query()
      .where("template_id", parseInt(params.id))
      .andWhere("setting_name", request.input("setting_name"))
      .firstOrFail()
    return setting
  }

  public async settingsSet({ params, request, response}) {
    const templateQuery = Template.query();

    if(isNaN(params.id)) {
      templateQuery.where("guid", params.id)
    } else {
      templateQuery.where("id", parseInt(params.id))
    }

    const template = await templateQuery.firstOrFail()


    const settingName = request.input("setting_name");

    let setting = await TemplateSetting.query()
      .where("template_id", template.id)
      .andWhere("setting_name", settingName)
      .first()

    if(!setting) {
      setting = new TemplateSetting()

      setting.fill({
        template_id: template.id,
        //@ts-ignore
        template_guid: template.guid,
        setting_name: settingName,
        data: request.input("data")
      })
    } else {
      setting.data = request.input("data")
    }

    if(!await setting.save()) {
      response.status(500)
      return {
        message: "Setting not saved"
      }
    }

    return {
      success: true
    }
  }

  public async create({ auth, request, response }) {
    await auth.use('web').authenticate()

    const guid = uuid();

    const data = {
      area: parseInt(request.input("area")),
      data: JSON.stringify(request.input("data")),
      name: request.input("name"),
      title: request.input("title"),
      type: "template",
      guid,
      user_id: auth.user?.id,
    }

    const template = await Template.create(data);

    if(request.input("categories")) {
      for (const option of request.input("categories")) {
        const category = await Category.query().where("guid", option.value).first();

        if (!category) {
          response.status(404)
          return {
            message: "Category not Found"
          }
        } else {
          await CategoryObject.create({
            category_guid: category.guid,
            object_type: "Template",
            //@ts-ignore
            object_guid: template.guid
          })
        }
      }
    }
    let templateGenerator = new TemplateGenerator()
    await templateGenerator.run(template)
    return {
      message: "Success",
      redirect: true,
      data: JSON.parse(template.data),
      url: `/admin/editor?template_id=${template.id}`
    }
  }

  public async options({ request}:HttpContextContract) {
    const query = Template.query()
    query.where('type', 'template')
    const qs = request.qs()
    if(qs.template_type){
      let area = await Area.query().where('name', qs.template_type).first()
      if(area){
        query.where('area', area.id)
      }
    }
    const templates = await query.select('id', 'title')
    return templates.map((template) => ({
      value: template.id,
      label: template.title
    }))
  }

  public async get({ params }) {
    const templateQuery = Template.query();

    if(isNaN(params.id)) {
      templateQuery.where("guid", params.id)
    } else {
      templateQuery.where("id", parseInt(params.id))
    }

    const template = await templateQuery.firstOrFail()

    return template
  }

  public async delete({ params }) {
    const templateQuery = Template.query();

    if(isNaN(params.id)) {
      templateQuery.where("guid", params.id)
    } else {
      templateQuery.where("id", parseInt(params.id))
    }

    const template = await templateQuery.firstOrFail()

    let templateGenerator = new TemplateGenerator()
    await templateGenerator.deleteFile(template)
    await template.delete()
    return {
      success: true
    }
  }

  public async update({ params, request }) {
    const templateQuery = Template.query();

    if(isNaN(params.id)) {
      templateQuery.where("guid", params.id)
    } else {
      templateQuery.where("id", parseInt(params.id))
    }

    const template = await templateQuery.firstOrFail()

    if(template) {
      //@ts-ignore
      const data = template.serialize();

      delete data.created_at
      delete data.updated_at
      delete data.id

      const prevTemplates = await Template.query().where("guid", data.guid).andWhere("type", "review").orderBy("created_at", "desc")

      if(prevTemplates.length === 5) {
        await prevTemplates[4].delete()
      }

      template.data = JSON.stringify(request.input("data"));
      template.styles = JSON.stringify(request.input("styles"));
      template.html_content = request.input("html_content");

      await template.save()

      let templateGenerator = new TemplateGenerator()
      await templateGenerator.run(template)
      return {
        currentTemplate: template,
        clearData: request.input("data")
      }
    }
  }

  public async deleteReviews({ params, response }) {
    const templates = await Template.query().where("type", "review").andWhere("parent_template", parseInt(params.id));

    if(templates.length > 0) {
      for (const template of templates) {
        template.delete()
      }

      return {
        success: true,
      }
    } else {
      response.status(404)
      return {
        success: false
      }
    }
  }

  public async deleteAllReviews({  }) {
    const templates = await Template.query().where("type", "review");

    for (const template of templates) {
      await template.delete()
    }

    return {
      success: true,
    }
  }

  public async getAllReviews({ response }) {
    const templates = await Template.query().where("type", "review");

    if(templates.length > 0) {
      return templates
    } else {
      response.status(404)
      return templates
    }
  }

  public async getReviews({ params, response }) {
    const templates = await Template.query().where("type", "review").andWhere("parent_template", parseInt(params.id));

    if(templates.length > 0) {
      return templates
    } else {
      response.status(404)
      return templates
    }
  }

  /**
   * Получение условий текущего шаблона
   * @param template_id
   * @param Request $request
   * @return JsonResponse
   */
  public async conditions({params}) {
    const id = parseInt(params.id);

    let res = {
      data: [],
      success: true
    }
    const setting = await TemplateSetting.query().where("template_id", id).andWhere("setting_name", "conditions").first();

    if(setting) {
      res.data = JSON.parse(setting.data)
    }

    return res
  }

  /**
   * Сохранение условий текущего шаблона
   * @param template_id
   * @param template_id
   * @param Request $request
   * @return JsonResponse
   */
  public async conditionsSet({params, response, request}) {

    const id = parseInt(params.id);
    const data = JSON.stringify(request.input("data"));

    const template = await Template.query().where("id", id).preload("currentArea").first();

    if(!template) {
      response.status(404)
      return {
        message: "Template not Found"
      }
    }

    let setting = await TemplateSetting.query().where("template_id", id).first()

    if(!setting) {
      setting = await TemplateSetting.create({
        template_id: id,
        setting_name: "conditions",
        //@ts-ignore
        template_guid: template.getGuid(),
        data
      })
    } else {
      setting.data = data

      if(!setting.save()) {
        response.status(500);

        return {
          message: "Conditions not Saved"
        }
      }
    }

    if(template) {
      template.all_site = false

      if(!template.save()) {
        response.status(500)
        return {
          message: "Conditions all_site not Saved"
        }
      }

      await template.related("pages").detach()

      request.input("data").forEach(condition => {
        switch (condition.object_type) {
          case "all_site":
            template.all_site = condition.condition_type === "include";

            if(!template.save()) {
              response.status(500)
              return {
                message: "Conditions all_site not Saved"
              }
            }
            break
          case "report":
          case "page":
            condition.object_ids.forEach(async objectId => {
              const page = await Page.find(objectId)

              if(!page) {
                response.status(500)
                return {
                  message: "Page not found and pages template not saved"
                }
              }

              const pages_template = await PagesTemplate.create({
                page_id: objectId,
                page_guid: page.getGuid(),
                template_id: template.id,
                //@ts-ignore
                template_guid: template.getGuid(),
                condition_type: condition.condition_type,
                template_type: template.currentArea.name
              })

              if(!pages_template) {
                response.status(500)
                return {
                  message: "Conditions page not Saved"
                }
              }
            })
            break
        }
      })
    }

    return {
      success: true
    }
  }


  public async exportCustomizer( {params, response}: HttpContextContract )
  {

    let template
    if (validGuid(params.id)) {
      template = await Template.query().where('guid', params.id).first()
    } else {
      template = await Template.find(params.id)
    }
    if (!template) {
      return response.json({
          'success':
            false, 'message':
            'Customizer not found'
        },
      )
    }

    template.__exported_metas__ = {}
    template.__exported_metas__.styles_presets = AltrpMeta.getGlobalStyles()
    template.__exported_metas__ = {}
    template.__exported_metas__.global_styles = GlobalStyle.all();

    let res = template.serialize()

    return response.json(res)
  }

  async show_frontend({params,response}:HttpContextContract )
{

  // if (self::loadCachedTemplate( template_id )) {
  //    return self::loadCachedTemplate( template_id );
  // }
  const template_id = params.template_id
  let template
  if ( validGuid( template_id ) ) {
    template = await Template.query().where( 'guid', template_id ).first();
  } else {
    template = await Template.find( template_id );
  }
  if ( ! template ) {
    response.status(404)
    return response.json( { 'success' : false, 'message' : 'Template not found' })
  }

  template = template.serialize()
  delete template.html_content
  delete template.styles
  return response.json(template);
  }
}
