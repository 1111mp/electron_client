import './styles.scss';

import { memo } from 'react';
import classNames from 'classnames';
import { Avatar } from 'antd';
import UserOutlined from '@ant-design/icons/UserOutlined';

type Props = {
  style: React.CSSProperties;
  row: any;
  index: number;
};

const Row: React.ComponentType<Props> = memo(({ style, row, index }) => {
  if (row.type) {
    return (
      <div
        className={classNames('module-row__header', {
          'module-row__header-noborder': index === 0,
        })}
        style={style}
      >
        {row.title}
      </div>
    );
  }
  return (
    <div className="module-row" style={style}>
      <Avatar size={40} icon={<UserOutlined />} />
      <p className="module-row__name">{row.name}</p>
    </div>
  );
});

export default Row;
