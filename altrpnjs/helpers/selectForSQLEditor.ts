/**
 * Обработка запроса, чтобы работали фильтры и сортировка
 */
import {RequestContract} from "@ioc:Adonis/Core/Request"
import after from "./string/after"
import before from "./string/before"
import Database from "@ioc:Adonis/Lucid/Database";
import _ from "lodash";

async function selectForSQLEditor( sql:string, bindings,  request:RequestContract ){
  let _sql_order_by = ''
  let _sql_and_filters = ''
  let _sql_filters = ''
  let _sql_detail_filters = ''
  let _sql_detail_and_filters = ''
  const qs = request.qs()
  if( qs.filters ){
    let _filters = JSON.parse(qs.filters)

    if( sql.indexOf('ALTRP_FILTERS' ) !== -1 ){
      _sql_filters = 'WHERE'
      for(let key in _filters){
        if(_filters.hasOwnProperty(key)){
          const value = _filters[key]
          _sql_filters += ' AND `' +  key + '` LIKE "%' +  value + '%" '
        }
      }
    }
    if( sql.indexOf('ALTRP_AND_FILTERS') !== -1 ) {
      _sql_and_filters = ''
      for(let key in _filters){
        if(_filters.hasOwnProperty(key)){
          const value = _filters[key]
          _sql_filters += ' AND `' +  key + '` LIKE "%' +  value + '%" '
        }
      }
    }
    if( sql.indexOf('ALTRP_DETAIL_FILTERS') !== -1 ) {
      let _detail_filter_params = getDetailQueryValues(sql, 'ALTRP_DETAIL_FILTERS')

      let _detail_filter_conditionals:string[] = []
      for(let key in _filters){
        if(_filters.hasOwnProperty(key)){
          let value = _filters[key]

          if(_detail_filter_params[key]) {
            _detail_filter_params[key] = _detail_filter_params[key].replace(/\./g, "`.`")
            _detail_filter_conditionals.push(' `' +  _detail_filter_params[key] + '` LIKE "%' +  value + '%" ')
          }
        }
      }


      if(_detail_filter_conditionals.length > 0) {
        _sql_detail_filters = " WHERE "
      }

      _sql_detail_filters += _detail_filter_conditionals.join(' AND ')
    }
    if(  sql.indexOf('ALTRP_DETAIL_AND_FILTERS') !== -1 ) {
      let _detail_and_filter_params = getDetailQueryValues(sql, 'ALTRP_DETAIL_AND_FILTERS')

      let _detail_and_filter_conditionals:string[] = []

      for(let key in _filters){
        if(_filters.hasOwnProperty(key)){
          let value = _filters[key]
          if(_detail_and_filter_params[key]) {
            _detail_and_filter_params[key] = _detail_and_filter_params[key].replace(/\./g, "`.`")
            _detail_and_filter_conditionals.push( ' `' +  _detail_and_filter_params[key] + '` LIKE "%' +  value + '%" ')
          }
        }
      }


      if(_detail_and_filter_conditionals.length > 0) {
        _sql_detail_and_filters = " AND "
      }

      _sql_detail_and_filters +=  _detail_and_filter_conditionals.join(' AND ')
    }
  }

  if( qs.order && qs.order_by ){

    _sql_order_by = ' ORDER BY `' +  qs.order_by + '`' +  ( qs.order === 'DESC' ? ' DESC' : ' ')

    if(  sql.indexOf( 'ALTRP_DETAIL_FILTERS' ) !== -1 ) {
      let _detail_filter_params = getDetailQueryValues(sql, 'ALTRP_DETAIL_FILTERS')

      if(_detail_filter_params[qs.order_by]) {
        _sql_order_by = ' ORDER BY ' +  _detail_filter_params[qs.order_by] + '' +  ( qs.order === 'DESC' ? ' DESC' : ' ')
      }
    }
    else if(sql.indexOf( 'ALTRP_DETAIL_AND_FILTERS' ) !== -1) {
      let _detail_and_filter_params = getDetailQueryValues(sql, 'ALTRP_DETAIL_AND_FILTERS')

      if(_detail_and_filter_params[qs.order_by]) {
        _sql_order_by = ' ORDER BY ' +  _detail_and_filter_params[qs.order_by] + '' +  ( qs.order === 'DESC' ? ' DESC' : ' ')
      }
    }

    sql += _sql_order_by
  }


  sql = sql.replace(/ALTRP_FILTERS/g, _sql_filters)
  sql = sql.replace(/ALTRP_AND_FILTERS/g,_sql_and_filters)
  sql = sql.replace(/'?(ALTRP_DETAIL_FILTERS)(:[a-z0-9_,.:]+)?'?/g, _sql_detail_filters)
  sql = sql.replace(/'?(ALTRP_DETAIL_AND_FILTERS)(:[a-z0-9_,.:]+)?'?/g, _sql_detail_and_filters)

  return _.get(await Database.rawQuery(sql, bindings), '0', [])
}
export default selectForSQLEditor


export function getDetailQueryValues(query, filter:string):object {

  filter += ":"

  let _detail_filter = after(query, filter)

  _detail_filter = before(_detail_filter, ' ')

  let _detail_filter_array = _detail_filter.split(':')
  let _detail_filter_params = {}
  for(let param of _detail_filter_array) {
    let line = param.split(',')
    _detail_filter_params[line[0]] = line[1]
  }

  return _detail_filter_params
}
