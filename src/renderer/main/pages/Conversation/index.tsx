import './styles.scss';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import { useImmer } from 'use-immer';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Drawer } from 'antd';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import { Transmitter } from './transmitter';
import _AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import _List from 'react-virtualized/dist/es/List';
import {
  CellMeasurer as _CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized/dist/es/CellMeasurer';
import { Message, Positions } from './Message';

import { v4 as uuidv4 } from 'uuid';
import { useTargetStore } from '../../stores';
import { useEventCallback } from 'App/renderer/utils/hooks';
import { ModuleIMCommon } from 'App/renderer/socket/enums';

import type { LoaderFunctionArgs } from 'react-router-dom';
import type {
  AutoSizerProps,
  ListProps,
  CellMeasurerProps,
} from 'react-virtualized';
import type { Props as TransmitterProps } from './transmitter';

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true,
});

const AutoSizer = _AutoSizer as unknown as React.FC<AutoSizerProps>;
const List = _List as unknown as React.FC<ListProps>;
const CellMeasurer = _CellMeasurer as unknown as React.FC<CellMeasurerProps>;

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) throw new Error('Expected params.id');
  const { userId } = window.Context.getUserInfo();

  const messages = await window.Context.sqlClient.getMessagesBySender({
    userId,
    receiver: parseInt(params.id),
    pageNum: 1,
    pageSize: 15,
  });

  // @ts-ignore
  return messages.toReversed();
}

// [
//   {
//     id: BigInt(33),
//     msgId: '4f4c4924-8807-42be-9390-f5b0133b4051',
//     type: ModuleIMCommon.MsgType.Text,
//     sender: 10007,
//     senderInfo: {
//       id: 10007,
//       account: '17621398254',
//       avatar: null,
//       email: null,
//       regisTime: 'string',
//       updateTime: 'string',
//     },
//     receiver: 10009,
//     content: `
//     \u{231A}: ⌚ default 😀 emoji presentation character (Emoji_Presentation)
//     \u{2194}\u{FE0F}: ↔️ default text presentation character rendered as emoji
//     \u{1F469}: 👩 emoji modifier base (Emoji_Modifier_Base)
//     \u{1F469}\u{1F3FF}: 👩🏿 emoji modifier base followed by a modifier
//     `,
//     timer: 1678854360721,
//   },
//   {
//     id: BigInt(34),
//     msgId: '4f4c4924-8807-42be-9390-f5b0133b4051',
//     type: ModuleIMCommon.MsgType.Text,
//     sender: 10007,
//     senderInfo: {
//       id: 10009,
//       account: '17601254993',
//       avatar: null,
//       email: null,
//       regisTime: 'string',
//       updateTime: 'string',
//     },
//     receiver: 10007,
//     content:
//       '在每一个需要使用变量的component组件中都需要😀单独引引io入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。',
//     timer: 1678854360722,
//   },
//   {
//     id: BigInt(38),
//     msgId: 'c4ae7b69-702b-4999-97f4-a07c555a4646',
//     type: ModuleIMCommon.MsgType.Text,
//     sender: 10007,
//     senderInfo: {
//       id: 10007,
//       account: '17621398254',
//       avatar: null,
//       email: null,
//       regisTime: 'string',
//       updateTime: 'string',
//     },
//     receiver: 10009,
//     content: 'Hello World.',
//     timer: 1683966763244,
//   },
//   {
//     id: BigInt(39),
//     msgId: 'bc70ec01-df9b-46de-be22-ab8444a3168a',
//     type: ModuleIMCommon.MsgType.Text,
//     sender: 10007,
//     senderInfo: {
//       id: 10007,
//       account: '17621398254',
//       avatar: null,
//       email: null,
//       regisTime: 'string',
//       updateTime: 'string',
//     },
//     receiver: 10009,
//     content:
//       '在每一个需要使用变量的component组件中都需要单独引引io入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。',
//     timer: 1683966796148,
//   },
//   {
//     id: BigInt(50),
//     msgId: '2980530a-8f72-4454-a600-1fb910ee9fb8',
//     type: ModuleIMCommon.MsgType.Image,
//     sender: 10007,
//     senderInfo: {
//       id: 10007,
//       account: '17621398254',
//       avatar: null,
//       email: null,
//       regisTime: 'string',
//       updateTime: 'string',
//     },
//     receiver: 10009,
//     content:
//       'http://touxiangkong.com/uploads/allimg/20203301301/2020/3/Vzuiy2.jpg',
//     timer: 1683966885425,
//   },
//   {
//     id: BigInt(40),
//     msgId: '2980530a-8f72-4454-a600-1fb910ee9fb8',
//     type: ModuleIMCommon.MsgType.Text,
//     sender: 10007,
//     senderInfo: {
//       id: 10007,
//       account: '17621398254',
//       avatar: null,
//       email: null,
//       regisTime: 'string',
//       updateTime: 'string',
//     },
//     receiver: 10009,
//     content:
//       '在每一个需要使用变量的component组件中都需要单独引入index.styl文件，不仅进行了多次重复性的操作，而且文件名称一旦发生改变，维护更新非常麻烦，非常的不人性化。',
//     timer: 1683966885425,
//   },
//   {
//     id: BigInt(41),
//     msgId: '3b04e4b2-eb70-4624-b7fb-7ba7a0c01092',
//     type: ModuleIMCommon.MsgType.Text,
//     sender: 10007,
//     senderInfo: {
//       id: 10007,
//       account: '17621398254',
//       avatar: null,
//       email: null,
//       regisTime: 'string',
//       updateTime: 'string',
//     },
//     receiver: 10009,
//     content:
//       '在每一个需要使用变量的component组件中都需要单独烦，非常的不人性化。',
//     timer: 1683966893762,
//   },
// ]

export const Conversation: React.FC<IAnyObject> = observer(() => {
  const msgs = useLoaderData() as ModuleIM.Core.MessageBasic[];

  const [messages, updateMessages] = useImmer<ModuleIM.Core.MessageBasic[]>(
    () => msgs,
  );
  const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(
    () => msgs.length - 1,
  );
  const [visible, setVisible] = useState<boolean>(false);

  const { id } = useParams();
  const { user } = useTargetStore('userStore');
  const { getActivedConversation, updateLastRead } =
    useTargetStore('conversationStore');
  const { sendMesssage } = useTargetStore('conversationStore');

  const conversation = computed(() =>
    getActivedConversation(parseInt(id!)),
  ).get()!;

  // console.log(conversation);

  useEffect(() => {
    return () => {
      cache && cache.clearAll();
    };
  }, []);

  useEffect(() => {
    if (!conversation || !msgs.length) return;
    const { id } = msgs[msgs.length - 1];
    if (conversation.lastReadAck === id) return;
    updateLastRead(conversation.id, id!);
  }, []);

  const rowRenderer: ListProps['rowRenderer'] = useMemo(
    () =>
      ({ index, key, style, parent }) => {
        const message = messages[index];
        const previousMessage = messages[index - 1] || {};
        const messageProps = {
          currentMessage: message,
          previousMessage,
          position:
            message.sender === user.userId ? Positions.Right : Positions.Left,
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
      },
    [messages],
  );

  const onSend: TransmitterProps['onSend'] = useEventCallback(
    (content, bodys) => {
      if (!content) return;
      console.log(content);
      console.log(bodys);
      const { groupId, sender } = conversation;
      if (!groupId) {
        // p2p message
        const message = {
          msgId: uuidv4(),
          type: ModuleIMCommon.MsgType.Text,
          sender: user.userId,
          receiver: sender,
          content,
          loading: true,
          timer: Date.now(),
        };

        updateMessages((draft) => {
          draft.push(message);
          scrollTo(draft.length - 1);
        });

        // cache to db
        // window.Context.sqlClient.setMessage(user.userId, message);

        // sendMesssage(message).then((res) => {
        //   console.log(res);
        // });
        return;
      }

      // group message
    },
  );

  const updateMessagsStatus = (msgId: string) => {
    updateMessages((draft) => {
      
    });
  };

  const scrollTo = (index: number) => {
    setScrollToIndex(index);

    setTimeout(() => {
      setScrollToIndex(undefined);
    }, 300);
  };

  const title: string = useMemo(() => {
    if (!conversation) return '';

    const { groupId, info } = conversation;
    if (groupId) {
      const { name } = info as ModuleIM.Core.GroupBasic;
      return name;
    }

    const { remark, account } = info as DB.UserWithFriendSetting;
    return remark ? remark : account;
  }, [conversation]);

  return (
    <div className="module-room">
      <header className="module-room-header">
        <p className="module-room-header--title">{title}</p>
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
              sc
              scrollToIndex={scrollToIndex}
              overscanRowCount={10}
              rowRenderer={rowRenderer}
            />
          )}
        </AutoSizer>
      </div>
      <footer className="module-room--footer">
        <Transmitter onSend={onSend} />
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
});
