/*
 * @Author: 张逸凡
 * @Date: 2019-12-16 12:23:00
 * @LastEditTime: 2019-12-16 14:33:06
 * @LastEditors: Please set LastEditors
 * @Description: 系统托盘的菜单选项
 * @FilePath: \electron_client\app\main-process\tray\menuItem.ts
 */
import { MenuItemConstructorOptions } from 'electron';

export type ClickHandle = (...args: any[]) => void | boolean;

export interface TracyItem {
  id?: string;
  label?: string;
  type?: 'separator',
  click?: ClickHandle
  [k: string]: any;
}

const item = {
  setting: {
    id: 'setting',
    label: '设置',
    click(...args: any[]) {

    }
  },
  quit: {
    id: 'quit',
    label: '退出',
    role: 'quit',
    click(...args: any[]) {
      const { remote } = require('electron');
      remote.app.quit();
    }
  }
};

const tracy: TracyItem[] = [
  item.setting,
  { type: 'separator' },  // 横线
  item.quit,
];

const menuItems: MenuItemConstructorOptions[] = tracy.map(item => {
  const { label, type, role, click } = item;

  return {
    label,
    type,
    role,
    click
  };
});

export default menuItems;
