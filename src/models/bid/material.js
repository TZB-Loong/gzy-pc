/*eslint-disable*/
import { message } from 'antd';
import {
  materialInitConfig,
  getTender,
  saveMaterialTender,
  getChangeList,
  questionRecords,
} from '../../services/tender';

export default {
  namespace: 'material',
  state: {
    saveStatus: false,
    materialTender: {},
    getChangeList: [],
    questionRecords: [],
    uploadTenderList: {},
    detail: {},
    initData: {
      tenderOpenDate: {
        maxDays: 10,
      },
      materialTenderAgainFields: {},
      materialTenderFields: {},
      couldChangeNum: 3,
      tenderCloseDate: {
        maxDays: 10,
        minDays: 2,
      },
      ticket: [
        {
          "label": "增值税一般",
          "value": 246
        },
        {
          "label": "增值税小规模",
          "value": 247
        }
      ],
      materialScales: [{ label: '', value: '' }],
      couldChangeDay: 3,
    },
  },
  effects: {
    *materialInitConfig({ payload }, { call, put }) {
      const response = yield call(materialInitConfig, payload);
      if (response.status == '200') {
        yield put({
          type: 'queryCorpUsersAndRolesSave',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *saveMaterialTender({ payload }, { call, put }) {
      const response = yield call(saveMaterialTender, payload);
      console.log(response.status);
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
    *getMaterialTender({ payload }, { call, put }) {
      const response = yield call(getTender, payload);

      if (response.status == '200') {
        yield put({
          type: 'materialTender',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getChangeList({ payload }, { call, put }) {
      const response = yield call(getChangeList, payload);

      if (response.status == '200') {
        yield put({
          type: 'ChangeList',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *questionRecords({ payload }, { call, put }) {
      const response = yield call(questionRecords, payload);
      if (response.status == 200) {
        yield put({
          type: 'question',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *clear(_, { call, put }) {
      yield put({
        type: 'Clear',
      });
    },
  },
  reducers: {
    saveStatus(state, { payload }) {
      return {
        ...state,
        saveStatus: payload,

      };
    },
    Clear(_, { call, put }) {
      return {
        saveStatus: false,
        materialTender: {},
        getChangeList: [],
        questionRecords: [],
        uploadTenderList: {},
        detail: {},
        initData: {
          tenderOpenDate: {
            maxDays: 10,
          },
          materialTenderAgainFields: {},
          materialTenderFields: {},
          couldChangeNum: 3,
          tenderCloseDate: {
            maxDays: 10,
            minDays: 2,
          },
          ticket: [
            {
              "label": "增值税一般",
              "value": 246
            },
            {
              "label": "增值税小规模",
              "value": 247
            }
          ],
          materialScales: [{ label: '', value: '' }],
          couldChangeDay: 3,
        },
      };
    },
    queryCorpUsersAndRolesSave(state, { payload }) {
      return {
        ...state,
        initData: payload,
      };
    },
    materialTender(state, { payload }) {
      return {
        ...state,
        materialTender: payload,
        detail: payload,
      };
    },
    ChangeList(state, { payload }) {
      return {
        ...state,
        getChangeList: payload,
      };
    },
    question(state, { payload }) {
      return {
        ...state,
        questionRecords: payload,
      };
    },
  },
};
