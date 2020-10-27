import './header.scss';

import React from 'react';
import BasicComponent from 'components/BasicComponent';
// import { inject, observer } from 'mobx-react';

import { Avatar, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { CUSTOMWIN } from 'app/config';

// @inject((stores: IAnyObject) => ({
//   theme: stores.Setting.theme,
// }))
// @observer
export default class Header extends BasicComponent<IAnyObject> {
  handleClick = () => {
    // this.$openWeb({ ...CUSTOMWIN, url: `/settings?title=设置` });
    this.$send('interface-expansion');
  };

  $render() {
    return (
      <div className="module-roomlist-header">
        <span className="avatar" onClick={this.handleClick}>
          <Avatar size={30} icon={<UserOutlined />} />
        </span>
        <Input
          className="search_input"
          placeholder="搜索"
          size="small"
          allowClear={true}
          prefix={<SearchOutlined />}
        />
      </div>
    );
  }
}

// const Header: React.FC = () => {
//   return (
//     <div className="module-roomlist-header">
//       <Avatar className="avatar" size={30} icon={<UserOutlined />} />
//       <Input
//         className="search_input"
//         placeholder="搜索"
//         size="small"
//         allowClear={true}
//         prefix={<SearchOutlined />}
//       />
//     </div>
//   );
// };

// export default Header;
