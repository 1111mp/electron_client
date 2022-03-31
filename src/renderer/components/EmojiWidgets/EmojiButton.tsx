import './Button.scss';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { Manager, Popper, Reference } from 'react-popper';
import { EmojiPicker, Props as EmojiPickerProps } from './EmojiPicker';
import { get, noop } from 'lodash';

export type Props = Pick<
  EmojiPickerProps,
  'doSend' | 'onPickEmoji' | 'onSetSkinTone' | 'recentEmojis' | 'skinTone'
>;

export const EmojiButton = React.memo(({ onPickEmoji }: Props) => {
  const [open, setOpen] = React.useState(false);
  const [popperRoot, setPopperRoot] = React.useState<HTMLElement | null>(null);

  const handleClickButton = React.useCallback(() => {
    if (popperRoot) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [popperRoot, setOpen]);

  /** 关闭 emoji 弹窗 */
  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  React.useEffect(() => {
    if (open) {
      const root = document.createElement('div');
      setPopperRoot(root);
      document.body.appendChild(root);
      const handleOutsideClick = ({ target }: MouseEvent) => {
        if (!root.contains(target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener('click', handleOutsideClick);

      return () => {
        document.removeEventListener('click', handleOutsideClick);
        document.body.removeChild(root);
        setPopperRoot(null);
      };
    }

    return noop;
  }, [open, setOpen, setPopperRoot]);

  /** 添加打开 emoji 弹窗的快捷键 */
  React.useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const { ctrlKey, key, metaKey, shiftKey } = event;
      const commandKey = get(window, 'platform') === 'darwin' && metaKey;
      const controlKey = get(window, 'platform') !== 'darwin' && ctrlKey;
      const commandOrCtrl = commandKey || controlKey;

      if (commandOrCtrl && shiftKey && (key === 'j' || key === 'J')) {
        event.stopPropagation();
        event.preventDefault();

        setOpen(!open);
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [open, setOpen]);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <li
            ref={ref}
            className="action-content__emoji"
            onClick={handleClickButton}
          >
            <span className={'iconfont iconemoji'}></span>
          </li>
        )}
      </Reference>
      {open && popperRoot
        ? createPortal(
            <Popper placement="top-start">
              {({ ref, style }) => (
                <EmojiPicker
                  ref={ref}
                  style={{ ...style, bottom: '12px' }}
                  onClose={handleClose}
                  onPickEmoji={onPickEmoji}
                />
              )}
            </Popper>,
            popperRoot
          )
        : null}
    </Manager>
  );
});
