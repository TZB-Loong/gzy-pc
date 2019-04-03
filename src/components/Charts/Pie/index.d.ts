import * as React from 'react';
export interface IPieProps {
  animate?: boolean;
  color?: string;
  height: number;
  hasLegend?: boolean;
  padding?: [number, number, number, number];
  percent?: number;
  data?: Array<{
    x: string | string;
    y: number;
  }>;
  total?: React.ReactNode | number | (() => React.ReactNode | number);
  title?: React.ReactNode;
  tooltip?: boolean;
  valueFormat?: (value: string) => string | React.ReactNode;
  subTitle?: React.ReactNode;
  rightTitle?: React.ReactNode; // 自己加的,自定义右边文本
  clickId: function; // 自己加的click事件
  changeId: function; // 自己加的hover事件
  projectName: string;
}

export default class Pie extends React.Component<IPieProps, any> {}
