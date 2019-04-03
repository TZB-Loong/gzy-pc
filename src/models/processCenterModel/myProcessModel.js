/*eslint-disable*/
import {} from '../../services/api';
import {message} from 'antd'
import { queryMyProcessByPage } from '../../services/process';

export default {
  namespace: 'myProcessModel',

  state: {
    data: '审批管理-我发起的',
    loading: false,
    LaunchedTaskList: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryMyProcessByPage, payload);
      if (response.status === '200') {
        yield put({
          type: 'LaunchedTaskList',
          payload: {
            LaunchedTaskList: response,
          },
        });
      } else {
        message.warning(response.msg);
      }
    },
  },

  reducers: {
    LaunchedTaskList(
      state,
      {
        payload: { LaunchedTaskList },
      }
    ) {
      return {
        ...state,
        LaunchedTaskList: LaunchedTaskList.data,
        total: LaunchedTaskList.data ? LaunchedTaskList.data.total : 0,
      };
    },
  },
};
