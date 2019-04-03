/*eslint-disable*/
import { message } from 'antd';
import {
  queryLabourList,
  deleteLabourSupplier,
  bizObjectMetadataList, //自定义字段列表Api
  bizObjectMetadataDelete, //...删除 Api
  bizObjectMetadataEdit, //...编辑 Api
  bizObjectListSettingShow, //所有字段列表 Api
  bizObjectListSettingEdit, //修改显示的字段列表
  bizObjectListSettingList,
  saveLabourlList,
} from '../../services/supplierManagement';

export default {
  namespace: 'labourSupplier',

  state: {
    data: '劳务供应商',
    labourList: [],
    deleteStatus: false,
    bizCode: 'labourSuppliersObject',
    bizId: '2',
    listCode: 'labourSuppliersObject',
    bizObjectList: {},
    bizObjectListSettingShow: {},
    bizObjectListSettingList: {},
    saveStatus: false,
  },

  effects: {
    *queryLabourList({ payload }, { call, put }) {
      const response = yield call(queryLabourList, payload);

      if (response.status === '200') {
        yield put({
          type: 'save',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *bizObjectList({ payload }, { call, put }) {
      //自定义字段列表查询
      const response = yield call(bizObjectMetadataList, payload);

      if (response.status === '200') {
        yield put({
          type: 'bizObjectListSave',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *bizObjectMetadataDelete({ payload }, { call, put }) {
      //自定义列表删除

      const response = yield call(bizObjectMetadataDelete, payload);

      if (response.status != '200') {
        message.warning(response.msg);
      } else {
        message.success('删除成功');
      }
    },
    *bizObjectMetadataEdit({ payload }, { call, put }) {
      //自定义列表编辑

      const response = yield call(bizObjectMetadataEdit, payload);
      if (response.status != '200') {
        message.warning(response.msg);
      }
    },
    *bizObjectListSettingShow({ payload }, { call, put }) {
      //所有的字段列表
      const response = yield call(bizObjectListSettingShow, payload);

      if (response.status === '200') {
        yield put({
          type: 'bizObjectListSettingShowSave',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *bizObjectListSettingEdit({ payload }, { call, put }) {
      //显示字段编辑
      const response = yield call(bizObjectListSettingEdit, payload);
      if (response.status != '200') {
        message.warning(response.msg);
      }
    },
    *bizObjectListSettingList({ payload }, { call, put }) {
      const response = yield call(bizObjectListSettingList, payload);

      if (response.status === '200') {
        yield put({
          type: 'bizObjectListSettingListSave',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *deleteLabourSupplier({ payload }, { call, put }) {
      const response = yield call(deleteLabourSupplier, payload);
      if (response.status === '200') {
        yield put({
          type: 'deleteLabour',
        });
      } else {
        message.error(response.msg);
      }
    },
    *saveLabourlList({ payload }, { call, put }) {
      const response = yield call(saveLabourlList, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveLabourl',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveLabourl',
          payload: false,
        });
        message.error(response.msg);
      }
    },
  },
  reducers: {
    clear() {
      return {
        data: '',
      };
    },
    save(state, { payload }) {
      return {
        ...state,
        labourList: payload.data,
      };
    },
    saveLabourl(state, { payload }) {
      return {
        ...state,
        saveStatus: payload,
      };
    },
    deleteLabour(state) {
      return {
        ...state,
        deleteStatus: true,
      };
    },
    bizObjectListSave(state, { payload }) {
      return {
        ...state,
        bizObjectList: payload,
      };
    },
    bizObjectListSettingShowSave(state, { payload }) {
      return {
        ...state,
        bizObjectListSettingShow: payload,
      };
    },
    bizObjectListSettingListSave(state, { payload }) {
      return {
        ...state,
        bizObjectListSettingList: payload,
      };
    },
  },
};
