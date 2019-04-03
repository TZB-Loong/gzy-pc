/*eslint-disable*/
import { message } from 'antd';
import {
  getMaterialTenderList,
  getMaterialTenderDraftList,
  deleteDraft,
} from '../../services/tender';

export default {
  namespace: 'materialList',
  state: {
    titleData: '材料招标',
    materialListData: [],
    materialTenderDraftList: [],
  },
  effects: {
    *getMaterialTenderList({ payload }, { call, put }) {
      const response = yield call(getMaterialTenderList, payload);
      if (response.status == 200) {
        yield put({
          type: 'getMaterialTenderListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getMaterialTenderDraftList({ payload }, { call, put }) {
      const response = yield call(getMaterialTenderDraftList, payload);
      if (response.status == 200) {
        yield put({
          type: 'getMaterialTenderDraftListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
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
    getMaterialTenderListSave(state, { payload }) {
      return {
        ...state,
        materialListData: payload.data,
      };
    },
    getMaterialTenderDraftListSave(state, { payload }) {
      return {
        ...state,
        materialTenderDraftList: payload.data,
      };
    },
  },
};
