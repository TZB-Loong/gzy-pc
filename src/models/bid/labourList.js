/*eslint-disable*/
import { message } from 'antd';
import { getLabourTenderList, getLabourTenderDraftList, deleteDraft } from '../../services/tender';

export default {
  namespace: 'labourList',
  state: {
    titleData: '劳务招标',
    labourList: [],
    labourListDraftList: [],
  },
  effects: {
    *getLabourTenderList({ payload }, { call, put }) {
      const response = yield call(getLabourTenderList, payload);
      console.log(response, '-response-');
      if (response.status == 200) {
        yield put({
          type: 'labourListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getLabourTenderDraftList({ payload }, { call, put }) {
      const response = yield call(getLabourTenderDraftList, payload);
      if (response.status == 200) {
        yield put({
          type: 'getTenderDraftListSave',
          payload: response,
        });
      }
    },
    *deleteDraft({ payload }, { call, put }) {
      const response = yield call(deleteDraft, payload);
      if (response.status == 200) {
        message.success('删除成功');
      }
    },
  },
  reducers: {
    labourListSave(state, { payload }) {
      return {
        ...state,
        labourList: payload.data,
      };
    },
    getTenderDraftListSave(state, { payload }) {
      return {
        ...state,
        labourListDraftList: payload.data,
      };
    },
  },
};
