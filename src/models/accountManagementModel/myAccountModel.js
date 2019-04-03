/*eslint-disable*/
import {queryCorpService} from '../../services/api';
import { message } from 'antd';
export default {
  namespace: 'myAccountModel',

  state: {
    data: '我的账户',
    AbortAccount: '2018-12-20',
    PeriodDay: '365',
    accountData:[]
  },

  effects: {
    *queryCorpService({payload},{call,put}){
      const response = yield call(queryCorpService,payload);

      console.log(response,'response')

      if(response.status ==200){
        yield put({
          type:"save",
          payload:response.data
        })
      }else{
        message.warning(response.msg);
      }

    }
  },

  reducers: {
    save(state, { payload }) {

      return {
        ...state,
        accountData:payload
      };
    },
    clear() { //清除所有数
      return {
        accountData:[],
      };
    },
  },
};
