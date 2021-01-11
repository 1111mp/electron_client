/*
 * @Author: 张逸凡
 * @Date: 2019-12-16 12:23:00
 * @LastEditTime: 2020-10-23 10:54:14
 * @LastEditors: Please set LastEditors
 * @Description: 系统托盘的菜单选项
 * @FilePath: \electron_client\process\main-process\tray\menuItem.ts
 */
import { MenuItemConstructorOptions } from 'electron';
import { createCusWin } from '../webWin';
import { CUSTOMWIN } from '../../config';

export type RendererMenuClick = (...args: any[]) => void | boolean;

export interface TracyItem {
  id?: string;
  label?: string;
  type?: 'separator';
  click?: RendererMenuClick;
  [k: string]: any;
}

// export interface MenuClick {
//   main?: (...args: any[]) => void;
//   web?: (...args: any[]) => void | boolean;
// }

// function clickHandler(
//   fn: (...args: any[]) => void
// ): (...args: any[]) => void | boolean {
//   const defaultFn: () => void | boolean = () => true;
//   const handler = fn;

//   return handler || defaultFn;
// }

const item = {
  setting: {
    id: 'setting',
    label: '设置',
    click(...args: any[]) {
      createCusWin({
        ...CUSTOMWIN,
      });
    },
  },
  quit: {
    id: 'quit',
    label: '退出应用',
    role: 'quit',
    click(...args: any[]) {
      const { remote } = require('electron');
      remote.app.quit();
    },
  },
};

const tracy: TracyItem[] = [
  item.setting,
  { type: 'separator' }, // 横线
  item.quit,
];

const menuItems: MenuItemConstructorOptions[] = tracy.map((item) => {
  const { label, type, role, click } = item;

  return {
    label,
    type,
    role,
    click,
  };
});

export default menuItems;
