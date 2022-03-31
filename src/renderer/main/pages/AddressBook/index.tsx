import './styles.scss';

import { useState, useCallback } from 'react';
import classNames from 'classnames';
import { AutoSizer, List, ListRowProps } from 'react-virtualized';
import Header from './header';
import Row from './row';

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

const AddressBook: React.ComponentType<Props> = () => {
  const [hidden, setHidden] = useState(true);

  const rowRenderer = useCallback(
    ({ key, index, style }: ListRowProps) => {
      const row = list[index];

      return <Row key={key} row={row} style={style} index={index} />;
    },
    [list]
  );

  const scrollHandler = (val: boolean) => {
    setHidden(val);
  };

  const getRowHeight = useCallback(
    ({ index }: { index: number }) => {
      const row = list.find((item, i: number) => i === index);
      return row?.type ? 30 : 60;
    },
    [list]
  );

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
                rowCount={list.length}
                rowHeight={getRowHeight}
                rowRenderer={rowRenderer}
                style={{ overflow: 'overlay' }}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
};

export default AddressBook;
