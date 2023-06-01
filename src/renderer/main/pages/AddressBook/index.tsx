import './styles.scss';

import { useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import _AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import _List from 'react-virtualized/dist/es/List';
import { Header } from './Header';
import { Concat } from './Concat';

import { useTargetStore } from '../../stores';

import type {
  AutoSizerProps,
  ListProps,
  ListRowProps,
} from 'react-virtualized';

const AutoSizer = _AutoSizer as unknown as React.FC<AutoSizerProps>;
const List = _List as unknown as React.FC<ListProps>;

const list = [
  { type: 'header', title: 'A' },
  { name: 'a1' },
  { name: 'a2' },
  { name: 'a3' },
  { name: 'a4' },
  { name: 'a5' },
  { name: 'a6' },
  { name: 'a7' },
  { type: 'header', title: 'B' },
  { name: 'b1' },
  { name: 'b2' },
  { name: 'b3' },
  { name: 'b4' },
  { name: 'b5' },
  { type: 'header', title: 'C' },
  { name: 'c1' },
  { name: 'c2' },
  { name: 'c3' },
  { name: 'c4' },
  { name: 'c5' },
];

export const Component: React.FC = observer(() => {
  const [hidden, setHidden] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();

  const { friends } = useTargetStore('friendsStore');

  const rowRenderer = useMemo(
    () =>
      ({ key, index, style }: ListRowProps) => {
        const { id, remark, account } = friends[index];
        return (
          <div
            className={classNames('module-row', {
              'module-row__active': id === userId,
            })}
            key={key}
            style={style}
            onClick={() => {
              setUserId(id);
            }}
          >
            <Avatar size={40} icon={<UserOutlined />} />
            <p className="module-row__name">{remark ? remark : account}</p>
          </div>
        );
      },
    [friends, userId]
  );

  const info = useMemo(() => {
    return friends.find(({ id }) => id === userId);
  }, [friends, userId]);

  const scrollHandler = (val: boolean) => {
    setHidden(val);
  };

  // const getRowHeight = useCallback(
  //   ({ index }: { index: number }) => {
  //     const row = list.find((item, i: number) => i === index);
  //     return row?.type ? 30 : 60;
  //   },
  //   [list]
  // );

  return (
    <div className="module-addressbook">
      <div
        className="module-addressbook-list"
        onMouseEnter={() => scrollHandler(false)}
        onMouseLeave={() => scrollHandler(true)}
      >
        <header className="module-addressbook-list__header">
          <Header />
        </header>
        <div className="module-addressbook-list__content">
          <AutoSizer>
            {({ width, height }) => (
              <List
                className={classNames({
                  'ReactVirtualized__List-hidden': hidden,
                })}
                height={height}
                rowCount={friends.length}
                rowHeight={60}
                rowRenderer={rowRenderer}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      </div>
      <div className="module-addressbook-container">
        <p className="module-addressbook-placeholder"></p>
        <Concat info={info} />
      </div>
    </div>
  );
});

Component.displayName = 'AddressBook';
