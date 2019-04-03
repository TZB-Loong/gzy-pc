import { message } from 'antd';
import {
  getControlList,
  saveFormData,
  queryTypeList,
  allFormType,
} from '../services/api';
export default {
  namespace: 'custom',
  state: {
    controlList: [],
    typeList: [],
    saveStatus: false,
    addStatus: false,
    fromObj: {},
  },
  effects: {
    *clear({ payload }, { put }) {
      yield put({
        type: 'clearData',
        payload,
      });
    },
    //查询控件列表
    *getControlList({ payload }, { call, put }) {
      const response = yield call(getControlList, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveList',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    //保存表单数据
    *saveForm({ payload }, { call, put }) {
      const response = yield call(saveFormData, payload);
      if (response.status != '200') {
        message.error(response.msg);
      }
      yield put({
        type: 'saveStatus',
        payload: response,
      });
    },
    //查询类型数据
    *typeList({ payload }, { call, put }) {
      const response = yield call(queryTypeList, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveType',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *addType({ payload }, { call, put }) {
      const response = yield call(allFormType, payload);
      if (response.status === '200') {
        yield put({
          type: 'addTypeStatus',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *clear({ payload }, { put }) {
      yield put({
        type: 'clearData',
        payload,
      });
    },
  },

  reducers: {
    saveList(state, { payload }) {
      let items = payload.data;
      items.map((item,i)=>{
       item.ctrl_type=item.type;
       item.chn_name=item.name;
       item.index=item.id;
       item.props= JSON.parse(item.props);
       });
      return {
        ...state,
        controlList: items,
      };
    },
    saveStatus(state,{payload}){
      return {
        saveStatus:payload.status=='200',
        fromObj:payload.data,
      }
    },
    addTypeStatus(state,{payload}){
      return {
        addStatus:payload.status=='200',
      }
    },
    saveType(state,{payload}){
      return {
        typeList:payload.data||[],
      }
    },
    clearData(state) {
      return {
        controlList: [],
      };
    },
  },
};
