/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, Button, Modal, Transfer, Menu, Dropdown } from 'antd';
import { swapItems } from '../../Tools/util_tools';
import styles from './style.less';
import { Link } from 'dva/router';
import { isfalse, bubbleSort } from '../../Tools/util_tools';

/**params 参数说明
 *
 * @param {function} request  父组件重新请求数据的函数
 */

@connect(({ loading }) => ({
  loading,
}))
class Setup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], //数据源(未处理(所有的)))
      mockData: [], //数据源(处理过的)
      targetKeys: [], //右边显示的数据key的集合
      selectedKeys: [], //已选中的集合(左右都在)
      rightSelected: [], // 右边选中的集合
      hintText: '', //当右侧列表提示文字的显示
    };
  }

  componentDidMount() {
    this.bizObjectListSettingShow(); //需要显示的字段
  }
  componentWillUnmount() {
    clearInterval(this.setDelay);
  }

  bizObjectListSettingShow = () => {
    //右侧列表显示
    const { materialSupplier } = this.props;
    const targetKeys = [];

    if (!isfalse(materialSupplier.bizObjectListSettingShow)) {
      let rightData = materialSupplier.bizObjectListSettingShow.data.showFields;
      rightData = bubbleSort(rightData);
      for (var k in rightData) {
        targetKeys.push(rightData[k].ctrlName);
      }
      this.setState(
        {
          targetKeys: targetKeys,
        },
        () => this.getMock()
      );
    }
  };

  getMock = () => {
    //穿梭框的数据

    let hideFields = this.props.materialSupplier.bizObjectListSettingShow.data.hideFields;
    let showFields = this.props.materialSupplier.bizObjectListSettingShow.data.showFields;
    let data = hideFields.concat(showFields);

    const mockData = []; //左边边框要显示的字段

    for (let i in data) {
      const sveData = {
        key: data[i].ctrlName,
        title: data[i].chnName,
        description: data[i].chnName,
      };
      mockData.push(sveData);
    }

    this.setState({ mockData, dataSource: data });
  };

  setDelay = () => {
    //设置延迟
    setTimeout(() => {
      this.setState({
        hintText: '',
      });
    }, 1500);
  };

  handleChange = (targetKeys, direction, moveKeys) => {
    //取消选择
    /**
     * @param {array} targetKeys 右侧框的key值集合
     * @param {string} direction  此次操作是移到左边去还是右边去
     * @param {string} moveKeys   移动的数据key值集合
     */

    let newSelectKeys = [];
    let newtargetKeys = targetKeys;
    let dataSource = this.state.dataSource;

    if (direction == 'right') {
      //向右边移动
      newtargetKeys.push(newtargetKeys[0]);
      newtargetKeys.splice(0, 1);

      if (this.state.selectedKeys.length > 1) {
        newSelectKeys.push(this.state.selectedKeys[1]);
      }
    } else {
      //向左边移动

      if (targetKeys.length < 7) {
        //右侧的列表长度小于7
        this.setState(
          {
            hintText: '(该列表不得少于7项)',
          },
          () => this.setDelay()
        );
        newtargetKeys = this.state.targetKeys; //保持原来的数据不动
      } else {
        for (var i in dataSource) {
          //该项允许向左侧移动时
          if (dataSource[i].ctrlName == moveKeys) {
            if (dataSource[i].isFiexed) {
              this.setState(
                {
                  hintText: '(该项必须存在)',
                },
                () => this.setDelay()
              );
              newtargetKeys = this.state.targetKeys; //保持原来的数据不动
            }
          }
        }
      }
      if (this.state.selectedKeys.length > 1) {
        newSelectKeys.push(this.state.selectedKeys[0]);
      }
    }

    this.setState({
      targetKeys: newtargetKeys,
      selectedKeys: newSelectKeys,
      rightSelected: this.state.rightSelected,
    });
  };

  onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    /***
     * @param {array} sourceSelectedKeys 左边选中的数组
     * @param {array} targetSelectedKeys 右边选中的数组
     */

    let _this = this;
    let lefKeys = sourceSelectedKeys[sourceSelectedKeys.length - 1];
    let rightKeys = targetSelectedKeys[targetSelectedKeys.length - 1];

    if (sourceSelectedKeys.length - 1 >= 0 && targetSelectedKeys.length - 1 >= 0) {
      _this.setState({
        selectedKeys: [lefKeys, rightKeys],
      });
    } else if (sourceSelectedKeys.length - 1 < 0) {
      _this.setState({
        selectedKeys: [rightKeys],
      });
    } else if (targetSelectedKeys.length - 1 < 0) {
      _this.setState({
        selectedKeys: [lefKeys],
      });
    }
    if (sourceSelectedKeys.length - 1 < 0 && targetSelectedKeys.length - 1 < 0) {
      _this.setState({
        selectedKeys: [],
      });
    }

    _this.setState({
      //操作右边列表的数据
      rightSelected: [rightKeys],
    });
  };

  moveDown = () => {
    //右边数据下移

    console.log(this.state.rightSelected, '---');

    let index = this.state.targetKeys.indexOf(this.state.rightSelected[0]);

    if (index == this.state.targetKeys.length - 1 || index < 0) {
      return;
    }
    let newArr = swapItems(this.state.targetKeys, index, index + 1);
    this.setState(
      {
        targetKeys: newArr,
      },
      () => this.getMock()
    );
  };

  moveUp = () => {
    //左边数据上移

    let index = this.state.targetKeys.indexOf(this.state.rightSelected[0]);
    if (index == 0 || index < 0) {
      return;
    }
    let newArr = swapItems(this.state.targetKeys, index, index - 1);

    this.setState(
      {
        targetKeys: newArr,
      },
      () => this.getMock()
    );
  };

  renderItem = item => {
    //每一行渲染的节点
    const customLabel = <span className="custom-item">{item.title}</span>;

    return {
      label: customLabel, // for displayed item
      value: item.title, // for title and filter matching
    };
  };

  showModal = () => {
    //对话框的显示
    this.setState({
      visible: true,
    });
  };

  saveBizObjectList = data => {
    //保存修改后的字段
    const { materialSupplier } = this.props;
    let targetKeys = this.state.targetKeys;
    let dataSource = this.state.dataSource;
    let bodyData = [];

    for (var i in targetKeys) {
      for (var j in dataSource) {
        //重组需要提交的数据
        if (dataSource[j].ctrlName == targetKeys[i]) {
          // console.log(dataSource[j],'dataSource[j]')
          bodyData.push({
            allowFilter: isfalse(dataSource[j].allowFilter) ? false : dataSource[j].allowFilter,
            allowSort:
              dataSource[j].corpId == -1
                ? isfalse(dataSource[j].allowSort)
                  ? false
                  : dataSource[j].allowSort
                : false,
            chnName: dataSource[j].chnName,
            sort: i * 1 + 1,
            width: isfalse(dataSource[j].width) ? '' : dataSource[j].width,
            ctrlName: dataSource[j].ctrlName,
            isFiexed: isfalse(dataSource[j].isFiexed) ? false : dataSource[j].isFiexed,
            referedDicKey: isfalse(dataSource[j].referedDicKey) ? '' : dataSource[j].referedDicKey,
            // display: isfalse(dataSource[j].display) ? '' : dataSource[j].display,
            // options: isfalse(dataSource[j].options) ? '' : dataSource[j].options,
            fieldType: isfalse(dataSource[j].fieldType) ? '' : dataSource[j].fieldType,
            required: isfalse(dataSource[j].required) ? '' : dataSource[j].required,
            corpId: dataSource[j].corpId,
          });
        }
      }
    }

    let headerData = {
      bizId: data,
      id: isfalse(materialSupplier.bizObjectListSettingShow.data.bizObjectListSetting)
        ? null
        : materialSupplier.bizObjectListSettingShow.data.bizObjectListSetting.id,
      fieldSetting: JSON.stringify(bodyData),
      listCode: materialSupplier.listCode,
    };
    // console.log(headerData,'headerData')

    this.props.onOk(headerData);
    this.props.visibleChange(false);
    this.setState({
      selectedKeys: [],
    });
  };

  handleCancel = e => {
    //对话框的取消按钮(两个弹出框共用)

    this.props.visibleChange(false);
  };
  render() {
    let _this = this;
    const { materialSupplier } = this.props;

    return (
      <div>
        <Modal
          title={<span>编辑显示字段</span>}
          visible={this.props.visible}
          onOk={this.saveBizObjectList.bind(this, materialSupplier.bizId)}
          onCancel={this.handleCancel}
          width={600}
        >
          <div style={{ display: 'flex' }}>
            <Transfer
              dataSource={this.state.mockData}
              className={styles.span_label}
              listStyle={{
                width: 200,
                height: 300,
              }}
              targetKeys={this.state.targetKeys}
              onChange={this.handleChange}
              render={this.renderItem}
              onSelectChange={this.onSelectChange}
              selectedKeys={this.state.selectedKeys}
              titles={[
                '隐藏字段',
                <span> {isfalse(_this.state.hintText)?'显示字段':<span style={{color:'red'}}>{_this.state.hintText}</span>}</span>,
              ]}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button onClick={this.moveUp}><Icon type="arrow-up" theme="outlined" /></Button>
              <Button onClick={this.moveDown}><Icon type="arrow-down" theme="outlined" /></Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
export default Setup;
