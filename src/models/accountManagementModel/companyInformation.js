/*eslint-disable*/
import {queryAuthbusinessById,saveAuthbusiness} from '../../services/api';
import { message } from 'antd';
export default {
  namespace: 'companyInformation',

  state: {
    data: '公司信息',
    informationData:[]
  },

  effects: {
    *queryAuthbusinessById({payload},{call,put}){
      const response = yield call(queryAuthbusinessById,payload);

      if(response.status == 200){
        yield put({
          type:"save",
          payload:response.data
        })
      }else{
        message.warning(response.msg);
      }
    },
    *saveAuthbusiness({payload},{call,put}){
      const response = yield call(saveAuthbusiness,payload);
      if(response.status == 200){
        console.log('shnem a ')
        message.success('保存成功')
      }else{
        message.warning(response.msg)
      }
    }
  },

  reducers: {
    save(state, { payload }) {
      console.log(payload,'--')
      return {
        ...state,
        informationData:payload
      };
    },
    clear() { //清除所有数
      return {
        informationData:[],
      };
    },
  },
};
