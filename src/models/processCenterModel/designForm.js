/*eslint-disable*/
import {} from '../../services/api';
import {message} from 'antd'
import { queryMyProcessByPage } from '../../services/process';

export default {
  namespace: 'designForm',

  state: {
    data: '新家审批模板',
    loading: false,
    LaunchedTaskList: {},

  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryMyProcessByPage, payload);
      if (response.status === '200') {
        yield put({
          type: 'Save',
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
    Save(
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
