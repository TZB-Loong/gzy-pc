/*eslint-disable*/
import {bizObjectList,removeForm} from '../../services/process';
import { message } from 'antd';
export default {
  namespace: 'processStartModel',

  state: {
    data: '审批管理-发起审批',
    bizObjectList:[], //自定义审批列表
    removeStatus:false,
  },

  effects: {
    *bizObjectList({payload},{call,put}){
      const response = yield call(bizObjectList,payload);
      if(response.status==200){
        yield put ({
          type:'bizObjectListSave',
          payload:response.data
        })
      }else{
        message.warning(response.msg)
      }
    },
    *removeForm({payload},{call,put}){
      const response = yield call(removeForm,payload);
      yield put ({
        type:'removeStatus',
        payload:response
      })
    },
  },

  reducers: {
    removeStatus(state,{payload}){
      console.log(payload)
      return{
        ...state,
        removeStatus:payload.status=='200'
      }
    },
    bizObjectListSave(state,{payload}){
      return{
        ...state,
        bizObjectList:payload
      }
    },
  },
};
