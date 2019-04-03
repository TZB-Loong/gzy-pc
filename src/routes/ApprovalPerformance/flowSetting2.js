/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Button, Popover } from 'antd';
// import style from '././workflow/css/jquery-ui-1.8.4.custom.css'
import jQuery from './workflow/js/jquery-1.4.2.min.js';
// import raphael from './workflow/js/raphael-min.js';
// import jQueryUi from './workflow/js/jquery-ui-1.8.4.custom.min.js';
// import myflow from './workflow/js/myflow.js';
// import myflowJpd from './workflow/js/myflow.jpdl3.js';
// import myflowEdit from './workflow/js/myflow.editors.js';

@connect(({ flowSetting2Model, loading }) => ({
  flowSetting2Model,
  loading,
}))
export default class flowSetting2 extends Component {
  state = {};

  componentDidMount() {
    // console.log(this.props);
  }

  componentWillUnmount() {}

  render() {
    const { flowSetting2Model } = this.props;
    return (
      <Card title={flowSetting2Model.data}>
        <div id="myflow" className="ui-droppable" />
      </Card>
    );
  }
}
