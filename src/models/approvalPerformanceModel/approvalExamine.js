/*eslint-disable*/
import { message } from 'antd';

import {
  queryBidList,
  reportCalibration,
  sendCalibration,
  backCalibration,
  createfile,
} from '../../services/approvalExamine';

export default {
  namespace: 'approvalExamine',
  state: {
    data: '定标审批',
    examineList: [], //审批列表
    sendCalibrationSuccess: false,
    visible: false,
  },

  effects: {
    //查询投标列表
    *queryBidList({ payload }, { call, put }) {
      const response = yield call(queryBidList, payload);
      if (response.status == 200) {
        yield put({
          type: 'queryBidListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    //提交审批
    *reportCalibration({ payload }, { call, put }) {
      const response = yield call(reportCalibration, payload);
      if (response.status != 200) {
        if (response.status == 2100) {
          yield put({
            type: 'visibleChange',
          });
        } else {
          message.warning(response.msg);
          yield put({
            type: 'initSave',
            payload: response.data,
          });
        }
      } else {
        message.success('提交成功');
        yield put({
          type: 'sendCalibrationSuccess',
          payload: response.data,
        });
      }
    },
    //批准定标审批
    *sendCalibration({ payload }, { call, put }) {
      const response = yield call(sendCalibration, payload);
      if (response.status != 200) {
        message.warning(response.msg);
        yield put({
          type: 'initSave',
          payload: response.data,
        });
      } else {
        message.success('操作成功');
        yield put({
          type: 'sendCalibrationSuccess',
          payload: response.data,
        });
      }
    },
    *backCalibration({ payload }, { call, put }) {
      const response = yield call(backCalibration, payload);
      if (response.status != 200) {
        message.warning(response.msg);
        yield put({
          type: 'initSave',
          payload: response.data,
        });
      } else {
        message.success('操作成功');
        yield put({
          type: 'sendCalibrationSuccess',
          payload: response.data,
        });
      }
    },
    *createfile({ payload }, { call, put }) {
      const response = yield call(createfile, payload);
      if (response.status == 200) {
        console.log(response, 'response');
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
    queryBidListSave(state, { payload }) {
      return {
        ...state,
        examineList: payload.data,
      };
    },
    sendCalibrationSuccess(state, { payload }) {
      return {
        ...state,
        sendCalibrationSuccess: true,
        visible: false,
      };
    },
    initSave(state, { payload }) {
      return {
        ...state,
        sendCalibrationSuccess: false,
        visible: false,
      };
    },
    visibleChange(state) {
      return {
        ...state,
        visible: true,
      };
    },
  },
};
