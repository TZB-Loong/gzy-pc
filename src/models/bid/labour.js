/*eslint-disable*/
import { message } from 'antd';
import { saveLabourTender, labourInitConfig, getLabourTender } from '../../services/tender';

export default {
  namespace: 'labour',
  state: {
    saveStatus: false,
    initData: {
      tenderOpenDate: {
        maxDays: 10,
      },
      labourTenderFields: {},
      workType: [],
      couldChangeNum: 3,
      tenderCloseDate: {
        maxDays: 10,
        minDays: 2,
      },
      couldChangeDay: 789,
      labourTenderAgainFields: {},
    },
    detail: {},
    LabourTender: {},
  },

  effects: {
    *saveLabourTender({ payload }, { call, put }) {
      const response = yield call(saveLabourTender, payload);
      if (response.status == '200') {
        yield put({
          type: 'saveStatus',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveStatus',
          payload: false,
        });
        message.warning(response.msg);
      }
    },
    *labourInitConfig(_, { call, put }) {
      const response = yield call(labourInitConfig);
      console.log(response);
      if (response.status == '200') {
        yield put({
          type: 'saveData',
          payload: response.data,
        });
      } else {
        yield put({
          type: 'saveStatus',
          payload: false,
        });
        message.warning(response.msg);
      }
    },
    *getLabourTender({ payload }, { call, put }) {
      const response = yield call(getLabourTender, payload);
      if (response.status == '200') {
        yield put({
          type: 'LabourTender',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },*clear(_, { call, put }) {
      yield put({
        type: 'Clear',
      });
    }
  },
  reducers: {
    saveStatus(state, { payload }) {
      return {
        ...state,
        saveStatus: payload,
        initData: {
          tenderOpenDate: {
            maxDays: 10,
          },
          labourTenderFields: {},
          workType: [],
          couldChangeNum: 3,
          tenderCloseDate: {
            maxDays: 10,
            minDays: 2,
          },
          couldChangeDay: 789,
          labourTenderAgainFields: {},
        },
        detail: {},
        LabourTender: {},
      };
    },
    saveData(state, { payload }) {
      return {
        ...state,
        initData: payload,
        saveStatus: true,
      };
    },
    saveTenderData(state, { payload }) {
      return {
        ...state,
        detail: payload,
      };
    },
    Clear(_, { call, put }) {
      return {
        detail: {},
        LabourTender: [],
        saveStatus: false,
      };
    },
    LabourTender(state, { payload }) {
      return {
        ...state,
        LabourTender: payload,
        detail: payload,
      };
    },
  },
};
