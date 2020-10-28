import {ADD_RESPONSE_DATA, CLEAR_ALL_RESPONSE_DATA} from './actions'
import AltrpModel from "../../../../../editor/src/js/classes/AltrpModel";

const defaultResponsesStorage = {
  
};

export function responsesStorageReducer(responsesStorage, action) {
  responsesStorage = responsesStorage || new AltrpModel(defaultResponsesStorage);
  switch (action.type) {
    case ADD_RESPONSE_DATA:{
      let data = action.data;
      responsesStorage = _.cloneDeep(responsesStorage);
      console.log(data);
      console.log(action.formId);
      console.log(responsesStorage.getData());
      responsesStorage.setProperty(action.formId, data);
      console.log(responsesStorage.getData());
    }break;
    case CLEAR_ALL_RESPONSE_DATA:{
      responsesStorage = new AltrpModel({});
    }break;
  }
  if(responsesStorage instanceof AltrpModel){
    return responsesStorage;
  }
  return new AltrpModel(responsesStorage);
}