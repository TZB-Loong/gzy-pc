/*eslint-disable*/
import { message } from 'antd';
import {
  queryMaterialList,
  deleteMaterialSupplier,
  saveMaterialList,
  bizObjectMetadataList, //自定义字段列表Api
  bizObjectMetadataDelete, //...删除 Api
  bizObjectMetadataEdit, //...编辑 Api
  bizObjectListSettingShow, //所有字段列表 Api
  bizObjectListSettingEdit, //修改显示的字段列表
  bizObjectListSettingList,
} from '../../services/supplierManagement';
export default {
  namespace: 'materialSupplier',
  state: {
    data: '材料供应商',
    materialList: {},
    deleteStatus: false,
    saveStatus: false,
    bizCode: 'materialSuppliersObject',
    bizId: '1',
    listCode: 'materialSuppliersObject',
    bizObjectList: {},
    bizObjectListSettingShow: {},
    bizObjectListSettingList: {},
  },

  effects: {
    *queryMaterialList({ payload }, { call, put }) {
      const response = yield call(queryMaterialList, payload);

      if (response.status === '200') {
        yield put({
          type: 'save',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *deleteMaterialSupplier({ payload }, { call, put }) {
      const response = yield call(deleteMaterialSupplier, payload);
      if (response.status === '200') {
        yield put({
          type: 'deleteMaterial',
        });
      } else {
        message.error(response.msg);
      }
    },
    *saveMaterialList({ payload }, { call, put }) {
      const response = yield call(saveMaterialList, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveMaterial',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveMaterial',
          payload: false,
        });
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
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        materialList: payload.data,
      };
    },
    deleteMaterial(state) {
      return {
        ...state,
        deleteStatus: true,
      };
    },
    saveMaterial(state, { payload }) {
      return {
        ...state,
        saveStatus: payload,
      };
    },
    clear() {
      return {
        data: '',
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
