import data_get from "../../helpers/data_get";
import empty from "../../helpers/empty";
import {BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne, ManyToMany, manyToMany} from "@ioc:Adonis/Lucid/Orm";
import Model from "App/Models/Model";
import Category from "App/Models/Category";
import StartNode from "App/Customizer/Nodes/StartNode";
import BaseNode from "App/Customizer/Nodes/BaseNode";
import Edge from "App/Customizer/Nodes/Edge";
import SwitchNode from "App/Customizer/Nodes/SwitchNode";
import ReturnNode from "App/Customizer/Nodes/ReturnNode";
import ChangeNode from "App/Customizer/Nodes/ChangeNode";
import * as _ from "lodash";
import str_replace from "../../helpers/str_replace";
import Source from "App/Models/Source";
import escapeRegExp from "../../helpers/escapeRegExp";

export default class Customizer extends BaseModel {

  public static sourceable_type = `App\\Altrp\\Customizer`

  public static table = 'altrp_customizers'

  private parsed_data: any

  @column({isPrimary: true})
  public id: number

  @column()
  public name: string

  @column()
  public title: string

  @column()
  public type: string

  @column()
  public guid: string

  @column({
    consume: (data) => {
      return JSON.parse(data)
    },
    prepare: (data) => {
      return JSON.stringify(data)
    },
  })
  public data: any

  @column({
    consume: (settings) => {
      return JSON.parse(settings)
    },
    prepare: (settings) => {
      return JSON.stringify(settings)
    },
  })
  public settings: any

  @column()
  public model_id: number

  @column()
  public model_guid: string | undefined

  @belongsTo(() => Model, {
    foreignKey: 'model_id'
  })
  public altrp_model: BelongsTo<typeof Model>

  @hasOne(() => Source, {
    foreignKey: 'sourceable_id',
    onQuery(query) {
      query.where('sourceable_type', 'App\\Altrp\\Customizer')
    }
  })
  public source: HasOne<typeof Source>

  @manyToMany(() => Category, {
    pivotTable: 'altrp_category_objects',
    relatedKey: 'guid',
    localKey: 'guid',
    pivotForeignKey: 'object_guid',
    pivotRelatedForeignKey: 'category_guid',
  })
  public categories: ManyToMany<typeof Category>

  methodToJS(method, method_settings = []) {
    if (!method) {
      return ''
    }
    if (method.indexOf('.') !== -1) {
      method = method.split('.')[1]
    }
    let JSContent = '.' + method + '('
    let parameters = data_get(method_settings, 'parameters', [])
    parameters = parameters.filter(function (item) {
      return !empty(item) && data_get(item, 'value')
    })
    for (let key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        let parameter = parameters[key]
        JSContent += this.propertyToJS(data_get(parameter, 'value', []))
        if (parseInt(key) < parameters.length - 1) {
          JSContent += ', '
        }
      }
    }
    JSContent += ')'
    return JSContent
  }

  propertyToJS(property): string {
    let JSContent = ''
    if (empty(property)) {
      return 'null'
    }
    let namespace = data_get(property, 'namespace', 'context')
    let path = data_get(property, 'path')
    let JSExpression = data_get(property, 'JSExpression', 'null')
    JSExpression = Customizer.replaceMustache(JSExpression)
    let method = data_get(property, 'method')
    let awaitOn = data_get(property, 'awaitOn')
    let method_settings = data_get(property, 'methodSettings', [])

    switch (namespace) {
      case 'string': {
        JSContent += `'` + path + `'`
      }
        break
      case 'expression': {
        JSContent += JSExpression
      }
        break
      case 'number': {
        JSContent += path
      }
        break
      case 'env': {
        JSContent = `this.getCustomizerData('env.${path}')`
      }
        break
      case 'session':
      case 'context':
      case 'this':
      case 'current_user': {
        if (!path) {
          path = namespace
        } else {
          path = namespace + '.' + path
        }
        JSContent = `this.getCustomizerData('${path}')`
        if (method) {

          if(awaitOn) {
            JSContent = `await ${JSContent}`
          }
          JSContent += this.methodToJS(method, method_settings)
        }
      }
        break
      default:
        JSContent = 'null'
    }
    return JSContent
  }

  customizerBuildCompare(operator: string, leftJSProperty, rightJSProperty): string {

    if (!operator || operator == 'empty') {
      return `empty(${leftJSProperty})`
    }
    switch (operator) {
      case 'not_empty': {
        this.addImport(this.importsList.importEmpty)
        return `! empty(${leftJSProperty})`
      }
      case 'null': {
        return `${leftJSProperty} == null`
      }
      case 'not_null': {
        return `${leftJSProperty} != null`
      }
      case 'true': {
        return `${leftJSProperty} == true`
      }
      case 'false': {
        return `${leftJSProperty} == false`
      }
      case '==': {
        return `${leftJSProperty} == ${rightJSProperty}`
      }
      case '<>': {
        return `${leftJSProperty} != ${rightJSProperty}`
      }
      case '<': {
        return `${leftJSProperty} < ${rightJSProperty}`
      }
      case '>': {
        return `${leftJSProperty} > ${rightJSProperty}`
      }
      case '<=': {
        return `${leftJSProperty} <= ${rightJSProperty}`
      }
      case '>=': {
        return `${leftJSProperty} >= ${rightJSProperty}`
      }
      case 'in': {
        return ` ${rightJSProperty}?.indexOf(${leftJSProperty}) !== -1`
      }
      case 'not_in': {
        return ` ${rightJSProperty}?.indexOf(${leftJSProperty}) === -1`
      }
      case 'contain': {
        return ` ${rightJSProperty}?.indexOf(${leftJSProperty}) !== -1`
      }
      case 'not_contain': {
        return ` ${rightJSProperty}?.indexOf(${leftJSProperty}) === -1`
      }
      default:
        return 'null'
    }
  }

  changePropertyToJS(propertyData, value, type = 'set'): string {

    if (empty(propertyData)) {
      return 'null'
    }
    let namespace = data_get(propertyData, 'namespace', 'context')
    let path = data_get(propertyData, 'path')
    let JSContent
    switch (namespace) {
      case 'context': {
        if (!path) {
          path = namespace
        } else {
          path = namespace + '.' + path
        }
        JSContent = `${type}_customizer_data('${path}', ${value})`

      }
        break
      default:
        JSContent = 'null'
    }
    return JSContent
  }

  private importsList = {
    importEmpty: `const empty = (await import('../../../helpers/empty')).default`,
  }


  addImport(importString: string) {
    if (this.imports.indexOf(importString) !== -1) {
      return
    }
    this.imports.push(importString)
  }

  private imports: string[] = []

  renderImports(): string {
    return this.imports.join('\n')
  }

  private getStartNode(): StartNode {
    if (!this.parsed_data) {
      this.parsed_data = Customizer.parseData(this.data, this);
    }

    return BaseNode.getStartNode(this.parsed_data);
  }

  /**
   * @return Collection
   */
  public getStartNodes(): any[] {
    if (!this.parsed_data) {
      this.parsed_data = Customizer.parseData(this.data, this);
    }

    return BaseNode.getStartNodes(this.parsed_data);
  }

  /**
   * @return string
   */
  public getRequestType(): string {
    return this.getStartNode() ? this.getStartNode().getRequestType() : 'get';
  }

  public static  parseData( data, customizer ){
    data = data.map( item  => {
      const type = data_get( item, 'type' )
      switch( type ){
        case 'default': return new Edge( item, customizer )
        case 'switch': return new SwitchNode( item, customizer )
        case 'start': return new StartNode( item , customizer)
        case 'return': return new ReturnNode( item, customizer )
        case 'change': return new ChangeNode( item, customizer )
        default: return new BaseNode( item, customizer )
      }
    })
    data.forEach( ( node_item ) => {
      if( node_item instanceof Edge ){
      }
      const node_id = node_item.getId()
      let edges = BaseNode.getNodesByType('default', data)
      edges = edges.filter( ( node )=> {
        return node.data['source'] == node_id
      })
      if( node_item instanceof SwitchNode ){
        edges = _.sortBy(edges,( node, key )=> {
          if( data_get(node,'data.sourceHandle') ){
            key = str_replace('yes-', '',data_get(node,'data.sourceHandle'))
          }
          return key
        })
      }
      edges.forEach(( edge ) =>{
        const child = BaseNode.findNodeById( edge.data['target'], data )
        if( child ){
          node_item.addChild( child )
        }
      })
    })
    return  data
  }
  getMethodContent(){
    let startNode = this.getStartNode()
    return startNode ? startNode.getJSContent() : ''
  }

  static replaceMustache(expression:string):string{

    let paths = _.isString(expression) ? expression.match(/{{([\s\S]+?)(?=}})/g) : null;
    if (_.isArray(paths)) {
      paths.forEach(path => {
        path = path.replace("{{", "");
        let replace = `this.getCustomizerData(\`${path}\`)`

        path = escapeRegExp(path);
        expression = expression.replace(new RegExp(`{{${path}}}`, "g"), replace || "");
      });
    }
    return expression
  }
}
