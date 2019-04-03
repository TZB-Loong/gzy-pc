/*eslint-disable*/
import {} from '../../services/api';
import {message} from 'antd'
import { queryDoneProcessByPage } from '../../services/process';

export default {
  namespace: 'doneProcessModel',

  state: {
    data: '审批管理-已审批',
    loading: false,
    doneTaskList: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryDoneProcessByPage, payload);
      if (response.status === '200') {
        yield put({
          type: 'doneTaskList',
          payload: {
            doneTaskList: response,
          },
        });
      } else {
        message.warning(response.msg);
      }
    },
  },

  reducers: {
    doneTaskList(
      state,
      {
        payload: { doneTaskList },
      }
    ) {
      return {
        ...state,
        doneTaskList: doneTaskList.data,
        total: doneTaskList.data ? doneTaskList.data.total : 0,
      };
    },
  },
};
