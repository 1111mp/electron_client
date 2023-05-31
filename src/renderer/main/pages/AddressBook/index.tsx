import './styles.scss';

import { useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import _AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import _List from 'react-virtualized/dist/es/List';
import Header from './header';
import { useTargetStore } from '../../stores';

import type {
  AutoSizerProps,
  ListProps,
  ListRowProps,
} from 'react-virtualized';

const AutoSizer = _AutoSizer as unknown as React.FC<AutoSizerProps>;
const List = _List as unknown as React.FC<ListProps>;

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

export type Props = {};

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

export const Component: React.ComponentType<Props> = observer(() => {
  const [hidden, setHidden] = useState(true);

  const { friends } = useTargetStore('friendsStore');

  const rowRenderer = useMemo(
    () =>
      ({ key, index, style }: ListRowProps) => {
        const { remark, account } = friends[index];
        return (
          <div className="module-row" key={key} style={style}>
            <Avatar size={40} icon={<UserOutlined />} />
            <p className="module-row__name">{remark ? remark : account}</p>
          </div>
        );
      },
    [friends]
  );

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
    </div>
  );
});

Component.displayName = 'AddressBook';
