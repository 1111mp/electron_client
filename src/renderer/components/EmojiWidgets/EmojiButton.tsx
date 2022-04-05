import './Button.scss';

import { memo, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

import { usePopper } from 'react-popper';
import { EmojiPicker, Props as EmojiPickerProps } from './EmojiPicker';
import { get, noop } from 'lodash';

export type Props = Pick<
  EmojiPickerProps,
  'doSend' | 'onPickEmoji' | 'onSetSkinTone' | 'recentEmojis' | 'skinTone'
>;

export const EmojiButton = memo(({ onPickEmoji }: Props) => {
  const [open, setOpen] = useState(false);

  const [referenceElement, setReferenceElement] =
    useState<HTMLLIElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top-start',
  });

  useEffect(() => {
    if (open) {
      const root = document.querySelector('#destination');

      const handleOutsideClick = (evt: MouseEvent) => {
        evt.stopPropagation();

        if (!root!.contains(evt.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener('click', handleOutsideClick);

      return () => {
        document.removeEventListener('click', handleOutsideClick);
      };
    }

    return noop;
  }, [open, setOpen]);

  // 添加打开 emoji 弹窗的快捷键
  useEffect(() => {
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

  const handleClickButton: React.MouseEventHandler<HTMLLIElement> = (evt) => {
    evt.stopPropagation();
    setOpen(!open);
  };

  // close emoji pop-ups
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      <li
        ref={setReferenceElement}
        className="action-content__emoji"
        onClick={handleClickButton}
      >
        <span className="iconfont iconemoji"></span>
      </li>
      {createPortal(
        open ? (
          <EmojiPicker
            ref={setPopperElement}
            style={{ ...styles.popper, bottom: '12px' }}
            onClose={handleClose}
            onPickEmoji={onPickEmoji}
            {...attributes.popper}
          />
        ) : (
          <></>
        ),
        document.querySelector('#destination')!
      )}
    </>
  );
});
