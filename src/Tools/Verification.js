import { isfalse } from './util_tools';

const pointTwo = data => {
  /**
   * 保留两位小数
   * @param {number}  data  必须 需要进行处理的值
   */

   console.log(data,'--')

  let inputValue = data.replace(/[^\d]+\./g, ''); //除了数字和.（点）以外，其他的字符都替换为空的

  console.log(inputValue,'inputValue')
  if (inputValue != '') {
    inputValue = inputValue.replace(/^0*(0\.|[1-9])/, '$1'); //解决 粘贴不生效
    inputValue = inputValue.replace(/[^\d.]/g, ''); //清除数字和点以外的字符

    inputValue = inputValue.replace(/\.{2,}/g, '.'); //只保留第一个点清除多余的
    inputValue = inputValue
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.'); //不能重复出现点
    inputValue = inputValue.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    if (inputValue.substr(0, 1) == '.') {
      inputValue = ' ';
    }
  /*   if (inputValue.indexof('.') < 0 && inputValue != '') {
      //限制出现 01,02 的问题

      inputValue = parseFloat(inputValue);
    } */
  } else {
    inputValue = ' ';
  }

  return inputValue;
};

const phoneFormat = data => {
  /**
   * 验证手机的格式是否正确 (true时格式正确false时格式错误)
   * @param {number} data 输入的手机号码
   */
  let regex = /^[1][3,4,5,7,8][0-9]{9}$/;

  return regex.test(data);
};

const trim = (str, is_global) => {
  /**
   * 是否去除所有空格
   * @param str
   * @param is_global 如果是g 或者G去除掉所用空格
   * @returns
   */

  var result;
  result = str.replace(/(^\s+)|(\s+$)/g, "");
  if (is_global.toLowerCase() == "g") {
    result = result.replace(/\s/g, "");
  }
  return result;
}

export { pointTwo, phoneFormat ,trim};
