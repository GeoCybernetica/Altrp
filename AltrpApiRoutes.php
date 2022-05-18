<?php
/*Api routes*/
Route::group(['middleware' => 'auth'], function () {
  if (!Auth::check()) redirect('/geobuilder/login');
  // Routes for the user_altrps resource
  Route::get('/user_altrps', ['uses' =>'AltrpControllers\user_altrpController@index']);
  Route::get('/user_altrp_options', ['uses' =>'AltrpControllers\user_altrpController@options']);
  Route::post('/user_altrps', ['uses' =>'AltrpControllers\user_altrpController@store']);
  Route::get('/user_altrps/{user_altrp}', ['uses' =>'AltrpControllers\user_altrpController@show']);
  Route::put('/user_altrps/{user_altrp}', ['uses' =>'AltrpControllers\user_altrpController@update']);
  Route::delete('/user_altrps/{user_altrp}', ['uses' =>'AltrpControllers\user_altrpController@destroy']);
  Route::put('/user_altrps/{user_altrp}/{column}', ['uses' =>'AltrpControllers\user_altrpController@updateColumn']);
  Route::get('/filters/user_altrps/{column}', ['uses' =>'AltrpControllers\user_altrpController@getIndexedColumnsValueWithCount']);
  // Routes for the structure_types resource
  Route::get('/structure_types', ['uses' =>'AltrpControllers\structure_typeController@index']);
  Route::get('/structure_type_options', ['uses' =>'AltrpControllers\structure_typeController@options']);
  Route::post('/structure_types', ['uses' =>'AltrpControllers\structure_typeController@store']);
  Route::get('/structure_types/{structure_type}', ['uses' =>'AltrpControllers\structure_typeController@show']);
  Route::put('/structure_types/{structure_type}', ['uses' =>'AltrpControllers\structure_typeController@update']);
  Route::delete('/structure_types/{structure_type}', ['uses' =>'AltrpControllers\structure_typeController@destroy']);
  Route::put('/structure_types/{structure_type}/{column}', ['uses' =>'AltrpControllers\structure_typeController@updateColumn']);
  Route::get('/filters/structure_types/{column}', ['uses' =>'AltrpControllers\structure_typeController@getIndexedColumnsValueWithCount']);
  // Routes for the structures resource
  Route::get('/queries/structures/structure_list', ['uses' =>'AltrpControllers\structureController@structure_list']);
  Route::get('/structures', ['uses' =>'AltrpControllers\structureController@index']);
  Route::get('/structure_options', ['uses' =>'AltrpControllers\structureController@options']);
  Route::post('/structures', ['uses' =>'AltrpControllers\structureController@store']);
  Route::get('/structures/{structure}', ['uses' =>'AltrpControllers\structureController@show']);
  Route::put('/structures/{structure}', ['uses' =>'AltrpControllers\structureController@update']);
  Route::delete('/structures/{structure}', ['uses' =>'AltrpControllers\structureController@destroy']);
  Route::put('/structures/{structure}/{column}', ['uses' =>'AltrpControllers\structureController@updateColumn']);
  Route::get('/filters/structures/{column}', ['uses' =>'AltrpControllers\structureController@getIndexedColumnsValueWithCount']);
  // Routes for the streets resource
  Route::get('/streets', ['uses' =>'AltrpControllers\streetController@index']);
  Route::get('/street_options', ['uses' =>'AltrpControllers\streetController@options']);
  Route::post('/streets', ['uses' =>'AltrpControllers\streetController@store']);
  Route::get('/streets/{street}', ['uses' =>'AltrpControllers\streetController@show']);
  Route::put('/streets/{street}', ['uses' =>'AltrpControllers\streetController@update']);
  Route::delete('/streets/{street}', ['uses' =>'AltrpControllers\streetController@destroy']);
  Route::put('/streets/{street}/{column}', ['uses' =>'AltrpControllers\streetController@updateColumn']);
  Route::get('/filters/streets/{column}', ['uses' =>'AltrpControllers\streetController@getIndexedColumnsValueWithCount']);
  // Routes for the stage_types resource
  Route::get('/stage_types', ['uses' =>'AltrpControllers\stage_typeController@index']);
  Route::get('/stage_type_options', ['uses' =>'AltrpControllers\stage_typeController@options']);
  Route::post('/stage_types', ['uses' =>'AltrpControllers\stage_typeController@store']);
  Route::get('/stage_types/{stage_type}', ['uses' =>'AltrpControllers\stage_typeController@show']);
  Route::put('/stage_types/{stage_type}', ['uses' =>'AltrpControllers\stage_typeController@update']);
  Route::delete('/stage_types/{stage_type}', ['uses' =>'AltrpControllers\stage_typeController@destroy']);
  Route::put('/stage_types/{stage_type}/{column}', ['uses' =>'AltrpControllers\stage_typeController@updateColumn']);
  Route::get('/filters/stage_types/{column}', ['uses' =>'AltrpControllers\stage_typeController@getIndexedColumnsValueWithCount']);
  // Routes for the stage_excavations resource
  Route::get('/stage_excavations', ['uses' =>'AltrpControllers\stage_excavationController@index']);
  Route::get('/stage_excavation_options', ['uses' =>'AltrpControllers\stage_excavationController@options']);
  Route::post('/stage_excavations', ['uses' =>'AltrpControllers\stage_excavationController@store']);
  Route::get('/stage_excavations/{stage_excavation}', ['uses' =>'AltrpControllers\stage_excavationController@show']);
  Route::put('/stage_excavations/{stage_excavation}', ['uses' =>'AltrpControllers\stage_excavationController@update']);
  Route::delete('/stage_excavations/{stage_excavation}', ['uses' =>'AltrpControllers\stage_excavationController@destroy']);
  Route::put('/stage_excavations/{stage_excavation}/{column}', ['uses' =>'AltrpControllers\stage_excavationController@updateColumn']);
  Route::get('/filters/stage_excavations/{column}', ['uses' =>'AltrpControllers\stage_excavationController@getIndexedColumnsValueWithCount']);
  // Routes for the stage_disableds resource
  Route::get('/stage_disableds', ['uses' =>'AltrpControllers\stage_disabledController@index']);
  Route::get('/stage_disabled_options', ['uses' =>'AltrpControllers\stage_disabledController@options']);
  Route::post('/stage_disableds', ['uses' =>'AltrpControllers\stage_disabledController@store']);
  Route::get('/stage_disableds/{stage_disabled}', ['uses' =>'AltrpControllers\stage_disabledController@show']);
  Route::put('/stage_disableds/{stage_disabled}', ['uses' =>'AltrpControllers\stage_disabledController@update']);
  Route::delete('/stage_disableds/{stage_disabled}', ['uses' =>'AltrpControllers\stage_disabledController@destroy']);
  Route::put('/stage_disableds/{stage_disabled}/{column}', ['uses' =>'AltrpControllers\stage_disabledController@updateColumn']);
  Route::get('/filters/stage_disableds/{column}', ['uses' =>'AltrpControllers\stage_disabledController@getIndexedColumnsValueWithCount']);
  // Routes for the stages resource
  Route::get('/queries/stages/stage_info', ['uses' =>'AltrpControllers\stageController@stage_info']);
  Route::get('/queries/stages/filter_okrug', ['uses' =>'AltrpControllers\stageController@filter_okrug']);
  Route::get('/stages', ['uses' =>'AltrpControllers\stageController@index']);
  Route::get('/stage_options', ['uses' =>'AltrpControllers\stageController@options']);
  Route::post('/stages', ['uses' =>'AltrpControllers\stageController@store']);
  Route::get('/stages/{stage}', ['uses' =>'AltrpControllers\stageController@show']);
  Route::put('/stages/{stage}', ['uses' =>'AltrpControllers\stageController@update']);
  Route::delete('/stages/{stage}', ['uses' =>'AltrpControllers\stageController@destroy']);
  Route::put('/stages/{stage}/{column}', ['uses' =>'AltrpControllers\stageController@updateColumn']);
  Route::get('/filters/stages/{column}', ['uses' =>'AltrpControllers\stageController@getIndexedColumnsValueWithCount']);
  // Routes for the water_types resource
  Route::get('/water_types', ['uses' =>'AltrpControllers\water_typeController@index']);
  Route::get('/water_type_options', ['uses' =>'AltrpControllers\water_typeController@options']);
  Route::post('/water_types', ['uses' =>'AltrpControllers\water_typeController@store']);
  Route::get('/water_types/{water_type}', ['uses' =>'AltrpControllers\water_typeController@show']);
  Route::put('/water_types/{water_type}', ['uses' =>'AltrpControllers\water_typeController@update']);
  Route::delete('/water_types/{water_type}', ['uses' =>'AltrpControllers\water_typeController@destroy']);
  Route::put('/water_types/{water_type}/{column}', ['uses' =>'AltrpControllers\water_typeController@updateColumn']);
  Route::get('/filters/water_types/{column}', ['uses' =>'AltrpControllers\water_typeController@getIndexedColumnsValueWithCount']);
  // Routes for the request_statuses resource
  Route::get('/request_statuses', ['uses' =>'AltrpControllers\request_statusController@index']);
  Route::get('/request_status_options', ['uses' =>'AltrpControllers\request_statusController@options']);
  Route::post('/request_statuses', ['uses' =>'AltrpControllers\request_statusController@store']);
  Route::get('/request_statuses/{request_status}', ['uses' =>'AltrpControllers\request_statusController@show']);
  Route::put('/request_statuses/{request_status}', ['uses' =>'AltrpControllers\request_statusController@update']);
  Route::delete('/request_statuses/{request_status}', ['uses' =>'AltrpControllers\request_statusController@destroy']);
  Route::put('/request_statuses/{request_status}/{column}', ['uses' =>'AltrpControllers\request_statusController@updateColumn']);
  Route::get('/filters/request_statuses/{column}', ['uses' =>'AltrpControllers\request_statusController@getIndexedColumnsValueWithCount']);
  // Routes for the request_attributes resource
  Route::get('/request_attributes', ['uses' =>'AltrpControllers\request_attributeController@index']);
  Route::get('/request_attribute_options', ['uses' =>'AltrpControllers\request_attributeController@options']);
  Route::post('/request_attributes', ['uses' =>'AltrpControllers\request_attributeController@store']);
  Route::get('/request_attributes/{request_attribute}', ['uses' =>'AltrpControllers\request_attributeController@show']);
  Route::put('/request_attributes/{request_attribute}', ['uses' =>'AltrpControllers\request_attributeController@update']);
  Route::delete('/request_attributes/{request_attribute}', ['uses' =>'AltrpControllers\request_attributeController@destroy']);
  Route::put('/request_attributes/{request_attribute}/{column}', ['uses' =>'AltrpControllers\request_attributeController@updateColumn']);
  Route::get('/filters/request_attributes/{column}', ['uses' =>'AltrpControllers\request_attributeController@getIndexedColumnsValueWithCount']);
  // Routes for the request_adresses resource
  Route::get('/data_sources/request_adresses/adress_from_api', ['middleware' => ['auth:api'], 'uses' =>'AltrpControllers\request_adressController@adress_from_api']);
  Route::get('/request_adresses', ['uses' =>'AltrpControllers\request_adressController@index']);
  Route::get('/request_adress_options', ['uses' =>'AltrpControllers\request_adressController@options']);
  Route::post('/request_adresses', ['uses' =>'AltrpControllers\request_adressController@store']);
  Route::get('/request_adresses/{request_adress}', ['uses' =>'AltrpControllers\request_adressController@show']);
  Route::put('/request_adresses/{request_adress}', ['uses' =>'AltrpControllers\request_adressController@update']);
  Route::delete('/request_adresses/{request_adress}', ['uses' =>'AltrpControllers\request_adressController@destroy']);
  Route::put('/request_adresses/{request_adress}/{column}', ['uses' =>'AltrpControllers\request_adressController@updateColumn']);
  Route::get('/filters/request_adresses/{column}', ['uses' =>'AltrpControllers\request_adressController@getIndexedColumnsValueWithCount']);
  // Routes for the requests resource
  Route::get('/requests', ['uses' =>'AltrpControllers\requestController@index']);
  Route::get('/request_options', ['uses' =>'AltrpControllers\requestController@options']);
  Route::post('/requests', ['uses' =>'AltrpControllers\requestController@store']);
  Route::get('/requests/{request}', ['uses' =>'AltrpControllers\requestController@show']);
  Route::put('/requests/{request}', ['uses' =>'AltrpControllers\requestController@update']);
  Route::delete('/requests/{request}', ['uses' =>'AltrpControllers\requestController@destroy']);
  Route::put('/requests/{request}/{column}', ['uses' =>'AltrpControllers\requestController@updateColumn']);
  Route::get('/filters/requests/{column}', ['uses' =>'AltrpControllers\requestController@getIndexedColumnsValueWithCount']);
  // Routes for the rejection_reasons resource
  Route::get('/rejection_reasons', ['uses' =>'AltrpControllers\rejection_reasonController@index']);
  Route::get('/rejection_reason_options', ['uses' =>'AltrpControllers\rejection_reasonController@options']);
  Route::post('/rejection_reasons', ['uses' =>'AltrpControllers\rejection_reasonController@store']);
  Route::get('/rejection_reasons/{rejection_reason}', ['uses' =>'AltrpControllers\rejection_reasonController@show']);
  Route::put('/rejection_reasons/{rejection_reason}', ['uses' =>'AltrpControllers\rejection_reasonController@update']);
  Route::delete('/rejection_reasons/{rejection_reason}', ['uses' =>'AltrpControllers\rejection_reasonController@destroy']);
  Route::put('/rejection_reasons/{rejection_reason}/{column}', ['uses' =>'AltrpControllers\rejection_reasonController@updateColumn']);
  Route::get('/filters/rejection_reasons/{column}', ['uses' =>'AltrpControllers\rejection_reasonController@getIndexedColumnsValueWithCount']);
  // Routes for the priorities resource
  Route::get('/priorities', ['uses' =>'AltrpControllers\priorityController@index']);
  Route::get('/priority_options', ['uses' =>'AltrpControllers\priorityController@options']);
  Route::post('/priorities', ['uses' =>'AltrpControllers\priorityController@store']);
  Route::get('/priorities/{priority}', ['uses' =>'AltrpControllers\priorityController@show']);
  Route::put('/priorities/{priority}', ['uses' =>'AltrpControllers\priorityController@update']);
  Route::delete('/priorities/{priority}', ['uses' =>'AltrpControllers\priorityController@destroy']);
  Route::put('/priorities/{priority}/{column}', ['uses' =>'AltrpControllers\priorityController@updateColumn']);
  Route::get('/filters/priorities/{column}', ['uses' =>'AltrpControllers\priorityController@getIndexedColumnsValueWithCount']);
  // Routes for the pipeline_types resource
  Route::get('/pipeline_types', ['uses' =>'AltrpControllers\pipeline_typeController@index']);
  Route::get('/pipeline_type_options', ['uses' =>'AltrpControllers\pipeline_typeController@options']);
  Route::post('/pipeline_types', ['uses' =>'AltrpControllers\pipeline_typeController@store']);
  Route::get('/pipeline_types/{pipeline_type}', ['uses' =>'AltrpControllers\pipeline_typeController@show']);
  Route::put('/pipeline_types/{pipeline_type}', ['uses' =>'AltrpControllers\pipeline_typeController@update']);
  Route::delete('/pipeline_types/{pipeline_type}', ['uses' =>'AltrpControllers\pipeline_typeController@destroy']);
  Route::put('/pipeline_types/{pipeline_type}/{column}', ['uses' =>'AltrpControllers\pipeline_typeController@updateColumn']);
  Route::get('/filters/pipeline_types/{column}', ['uses' =>'AltrpControllers\pipeline_typeController@getIndexedColumnsValueWithCount']);
  // Routes for the okrugs resource
  Route::get('/okrugs', ['uses' =>'AltrpControllers\okrugController@index']);
  Route::get('/okrug_options', ['uses' =>'AltrpControllers\okrugController@options']);
  Route::post('/okrugs', ['uses' =>'AltrpControllers\okrugController@store']);
  Route::get('/okrugs/{okrug}', ['uses' =>'AltrpControllers\okrugController@show']);
  Route::put('/okrugs/{okrug}', ['uses' =>'AltrpControllers\okrugController@update']);
  Route::delete('/okrugs/{okrug}', ['uses' =>'AltrpControllers\okrugController@destroy']);
  Route::put('/okrugs/{okrug}/{column}', ['uses' =>'AltrpControllers\okrugController@updateColumn']);
  Route::get('/filters/okrugs/{column}', ['uses' =>'AltrpControllers\okrugController@getIndexedColumnsValueWithCount']);
  // Routes for the media_altrps resource
  Route::get('/media_altrps', ['uses' =>'AltrpControllers\media_altrpController@index']);
  Route::get('/media_altrp_options', ['uses' =>'AltrpControllers\media_altrpController@options']);
  Route::post('/media_altrps', ['uses' =>'AltrpControllers\media_altrpController@store']);
  Route::get('/media_altrps/{media_altrp}', ['uses' =>'AltrpControllers\media_altrpController@show']);
  Route::put('/media_altrps/{media_altrp}', ['uses' =>'AltrpControllers\media_altrpController@update']);
  Route::delete('/media_altrps/{media_altrp}', ['uses' =>'AltrpControllers\media_altrpController@destroy']);
  Route::put('/media_altrps/{media_altrp}/{column}', ['uses' =>'AltrpControllers\media_altrpController@updateColumn']);
  Route::get('/filters/media_altrps/{column}', ['uses' =>'AltrpControllers\media_altrpController@getIndexedColumnsValueWithCount']);
  // Routes for the localities resource
  Route::get('/localities', ['uses' =>'AltrpControllers\localityController@index']);
  Route::get('/locality_options', ['uses' =>'AltrpControllers\localityController@options']);
  Route::post('/localities', ['uses' =>'AltrpControllers\localityController@store']);
  Route::get('/localities/{locality}', ['uses' =>'AltrpControllers\localityController@show']);
  Route::put('/localities/{locality}', ['uses' =>'AltrpControllers\localityController@update']);
  Route::delete('/localities/{locality}', ['uses' =>'AltrpControllers\localityController@destroy']);
  Route::put('/localities/{locality}/{column}', ['uses' =>'AltrpControllers\localityController@updateColumn']);
  Route::get('/filters/localities/{column}', ['uses' =>'AltrpControllers\localityController@getIndexedColumnsValueWithCount']);
  // Routes for the employees resource
  Route::get('/queries/employees/filter_emplyee', ['uses' =>'AltrpControllers\employeeController@filter_emplyee']);
  Route::get('/employees', ['uses' =>'AltrpControllers\employeeController@index']);
  Route::get('/employee_options', ['uses' =>'AltrpControllers\employeeController@options']);
  Route::post('/employees', ['uses' =>'AltrpControllers\employeeController@store']);
  Route::get('/employees/{employee}', ['uses' =>'AltrpControllers\employeeController@show']);
  Route::put('/employees/{employee}', ['uses' =>'AltrpControllers\employeeController@update']);
  Route::delete('/employees/{employee}', ['uses' =>'AltrpControllers\employeeController@destroy']);
  Route::put('/employees/{employee}/{column}', ['uses' =>'AltrpControllers\employeeController@updateColumn']);
  Route::get('/filters/employees/{column}', ['uses' =>'AltrpControllers\employeeController@getIndexedColumnsValueWithCount']);
  // Routes for the disabled_types resource
  Route::get('/disabled_types', ['uses' =>'AltrpControllers\disabled_typeController@index']);
  Route::get('/disabled_type_options', ['uses' =>'AltrpControllers\disabled_typeController@options']);
  Route::post('/disabled_types', ['uses' =>'AltrpControllers\disabled_typeController@store']);
  Route::get('/disabled_types/{disabled_type}', ['uses' =>'AltrpControllers\disabled_typeController@show']);
  Route::put('/disabled_types/{disabled_type}', ['uses' =>'AltrpControllers\disabled_typeController@update']);
  Route::delete('/disabled_types/{disabled_type}', ['uses' =>'AltrpControllers\disabled_typeController@destroy']);
  Route::put('/disabled_types/{disabled_type}/{column}', ['uses' =>'AltrpControllers\disabled_typeController@updateColumn']);
  Route::get('/filters/disabled_types/{column}', ['uses' =>'AltrpControllers\disabled_typeController@getIndexedColumnsValueWithCount']);
  // Routes for the contracts resource
  Route::get('/queries/contracts/contract_list', ['uses' =>'AltrpControllers\contractController@contract_list']);
  Route::get('/contracts', ['uses' =>'AltrpControllers\contractController@index']);
  Route::get('/contract_options', ['uses' =>'AltrpControllers\contractController@options']);
  Route::post('/contracts', ['uses' =>'AltrpControllers\contractController@store']);
  Route::get('/contracts/{contract}', ['uses' =>'AltrpControllers\contractController@show']);
  Route::put('/contracts/{contract}', ['uses' =>'AltrpControllers\contractController@update']);
  Route::delete('/contracts/{contract}', ['uses' =>'AltrpControllers\contractController@destroy']);
  Route::put('/contracts/{contract}/{column}', ['uses' =>'AltrpControllers\contractController@updateColumn']);
  Route::get('/filters/contracts/{column}', ['uses' =>'AltrpControllers\contractController@getIndexedColumnsValueWithCount']);
  // Routes for the clarifications resource
  Route::get('/queries/clarifications/clarification_filter', ['uses' =>'AltrpControllers\clarificationController@clarification_filter']);
  Route::get('/clarifications', ['uses' =>'AltrpControllers\clarificationController@index']);
  Route::get('/clarification_options', ['uses' =>'AltrpControllers\clarificationController@options']);
  Route::post('/clarifications', ['uses' =>'AltrpControllers\clarificationController@store']);
  Route::get('/clarifications/{clarification}', ['uses' =>'AltrpControllers\clarificationController@show']);
  Route::put('/clarifications/{clarification}', ['uses' =>'AltrpControllers\clarificationController@update']);
  Route::delete('/clarifications/{clarification}', ['uses' =>'AltrpControllers\clarificationController@destroy']);
  Route::put('/clarifications/{clarification}/{column}', ['uses' =>'AltrpControllers\clarificationController@updateColumn']);
  Route::get('/filters/clarifications/{column}', ['uses' =>'AltrpControllers\clarificationController@getIndexedColumnsValueWithCount']);
  // Routes for the causes resource
  Route::get('/causes', ['uses' =>'AltrpControllers\causeController@index']);
  Route::get('/cause_options', ['uses' =>'AltrpControllers\causeController@options']);
  Route::post('/causes', ['uses' =>'AltrpControllers\causeController@store']);
  Route::get('/causes/{cause}', ['uses' =>'AltrpControllers\causeController@show']);
  Route::put('/causes/{cause}', ['uses' =>'AltrpControllers\causeController@update']);
  Route::delete('/causes/{cause}', ['uses' =>'AltrpControllers\causeController@destroy']);
  Route::put('/causes/{cause}/{column}', ['uses' =>'AltrpControllers\causeController@updateColumn']);
  Route::get('/filters/causes/{column}', ['uses' =>'AltrpControllers\causeController@getIndexedColumnsValueWithCount']);
  // Routes for the abonent_types resource
  Route::get('/abonent_types', ['uses' =>'AltrpControllers\abonent_typeController@index']);
  Route::get('/abonent_type_options', ['uses' =>'AltrpControllers\abonent_typeController@options']);
  Route::post('/abonent_types', ['uses' =>'AltrpControllers\abonent_typeController@store']);
  Route::get('/abonent_types/{abonent_type}', ['uses' =>'AltrpControllers\abonent_typeController@show']);
  Route::put('/abonent_types/{abonent_type}', ['uses' =>'AltrpControllers\abonent_typeController@update']);
  Route::delete('/abonent_types/{abonent_type}', ['uses' =>'AltrpControllers\abonent_typeController@destroy']);
  Route::put('/abonent_types/{abonent_type}/{column}', ['uses' =>'AltrpControllers\abonent_typeController@updateColumn']);
  Route::get('/filters/abonent_types/{column}', ['uses' =>'AltrpControllers\abonent_typeController@getIndexedColumnsValueWithCount']);
  // Routes for the zayavkas resource
  Route::get('/queries/zayavkas/requests_improvement', ['uses' => 'AltrpControllers\zayavkaController@requests_improvement']);
  Route::get('/queries/zayavkas/open_request', ['uses' => 'AltrpControllers\zayavkaController@open_request']);
  Route::get('/data_sources/zayavkas/sarch_landmark', ['middleware' => ['auth:api'], 'uses' =>'AltrpControllers\zayavkaController@sarch_landmark']);
  Route::get('/data_sources/zayavkas/subdivisions', ['middleware' => ['auth:api'], 'uses' =>'AltrpControllers\zayavkaController@subdivisions']);
  Route::get('/data_sources/zayavkas/api_subdivisions', ['middleware' => ['auth:api'], 'uses' =>'AltrpControllers\zayavkaController@api_subdivisions']);
  Route::get('/queries/zayavkas/zayavka_info', ['uses' =>'AltrpControllers\zayavkaController@zayavka_info']);
  Route::get('/data_sources/zayavkas/search_landmark', ['middleware' => ['auth:api'], 'uses' =>'AltrpControllers\zayavkaController@search_landmark']);
  Route::get('/queries/zayavkas/archieve_request', ['uses' =>'AltrpControllers\zayavkaController@archieve_request']);
  Route::get('/queries/zayavkas/new_zayavka', ['uses' =>'AltrpControllers\zayavkaController@new_zayavka']);
  Route::get('/zayavkas', ['uses' =>'AltrpControllers\zayavkaController@index']);
  Route::get('/zayavka_options', ['uses' =>'AltrpControllers\zayavkaController@options']);
  Route::post('/zayavkas', ['uses' =>'AltrpControllers\zayavkaController@store']);
  Route::get('/zayavkas/{zayavka}', ['uses' =>'AltrpControllers\zayavkaController@show']);
  Route::put('/zayavkas/{zayavka}', ['uses' =>'AltrpControllers\zayavkaController@update']);
  Route::delete('/zayavkas/{zayavka}', ['uses' =>'AltrpControllers\zayavkaController@destroy']);
  Route::put('/zayavkas/{zayavka}/{column}', ['uses' =>'AltrpControllers\zayavkaController@updateColumn']);
  Route::get('/filters/zayavkas/{column}', ['uses' =>'AltrpControllers\zayavkaController@getIndexedColumnsValueWithCount']);
  // Routes for the tests resource
  // Routes for the prichinas resource
  Route::get('/prichinas', ['uses' =>'AltrpControllers\prichinaController@index']);
  Route::get('/prichina_options', ['uses' =>'AltrpControllers\prichinaController@options']);
  Route::post('/prichinas', ['uses' =>'AltrpControllers\prichinaController@store']);
  Route::get('/prichinas/{prichina}', ['uses' =>'AltrpControllers\prichinaController@show']);
  Route::put('/prichinas/{prichina}', ['uses' =>'AltrpControllers\prichinaController@update']);
  Route::delete('/prichinas/{prichina}', ['uses' =>'AltrpControllers\prichinaController@destroy']);
  Route::put('/prichinas/{prichina}/{column}', ['uses' =>'AltrpControllers\prichinaController@updateColumn']);
  Route::get('/filters/prichinas/{column}', ['uses' =>'AltrpControllers\prichinaController@getIndexedColumnsValueWithCount']);
  // Routes for the test1s resource
  Route::get('/test1s', ['uses' =>'AltrpControllers\Test1Controller@index']);
  Route::get('/test1_options', ['uses' =>'AltrpControllers\Test1Controller@options']);
  Route::post('/test1s', ['uses' =>'AltrpControllers\Test1Controller@store']);
  Route::get('/test1s/{test1}', ['uses' =>'AltrpControllers\Test1Controller@show']);
  Route::put('/test1s/{test1}', ['uses' =>'AltrpControllers\Test1Controller@update']);
  Route::delete('/test1s/{test1}', ['uses' =>'AltrpControllers\Test1Controller@destroy']);
  Route::put('/test1s/{test1}/{column}', ['uses' =>'AltrpControllers\Test1Controller@updateColumn']);
  Route::get('/filters/test1s/{column}', ['uses' =>'AltrpControllers\Test1Controller@getIndexedColumnsValueWithCount']);
  // Routes for the zayavka_types resource
  Route::get('/zayavka_types', ['uses' =>'AltrpControllers\zayavka_typeController@index']);
  Route::get('/zayavka_type_options', ['uses' =>'AltrpControllers\zayavka_typeController@options']);
  Route::post('/zayavka_types', ['uses' =>'AltrpControllers\zayavka_typeController@store']);
  Route::get('/zayavka_types/{zayavka_type}', ['uses' =>'AltrpControllers\zayavka_typeController@show']);
  Route::put('/zayavka_types/{zayavka_type}', ['uses' =>'AltrpControllers\zayavka_typeController@update']);
  Route::delete('/zayavka_types/{zayavka_type}', ['uses' =>'AltrpControllers\zayavka_typeController@destroy']);
  Route::put('/zayavka_types/{zayavka_type}/{column}', ['uses' =>'AltrpControllers\zayavka_typeController@updateColumn']);
  Route::get('/filters/zayavka_types/{column}', ['uses' =>'AltrpControllers\zayavka_typeController@getIndexedColumnsValueWithCount']);
  // Routes for the majortests resource
  Route::get('/majortests', ['uses' =>'AltrpControllers\majortestController@index']);
  Route::get('/majortest_options', ['uses' =>'AltrpControllers\majortestController@options']);
  Route::post('/majortests', ['uses' =>'AltrpControllers\majortestController@store']);
  Route::get('/majortests/{majortest}', ['uses' =>'AltrpControllers\majortestController@show']);
  Route::put('/majortests/{majortest}', ['uses' =>'AltrpControllers\majortestController@update']);
  Route::delete('/majortests/{majortest}', ['uses' =>'AltrpControllers\majortestController@destroy']);
  Route::put('/majortests/{majortest}/{column}', ['uses' =>'AltrpControllers\majortestController@updateColumn']);
  Route::get('/filters/majortests/{column}', ['uses' =>'AltrpControllers\majortestController@getIndexedColumnsValueWithCount']);
  // Routes for the zayavka_galleries resource
  Route::get('/zayavka_galleries', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@index']);
  Route::get('/zayavka_gallery_options', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@options']);
  Route::post('/zayavka_galleries', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@store']);
  Route::get('/zayavka_galleries/{zayavka_gallery}', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@show']);
  Route::put('/zayavka_galleries/{zayavka_gallery}', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@update']);
  Route::delete('/zayavka_galleries/{zayavka_gallery}', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@destroy']);
  Route::put('/zayavka_galleries/{zayavka_gallery}/{column}', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@updateColumn']);
  Route::get('/filters/zayavka_galleries/{column}', ['middleware' => ['auth:api','role:admin'], 'uses' =>'AltrpControllers\zayavka_galleryController@getIndexedColumnsValueWithCount']);
});
