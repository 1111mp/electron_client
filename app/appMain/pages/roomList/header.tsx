import './header.scss';

import React from 'react';
import BasicComponent from 'components/BasicComponent';

import { Avatar, Input } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

export default class Header extends BasicComponent<IAnyObject> {
  handleClick = () => {
    this.$confirm('sdasasdasdas').then(
      () => {
        console.log('确认');
      },
      () => {
        console.log('取消')
      }
    );
    // this.$openBrowser('https://www.baidu.com');
  };

  $render() {
    return (
      <div className="module-roomlist-header">
        <span onClick={this.handleClick}>
          <Avatar className="avatar" size={30} icon={<UserOutlined />} />
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
