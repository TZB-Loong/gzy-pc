/*eslint-disable*/
import { message } from 'antd';
import { saveWorkflow, workflowDetails, workflowList,saveCustomWorkflow } from '../../services/workflow';

export default {
  namespace: 'performanceProgressModel',
  state: {
    data: '流程设计',
    saveStatus: false,
    details: '',
    list: '',
    processId: '',
  },

  effects: {
    *workflowList({ payload }, { call, put }) {
      const response = yield call(workflowList, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *workflowDetail({ payload }, { call, put }) {
      const response = yield call(workflowDetails, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveDetail',
          payload: response,
        });
      } else {
        yield put({
          type: 'clear',
          payload: response,
        });
        message.info(response.msg);
      }
    },
    *saveFlow({ payload }, { call, put }) {
      const response = yield call(saveWorkflow, payload);
      if (response.status === '200') {
        yield put({
          type: 'save',
          payload: response,
        });
      } else {
        message.info(response.msg);
      }
    },
    *saveCustomFlow({ payload }, { call, put }) {
      const response = yield call(saveCustomWorkflow, payload);
      if (response.status === '200') {
        yield put({
          type: 'save',
          payload: response,
        });
      } else {
        message.info(response.msg);
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        saveStatus: true,
      };
    },
    saveDetail(state, { payload }) {
      return {
        ...state,
        details: payload.data.process,
        processId: payload.data.processId,
      };
    },
    clear() {
      return {
        saveStatus: false,
        details: '',
        list: '',
        processId: '',
      };
    },
  },
};
