import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import {
  Card,
  Modal,
  Table,
  Button,
  Input,
  Select,
  Checkbox,
  DatePicker,
  Form,
  Row,
  Col,
  message,
  Radio,
  Icon,
  Spin,
  Tooltip,
} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {connect} from 'dva'
import {getUrlParamBySearch,uuid} from '../../utils/utils'
import {isfalse} from '../../Tools/util_tools'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Styles from './style.less'
import PropertySetting from './propertySetting';
import ControlView from './controlView';
import BasicSetting from '../Custom/basicSetting';
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
//自定义ICON
const MenusIcon = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_897614_s1hjnuh81g.js', // 在 iconfont.cn 自定义
});

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
//移动节点重置数据
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceMenu =
    [
      { ctrlType: 'text', chnName: '单行文本', props: {"required":false,"placeholder":"请填写文本内容","options":null,"format":null,"maxLength":100,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'textarea', chnName: '多行文本', props: {"required":false,"placeholder":"请填写文本内容","options":null,"format":null,"maxLength":500,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'number', chnName: '数字', props: {"required":false,"placeholder":"请填写数字","options":null,"format":null,"maxLength":10,"defaultValue":"","rule":"","unit":'个',"readonly":false,'point':2} },
      { ctrlType: 'money', chnName: '金额', props: {"required":false,"placeholder":"请填写金额","options":null,"format":null,"maxLength":10,"defaultValue":"","rule":"","unit":'元',"readonly":false,'point':2} },
      { ctrlType: 'radio', chnName: '单选框', props: {"required":false,"placeholder":"请选择","options":[
        {value:'选项1',checked:false},
        {value:'选项2',checked:false},
        {value:'选项3',checked:false}], "format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'checkbox', chnName: '多选框', props: {"required":false,"placeholder":"请选择","options":[
        {value:'选项1',checked:false},
        {value:'选项2',checked:false},
        {value:'选项3',checked:false}], "format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'dropdown', chnName: '下拉列表', props: {"required":false,"placeholder":"请选择","options":[
        {value:'选项1',checked:false},
        {value:'选项2',checked:false},
        {value:'选项3',checked:false}], "format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'date', chnName: '日期', props: {"required":false,"placeholder":"请选择日期","options":null,"format":'YYYY-MM-DD',"maxLength":0,"defaultValue":"none","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'datearea', chnName: '日期区间', props: {"required":false,"placeholder":"请选择日期区间","options":null,"format":'YYYY-MM-DD',"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'phone', chnName: '电话号码', props: {"required":false,"placeholder":"请填写电话号码","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'attach', chnName: '附件', props: {"required":false,"placeholder":"请上传附件","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'subfrom', chnName: '子表单', props: {"required":false,"placeholder":"子表单","options":[
        {ctrlType: 'text',
          chnName: '单行文本',
          ctrlName: '单行文本',
          extentionProps: {
            required: false,
            placeholder: '请填写文本内容',
            options: null,
            format: null,
            maxLength: 100,
            defaultValue: '',
            rule: '',
            unit: null,
            readonly: false,
          }},
      ],"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'www', chnName: '网址', props: {"required":false,"placeholder":"请填写网址","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'email', chnName: '邮箱', props: {"required":false,"placeholder":"请填写邮箱","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'user', chnName: '人员选择', props: {"required":false,"placeholder":"请人员选择","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'area', chnName: '地区', props: {"required":false,"placeholder":"请填写地区","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'applyPerson', chnName: '申请人', props: {"required":false,"placeholder":"请填写申请人","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":true} },
      { ctrlType: 'applyTime', chnName: '申请日期', props: {"required":false,"placeholder":"申请日期","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":true} },
      { ctrlType: 'chooseProject', chnName: '选择项目', props: {"required":false,"placeholder":"请选择项目","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      //{ index:19,ctrlType: 'chooseMaterialTender', chnName: '选择材料招标', props: {"required":false,"placeholder":"请选择材料招标","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      //{ index:20,ctrlType: 'chooseLabourTender', chnName: '选择劳务招标', props: {"required":false,"placeholder":"请选择劳务招标","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { index:21,ctrlType: 'chooseMaterialSupplier', chnName: '选择材料供应商', props: {"required":false,"placeholder":"请选择材料供应商","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { index:21,ctrlType: 'chooseLabourSupplier', chnName: '选择劳务供应商', props: {"required":false,"placeholder":"请选择劳务供应商","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { index:22,ctrlType: 'material', chnName: '选择材料分类', props: {"required":false,"placeholder":"请选择材料分类","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
    ]

  const sourceClone = Array.from(sourceMenu);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  const result = {};
  result[droppableSource.droppableId] = source;
  result[droppableDestination.droppableId] = destClone;
  return result;
};
//操作区域样式
const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  background: isDragging ? '#e2f3ff' : 'transparent',
  ...draggableStyle
});
const getItemLeftStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: '10px 15px',
  margin: `0 0 5px 0`,
  boxShadow:isDragging? '1px 1px 2px #666':'',
  background: isDragging ? '#EDFFE3' : '#fff',
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  // border:'1px solid rgb(231, 231, 231)',
  // padding: grid,
  width: '100%',
  overflowY:'scroll',
  height:"calc(100% - 60px)",
});


@Form.create()
@connect(({ custom,submForm, loading }) => ({
  custom,submForm,
  loading: loading.effects['custom/getControlList'],
}))
export default class DesignForms extends Component {
  state = {
    items:[],
    selected: [],
    basic: {},
    require: false,
    type: 'ADD',
    checkboxIndex: null,
    checkboxValue: {},
  };
  id2List = {
    droppable: 'items',
    droppable2: 'selected',
  };
  componentDidMount() {
    let nodes = document.getElementsByClassName('setHeight');
    for (let i =0;nodes.length>i;i++){
      nodes[i].style.height = (window.innerHeight-305)+'px'
    };
    const {dispatch,submForm} = this.props;
    if(getUrlParamBySearch(window.location.href, 'bizCode')){
      this.setState({
        bizCode:getUrlParamBySearch(window.location.href, 'bizCode'),
      },()=>{this.queryForm()})
    }

    /*if (!isfalse(submForm.listData)) {
      submForm.listData.map(item=>{
        item.props = JSON.parse(item.extentionProps)
      });
      this.setState({
        selected: submForm.listData,
      });
    }*/
    dispatch({
      type: 'custom/getControlList',
    }).then(()=>{
      let items = this.props.custom.controlList;
      /*items.map((item,i)=>{
        // ,.{ ctrlType: 'date', chnName: '日期', props: { placeholder: 'date' } }
        item.ctrlType=item.type;
        item.chnName=item.name;
        item.props= JSON.parse(item.props);
        Object.assign(item.props, {index:i});
      });
      this.setState({
        items,
        // menu:items,
      },()=>{console.log(this.state)})
      console.log(this.props)*/
    });
    if(getUrlParamBySearch(window.location.href, 'bizType')){
      let params={
        bizDesc:getUrlParamBySearch(window.location.href, 'bizDesc')||'',
        bizType:getUrlParamBySearch(window.location.href, 'bizType')||'',
        bizName:getUrlParamBySearch(window.location.href, 'bizName')||'',
      };
      this.setState({
        basic:params,
        type:getUrlParamBySearch(window.location.href, 'type'),
        bizCode:getUrlParamBySearch(window.location.href, 'bizCode'),
      },()=>{this.queryForm()})
    }
  };
  queryForm = () => {
    //查询数据,生成表单
    const { dispatch } = this.props;
    dispatch({
      type: 'submForm/bizObjectMetadataCustomList',
      payload: {bizCode:this.state.bizCode},
    }).then(() => {
      const { submForm } = this.props;
      if (!isfalse(submForm.listData)) {
        submForm.listData.map(item=>{
          let dataProps = JSON.parse(item.extentionProps);
          if(item.ctrlType == "subfrom" && dataProps.options){
            dataProps.options.map(item=>{
              item.extentionProps = JSON.parse(item.extentionProps)
            })
          }
          item.props = dataProps
        });
        this.setState({
          selected: submForm.listData,
        });
      }
    });
  };
  //提交表单设计数据
  saveFormNode=(menu)=>{
    const {dispatch,custom:{controlList},form} = this.props;
    form.validateFields((err, values) => {
      console.log(values)
      if (!err) {
        let data = this.state.selected;
        if(data.length===0){
          message.info('至少包含一个业务控件!');
          return
        }
        console.log(data)
        let params = {},MetadataList=[];
        data.map((item,index)=>{
          let oldctrlName = '';
          for(let i =0;menu.length>i;i++){
            if(item.ctrlType==menu[i].ctrlType){
              oldctrlName = menu[i].chnName;
            }
          }
          if(item.ctrlType=='attach'){
            // 生成随机附件code
            item.props=Object.assign({}, item.props, { attachCode: uuid() })
          }
          MetadataList.push({
            ctrlName:item.ctrlName,
            id:item.id,
            chnName:item.chnName,
            ctrlType:item.ctrlType,
            required:item.props.required,
            placeholder:item.props.placeholder,
            extentionProps:item.props,
          })
        });

        if(getUrlParamBySearch(window.location.href, 'id')){
          values.bizCode=getUrlParamBySearch(window.location.href,'bizCode');
          values.id=getUrlParamBySearch(window.location.href,'id');
          MetadataList.map(item=>{
            item.bizId = this.state.selected[0].bizId;
          })
        }
        console.log(MetadataList)
        params.bizObject=values;
        params.bizObjectMetadataList=MetadataList;
        dispatch({
          type: 'custom/saveForm',
          payload:params,
        }).then(()=>{
          const {custom:{saveStatus,fromObj}} = this.props;
          const {type} = this.state;
          console.log(this.props)
          if(saveStatus){
            let id = '';
            if(getUrlParamBySearch(window.location.href, 'id')) {
              id = getUrlParamBySearch(window.location.href, 'id');
              message.success('表单编辑成功!');
            }else {
              id = fromObj.id;
              message.success('表单保存成功，请继续完成流程设计!');
            }
            dispatch(
              routerRedux.push(`/processCenter/designFormNext?bizCode=`+fromObj.bizCode+
                '&bizName='+params.bizObject.bizName+
                '&type='+type+
                '&id='+id+
                '&bizDesc='+values.bizDesc+
                '&bizType='+values.bizType)
            );
          }
        });
      }
    });
  };

  changeState(selected) {
    this.setState({
      selected,
    });
  }
  getList = id => this.state[this.id2List[id]];
  onDragEnd = result => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      let state = { items };
      if (source.droppableId === 'droppable2') {
        state = { selected: items };
        this.setState({ checkboxIndex: result.destination.index, checkboxValue: items[result.destination.index] });
      }
      this.setState(state);
      // 拖拽时修改选中值
    } else {
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );
      let selecteds = result.droppable2
      console.log(selecteds)
      let submitData =[]
      selecteds.map((item,index)=>{
        submitData.push({
          id:item.id||null,
          chnName:item.chnName,
          ctrlName:item.ctrlName,
          ctrlType:item.ctrlType,
          props:item.props,
          index:index,
        });
      })
      console.log(submitData)
      this.setState({
        items: result.droppable,
        selected: submitData,
      });
    }/*
    if(source.droppableId=="droppable"){
      let curSelectCtrl = this.state.selected;
      curSelectCtrl.push(sourceMenu[source.index]);
      this.setState({
        selected: curSelectCtrl,
      });
    }*/
  };
  //删除选择项
  onRemove=(index)=>{
    let selected = this.state.selected;
    selected.splice(index,1);
    this.setState({selected})
  };
  addCurControl=(item)=>{
    let selected = this.state.selected;
    console.log(item)
    selected.map((item,index)=>{
      item.index = index;
    })
    selected.push(item);
    this.setState({selected},()=>{
      console.log(this.state.selected)
    })
  };


  render() {
    let { checkboxValue } = this.state;
    const { getFieldDecorator } = this.props.form;
    const menu = [
      { ctrlType: 'text', chnName: '单行文本', props: {"required":false,"placeholder":"请填写文本内容","options":null,"format":null,"maxLength":100,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'textarea', chnName: '多行文本', props: {"required":false,"placeholder":"请填写文本内容","options":null,"format":null,"maxLength":500,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'number', chnName: '数字', props: {"required":false,"placeholder":"请填写数字","options":null,"format":null,"maxLength":10,"defaultValue":"","rule":"","unit":'个',"readonly":false,'point':2} },
      { ctrlType: 'money', chnName: '金额', props: {"required":false,"placeholder":"请填写金额","options":null,"format":null,"maxLength":10,"defaultValue":"","rule":"","unit":'元',"readonly":false,'point':2} },
      { ctrlType: 'radio', chnName: '单选框', props: {"required":false,"placeholder":"请选择","options":[
        {value:'选项1',checked:false},
        {value:'选项2',checked:false},
        {value:'选项3',checked:false}], "format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'checkbox', chnName: '多选框', props: {"required":false,"placeholder":"请选择","options":[
        {value:'选项1',checked:false},
        {value:'选项2',checked:false},
        {value:'选项3',checked:false}], "format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'dropdown', chnName: '下拉列表', props: {"required":false,"placeholder":"请选择","options":[
        {value:'选项1',checked:false},
        {value:'选项2',checked:false},
        {value:'选项3',checked:false}], "format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'date', chnName: '日期', props: {"required":false,"placeholder":"请选择日期","options":null,"format":'YYYY-MM-DD',"maxLength":0,"defaultValue":"none","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'datearea', chnName: '日期区间', props: {"required":false,"placeholder":"请选择日期区间","options":null,"format":'YYYY-MM-DD',"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'phone', chnName: '电话号码', props: {"required":false,"placeholder":"请填写电话号码","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'attach', chnName: '附件', props: {"required":false,"placeholder":"请上传附件","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'subfrom', chnName: '子表单', props: {"required":false,"placeholder":"子表单","options":[
        {ctrlType: 'text',
          chnName: '单行文本',
          ctrlName: '单行文本',
          extentionProps: {
            required: false,
            placeholder: '请填写文本内容',
            options: null,
            format: null,
            maxLength: 100,
            defaultValue: '',
            rule: '',
            unit: null,
            readonly: false,
          }},
      ],"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'www', chnName: '网址', props: {"required":false,"placeholder":"请填写网址","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'email', chnName: '邮箱', props: {"required":false,"placeholder":"请填写邮箱","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'user', chnName: '人员选择', props: {"required":false,"placeholder":"请人员选择","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'area', chnName: '地区', props: {"required":false,"placeholder":"请填写地区","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { ctrlType: 'applyPerson', chnName: '申请人', props: {"required":false,"placeholder":"请填写申请人","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":true} },
      { ctrlType: 'applyTime', chnName: '申请日期', props: {"required":false,"placeholder":"申请日期","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":true} },
      { ctrlType: 'chooseProject', chnName: '选择项目', props: {"required":false,"placeholder":"请选择项目","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      //{ index:19,ctrlType: 'chooseMaterialTender', chnName: '选择材料招标', props: {"required":false,"placeholder":"请选择材料招标","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      //{ index:20,ctrlType: 'chooseLabourTender', chnName: '选择劳务招标', props: {"required":false,"placeholder":"请选择劳务招标","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { index:21,ctrlType: 'chooseMaterialSupplier', chnName: '选择材料供应商', props: {"required":false,"placeholder":"请选择材料供应商","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { index:21,ctrlType: 'chooseLabourSupplier', chnName: '选择劳务供应商', props: {"required":false,"placeholder":"请选择劳务供应商","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
      { index:22,ctrlType: 'material', chnName: '选择材料分类', props: {"required":false,"placeholder":"请选择材料分类","options":null,"format":null,"maxLength":0,"defaultValue":"","rule":"","unit":null,"readonly":false} },
    ];

    const {form} = this.props;
    const SortableList = ({ items }) => {
      return (
        <Form>
          {items.map((value, index) => (
            <SortableItem key={`item-${index}`} index={index} sortIndex={index} value={value} />
          ))}
        </Form>
      );
    };
    const SortableItem = ({ value, sortIndex }) => (
      <div
        className={sortIndex == this.state.checkboxIndex?Styles.currentControl:null}
        style={{
          position: 'relative',
          marginBottom:'2px',
        }}>
        <Draggable
        key={sortIndex+'select'}
        draggableId={sortIndex+'select'}
        index={sortIndex}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}>
            <div
              onClick={() => {
                this.setState({ checkboxIndex: sortIndex, checkboxValue: value });
              }}
            >
              <ControlView  value={value}/>
              <Icon type="close" onClick={()=>this.onRemove(sortIndex)} theme="outlined" />
            </div>
          </div>
        )}
      </Draggable>

      </div>
    );
    return (
      <PageHeaderLayout>
        <Spin spinning={false}>
          <Card title={'新建审批模板'} bordered={false}
                className={Styles.designForm}
                extra={
                  <div>
                    <Button type="default" style={{margin:'-10px 15px -10px'}} onClick={()=>{
                      this.props.dispatch(
                        routerRedux.push(`/processCenter/ProcessStart`)
                      )
                    }}>取消</Button>
                    <Button type="primary"　 style={{margin:'-10px 0'}} onClick={()=>this.saveFormNode(menu)}>下一步</Button>
                  </div>
                }
          >
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Row>
              <Col span={3}>
                <div className={'setHeight'+' '+`${Styles.menusLeft}`}>
                <h3>可选控件</h3>
                <p>点击或拖拽到预览区</p>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}>
                      {menu.map((item, index) => (
                        <Draggable
                          key={item.ctrlType}
                          draggableId={item.ctrlType}
                          index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}

                              style={getItemLeftStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}>
                              <MenusIcon type={`icon-${item.ctrlType}`}/>
                              {item.chnName}
                              <Tooltip placement="topLeft" title={'添加'+item.chnName+'控件'}>
                                <MenusIcon onClick={()=>this.addCurControl(item)} className={Styles.addCurNode} type={`icon-add`}/>
                              </Tooltip>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                </div>
              </Col>
              <Col span={12} className={'setHeight'+' '+`${Styles.custom}`}>
                <h3>表单编辑区</h3>
                <Droppable droppableId="droppable2">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      className={Styles.eidtArea}
                      style={{height: "calc(100% - 50px)"}}
                      >
                      {this.state.selected.length===0?
                        <div>
                          <img src={require("../../assets/editDefault.png")} alt=""/>
                          <p>将控件拖拽到这里进行编辑</p>
                        </div>:<SortableList items={this.state.selected}/>}
                    </div>
                  )}
                </Droppable>
              </Col>
              <Col span={9}>
                <div className={'setHeight'+' '+`${Styles.rightArea}`}>
                  <BasicSetting data={this.state.basic} form={form}/>
                  <PropertySetting
                    items={menu}
                    selected={this.state.selected}
                    that={this}
                    checkboxIndex={this.state.checkboxIndex}
                    checkboxValue={this.state.checkboxValue}
                    changeState={this.changeState.bind(this)}
                  />
                </div>
              </Col>
            </Row>
          </DragDropContext>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}

