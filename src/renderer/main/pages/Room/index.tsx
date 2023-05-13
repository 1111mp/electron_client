import './styles.scss';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Drawer } from 'antd';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import { Transmitter } from './transmitter';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import List from 'react-virtualized/dist/es/List';
import {
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized/dist/es/CellMeasurer';
import { Message, Positions } from './Message';
import { ModuleIMCommon } from 'App/renderer/socket/enums';

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true,
});

const Room: React.FC<IAnyObject> = () => {
  const [messages, setMessages] = useState<ModuleIM.Core.MessageBasic[]>([
    {
      id: BigInt(33),
      msgId: '4f4c4924-8807-42be-9390-f5b0133b4051',
      type: ModuleIMCommon.MsgType.Text,
      sender: {
        id: 10007,
        account: '17621398254',
        avatar: null,
        email: null,
        regisTime: 'string',
        updateTime: 'string',
      },
      receiver: 10009,
      content: '在每一个需要使用变量的component组件中都需要单独引引io入index',
      timer: '1678854360721',
    },
    {
      id: BigInt(34),
      msgId: '4f4c4924-8807-42be-9390-f5b0133b4051',
      type: ModuleIMCommon.MsgType.Text,
      sender: {
        id: 10009,
        account: '17601254993',
        avatar: null,
        email: null,
        regisTime: 'string',
        updateTime: 'string',
      },
      receiver: 10007,
      content:
        '在每一个需要使用变量的component组件中都需要单独引引io入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。',
      timer: '1678854360722',
    },
    {
      id: BigInt(38),
      msgId: 'c4ae7b69-702b-4999-97f4-a07c555a4646',
      type: ModuleIMCommon.MsgType.Text,
      sender: {
        id: 10007,
        account: '17621398254',
        avatar: null,
        email: null,
        regisTime: 'string',
        updateTime: 'string',
      },
      receiver: 10009,
      content: 'Hello World.',
      timer: '1683966763244',
    },
    {
      id: BigInt(39),
      msgId: 'bc70ec01-df9b-46de-be22-ab8444a3168a',
      type: ModuleIMCommon.MsgType.Text,
      sender: {
        id: 10007,
        account: '17621398254',
        avatar: null,
        email: null,
        regisTime: 'string',
        updateTime: 'string',
      },
      receiver: 10009,
      content:
        '在每一个需要使用变量的component组件中都需要单独引引io入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。',
      timer: '1683966796148',
    },
    {
      id: BigInt(50),
      msgId: '2980530a-8f72-4454-a600-1fb910ee9fb8',
      type: ModuleIMCommon.MsgType.Image,
      sender: {
        id: 10007,
        account: '17621398254',
        avatar: null,
        email: null,
        regisTime: 'string',
        updateTime: 'string',
      },
      receiver: 10009,
      content:
        'http://touxiangkong.com/uploads/allimg/20203301301/2020/3/Vzuiy2.jpg',
      timer: '1683966885425',
    },
    {
      id: BigInt(40),
      msgId: '2980530a-8f72-4454-a600-1fb910ee9fb8',
      type: ModuleIMCommon.MsgType.Text,
      sender: {
        id: 10007,
        account: '17621398254',
        avatar: null,
        email: null,
        regisTime: 'string',
        updateTime: 'string',
      },
      receiver: 10009,
      content:
        '在每一个需要使用变量的component组件中都需要单独引入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。',
      timer: '1683966885425',
    },
    {
      id: BigInt(41),
      msgId: '3b04e4b2-eb70-4624-b7fb-7ba7a0c01092',
      type: ModuleIMCommon.MsgType.Text,
      sender: {
        id: 10007,
        account: '17621398254',
        avatar: null,
        email: null,
        regisTime: 'string',
        updateTime: 'string',
      },
      receiver: 10009,
      content:
        '在每一个需要使用变量的component组件中都需要单独烦，非常的不人性化。',
      timer: '1683966893762',
    },
  ]);
  const [visible, setVisible] = useState<boolean>(false);

  const { roomId } = useParams();

  console.log(roomId);

  useEffect(() => {
    return () => {
      cache && cache.clearAll();
    };
  }, []);

  useEffect(() => {}, [messages]);

  console.log(cache);

  return (
    <div className="module-room">
      <header className="module-room-header">
        <p className="module-room-header--title">张逸凡</p>
        <Button type="link" size="small" onClick={() => setVisible(true)}>
          <EllipsisOutlined style={{ fontSize: '20px' }} />
        </Button>
      </header>
      <div className="module-room-scroll">
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowCount={messages.length}
              rowHeight={cache.rowHeight}
              deferredMeasurementCache={cache}
              // scrollToIndex={messages.length}
              overscanRowCount={10}
              rowRenderer={({ index, key, style, parent }) => {
                const message = messages[index];

                const previousMessage = messages[index - 1] || {};
                // const nextMessage = messages[index - 1] || {};
                const messageProps = {
                  // ...message,
                  // chatType: 'p2p',
                  currentMessage: message,
                  previousMessage,
                  // nextMessage,
                  position:
                    message.sender.id === 10009
                      ? Positions.Right
                      : Positions.Left,
                };

                return (
                  <CellMeasurer
                    cache={cache}
                    columnIndex={0}
                    key={key}
                    parent={parent}
                    rowIndex={index}
                  >
                    {({ measure, registerChild }) => (
                      // @ts-ignore
                      <div ref={registerChild} style={style}>
                        <Message measure={measure} {...messageProps} />
                      </div>
                    )}
                  </CellMeasurer>
                );
              }}
            />
          )}
        </AutoSizer>
      </div>
      <footer className="module-room--footer">
        <Transmitter onPickEmoji={() => {}} />
      </footer>
      <Drawer
        title="Basic Drawer"
        placement="right"
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
        getContainer={false}
        rootStyle={{ position: 'absolute' }}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  );
};

export default Room;
