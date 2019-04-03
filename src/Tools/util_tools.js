import { Promise } from "rsvp";

const xurlform = function (params) {
  return Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
};

const stopEventPropagate = function (event) {
  //阻止默认时间
  event = event || window.event; //用于IE
  if (event.preventDefault) event.preventDefault(); //标准技术
  if (event.returnValue) event.returnValue = false; //IE
  return false;
};

const url2params = function (urlstr) {
  var u = decodeURIComponent(urlstr);
  // console.log(u.slice( u.indexOf('?')+1),'u')
  u = u.slice(u.indexOf('?') + 1);
  var args = {};
  var item = null;
  u.split('&').map(itm => {
    item = itm.split('=');
    args[item[0] ? item[0] : ''] = item[1] ? decodeURIComponent(item[1]) : '';
  });
  delete args[''];
  return args;
};

const isfalse = function (param) {
  //判断某个对象里面是否为空（数组，对象里面的值{应该将函数排除在外}）
  let r = ['', undefined, null, false].indexOf(param) >= 0;
  if (r === false) {
    if (param.length === 0) {
      // if (typeof param=='function'){
      //     r = false;
      // }
      // else if  ( param.length === 0 ){
      r = true;
    } else if (param.construtor) {
      r = Object.keys(param).length === 0;
    } else if (typeof param == 'object') {
      r = Object.keys(param).length === 0;
    }
  }
  return r;
};

const getSearch = (url, key) => {
  let val = null;
  let lastIndexQ = url.lastIndexOf('?');
  if (lastIndexQ > 0) {
    let str = url.substr(lastIndexQ + 1);
    let strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      if (strs[i].split('=')[0] == key) {
        val = unescape(strs[i].split('=')[1]);
      }
    }
  }
  return val;

}

const getSearchAll = (key) => {
  //截取url上携带的参数并组成数组
  let val = null;
  let url = window.location.href;
  let lastIndexQ = url.lastIndexOf('?');
  if (lastIndexQ > 0) {
    let str = url.substr(lastIndexQ + 1);
    let strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      if (strs[i].split('=')[0] == key) {
        val = unescape(strs[i].split('=')[1]);
      } else {
        val = strs;
      }
    }
  }
  return val;
};

const test = (num) => {
  return new Promise(function (resolve, reject) {
    if (typeof num == 'number') {
      resolve();
    } else {
      reject()
    }
  }).then(() => {
    console.log('参数是一个nubmer的值')
  }).catch(() => {
    console.log('参数不是一个number的值')
  })
}

const IsURL = (str_url) => {
  var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
    + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?"
    + "(([0-9]{1,3}\.){3}[0-9]{1,3}"
    + "|"
    + "([0-9a-z_!~*'()-]+\.)*"
    + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\."
    + "[a-z]{2,6})"
    + "(:[0-9]{1,4})?"
    + "((/?)|"
    + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  var re = new RegExp(strRegex);
  if (re.test(str_url)) {
    return (true);
  } else {
    return (false);
  }
}



const currentTime = YHMS => {
  //获取当前时间 以2018-04-02 的形式输出

  /**
   * |参数|说明|是否必须
   * |YHMS|Y:输出时间为年月日
   *       YH:输出时间为年月日时
   *       YHS:输出时间为年月日时分秒  | 不是必须
   * 默认输出时间为年月日
   */
  var date = new Date();
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  if (YHMS == 'Y') {
    return Y + M + D;
  }
  if (YHMS == 'YH') {
    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    return Y + M + D + ' ' + h + ':00';
  }
  if (YHMS == 'YHM') {
    var h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

    return Y + M + D + ' ' + h + m;
  }
  if (YHMS == 'YHMS') {
    var h = date.getDate() < 10 ? '0' + date.getDate() + ':' : date.getHours() + ':';
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':';
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + ' ' + h + m + s;
  }
  if (YHMS == 'YHM2') {
    var h =
      date.getHours() + 2 < 10 ? '0' + (date.getHours() + 2) + ':' : date.getHours() + 2 + ':';
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

    return Y + M + D + ' ' + h + m;
  }

  return Y + M + D;
};

const timestampToTime = (timestamp, HMS) => {
  //时间戳转换为时间格式
  /** 参数格式说明
   * |参数名称|参数类型|参数说明|是否必须
   * |timestamp|string或者number|时间戳或者时间格式|是
   * |HMS|string|返回的时间格式{
   *                              underfind:返回 年-月-日
   *                              HMS:返回 年-月-日  时:分:秒
   *                              HM:返回 年-月-日  时:分
   *                              H: 返回 年-月-日  时
   *                          }   |否
   */
  if (typeof timestamp == 'string') {
    //兼容ios

    timestamp = timestamp.replace(/\-/g, '/');
  }
  if (timestamp == null) {
    return '';
  }

  var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate() + ' ';
  if (HMS == 'HMS') {
    //返回年月日,时分秒
    var h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':';
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + ' ' + h + m + s;
  }
  if (HMS == 'HM') {
    //返回年月日,时分
    var h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return Y + M + D + ' ' + h + m;
  }
  if (HMS == 'H') {
    //返回年月日,时
    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    return Y + M + D + ' ' + h + ':00';
  }

  return Y + M + D; //只返回年月日
};

const timeToTimestamp = data => {
  //时间转换为时间戳
  if (typeof data == 'string') {
    //兼容ios

    data = data.replace(/\-/g, '/');
  }
  return Date.parse(data);
};

const twoBits = data => {
  //保留两位小数

  let inputValue = data.replace(/[^\d]+\./g, ''); //除了数字和.（点）以外，其他的字符都替换为空的

  if (inputValue != '') {
    inputValue = inputValue.replace(/^0*(0\.|[1-9])/, '$1'); //解决 粘贴不生效
    inputValue = inputValue.replace(/[^\d.]/g, ''); //清除数字和点以外的字符

    inputValue = inputValue.replace(/\.{2,}/g, '.'); //只保留第一个点清除多余的
    inputValue = inputValue
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');
    inputValue = inputValue.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    if (inputValue.substr(0, 1) == '.') {
      inputValue = ' ';
    }
  } else {
    inputValue = ' ';
  }

  return inputValue;
};

const calcSize = ratio => {
  //计算图片高度
  let domWidth = document.querySelector('body').clientWidth;
  let calcHeight = domWidth * ratio;
  return calcHeight;
};

const swapItems = (arr, index1, index2) => {
  //数组元素互换
  /**
   * @param {array} arr 操作的数组
   * @param {string||number} index1 选中元素的index
   * @param {string||number} index2 移动到的下一个位置
   */

  arr[index1] = arr.splice(index2, 1, arr[index1])[0];
  return arr;
};

const bubbleSort = arr => {
  //冒泡排序(字段自定义管理)

  for (var i = 0; i < arr.length - 1; i++) {
    //从小到大进行排序
    for (var j = 0; j < arr.length - i - 1; j++) {
      if (arr[j].sort > arr[j + 1]) {
        var hand = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = hand;
      }
    }
  }

  return arr;
};

const pick = (obj, arr) => {
  //在一个对象里面跳出一部分属性,形成新的对象
  /**
   * @param {object} obj 原对象
   * @param {array} arr  要跳出的属性名
   */

  return arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});
};

const dateDiff = (date1, date2) => {
  /**
   * 计算开始时间到结束时间之间的时间差  单位是天
   *
   * @param {Date} date1 开始时间  格式为2002-12-18
   * @param {Date} date2 结束时间  格式为2002-12-18
   */
  var date1Str = date1.split('-'); //将日期字符串分隔为数组,数组元素分别为年.月.日
  //根据年 . 月 . 日的值创建Date对象
  var date1Obj = new Date(date1Str[0], date1Str[1] - 1, date1Str[2]);
  var date2Str = date2.split('-');
  var date2Obj = new Date(date2Str[0], date2Str[1] - 1, date2Str[2]);
  var t1 = date1Obj.getTime();
  var t2 = date2Obj.getTime();
  var dateTime = 1000 * 60 * 60 * 24; //每一天的毫秒数
  var minusDays = Math.floor((t2 - t1) / dateTime); //计算出两个日期的天数差
  var days = Math.abs(minusDays); //取绝对值
  return days;
};

const isJSON = (str) => { //利用try 与catch来判断是否为JSON字符串
  if (typeof str == "string") {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
};


export {
  xurlform,
  calcSize,
  url2params,
  isfalse,
  stopEventPropagate,
  currentTime,
  timestampToTime,
  timeToTimestamp,
  getSearch,
  twoBits,
  swapItems,
  bubbleSort,
  pick,
  dateDiff,
  isJSON,
  test,
  IsURL
};
