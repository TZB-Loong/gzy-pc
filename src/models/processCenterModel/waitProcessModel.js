/*eslint-disable*/
import {} from '../../services/api';
import {message} from 'antd'
import { queryProcessByPage } from '../../services/process';

export default {
  namespace: 'waitProcessModel',

  state: {
    data: '审批管理-待我审批',
    loading: false,
    TodoTaskList: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryProcessByPage, payload);
      if (response.status === '200') {
        yield put({
          type: 'TodoTaskList',
          payload: {
            TodoTaskList: response,
          },
        });
      } else {
        message.warning(response.msg);
      }
    },
    // *details({ payload }, { call, put }) {
    //   const response = yield call(queryProjectById, payload);
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'projectDetails',
    //       payload: {
    //         projectDetails: response,
    //       },
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
    // *getCompanyName({}, { call, put }) {
    //   const response = yield call(queryCompanyName);
    //
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'CompanyName',
    //       payload: response,
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
    // *addProject({ payload, callback }, { call, put }) {
    //   const response = yield call(saveProject, payload);
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'saveProject',
    //       payload: {
    //         saveProject: response,
    //       },
    //     });
    //     if (callback) callback();
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
    // *delProject({ payload, callback }, { call, put }) {
    //   const response = yield call(deleteProject, payload.delProject);
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'fetch',
    //       payload: payload.fetch,
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    //   yield put({
    //     type: 'delProjectRe',
    //     payload: {
    //       deleteProject: response,
    //     },
    //   });
    //   if (callback) callback();
    // },
  },

  reducers: {
    TodoTaskList(
      state,
      {
        payload: { TodoTaskList },
      }
    ) {
      return {
        ...state,
        TodoTaskList: TodoTaskList.data,
        total: TodoTaskList.data ? TodoTaskList.data.total : 0,
      };
    },
    // save(state, { payload }) {
    //   return {
    //     ...state,
    //     ...payload,
    //   };
    // },
    // clear() {
    //   return {
    //     data: '',
    //   };
    // },
  },
};
