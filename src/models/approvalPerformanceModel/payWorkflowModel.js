/*eslint-disable*/
import {} from '../../services/api';
import { message } from 'antd';

import {
  queryPayByPage,
  queryPayById,
  savePay,
  deletePay,
  queryPayName,
} from '../../services/payWorkflow';
import { queryProjectByPage, saveProject } from '../../services/project';

export default {
  namespace: 'payWorkflowModel',

  state: {
    data: '发起支付审批',
    loading: false,
    saveStatus: false,
    projectName: '苏州上东区项目售楼处及样板房精装修工程',
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryPayByPage, payload);
      yield put({
        type: 'payList',
        payload: {
          projectList: response,
        },
      });
    },
    *addPay({ payload, callback }, { call, put }) {
      console.log(payload);
      const response = yield call(savePay, payload);
      if (response.status == '200') {
        yield put({
          type: 'savePay',
          payload: {
            savePay: response,
          },
        });
        if (callback) callback();
      } else {
        message.error(response.msg);
      }
    },
    *sendApproval({ payload, callback }, { call, put }) {
      const response = yield call(sendApproval, payload);
      if (response.status == '200') {
        yield put({
          type: 'sendApproval',
          payload: {
            sendApproval: response,
          },
        });
        if (callback) callback();
      } else {
        message.error(response.msg);
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // savePay(state, { payload }) {
    //   return {
    //     saveStatus: true,
    //   };
    // },
    savePay(
      state,
      {
        payload: { savePay },
      }
    ) {
      return {
        ...state,
        savePay: savePay,
      };
    },
    // sendApproval(state, { payload }) {
    //   return {
    //     saveStatus: true,
    //   };
    // },

    sendApproval(
      state,
      {
        payload: { sendApproval },
      }
    ) {
      return {
        ...state,
        sendApproval: sendApproval,
      };
    },

    clear() {
      return {
        data: '',
      };
    },
  },
};
