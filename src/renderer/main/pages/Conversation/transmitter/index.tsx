import './styles.scss';

import { memo, useEffect, useCallback, useRef } from 'react';

import { InputApi, CompositionInput } from 'Components/CompositionInput';
import {
  EmojiButton,
  Props as EmojiButtonProps,
} from 'Components/EmojiWidgets/EmojiButton';
import { EmojiPickDataType } from 'Components/EmojiWidgets/EmojiPicker';

type Props = {};

export const Transmitter: React.ComponentType<Props> = memo(({}) => {
  // const editorRef = React.useRef<Editor>(null);
  const inputApiRef = useRef<InputApi | undefined>();

  const focusInput = useCallback(() => {
    if (inputApiRef.current) {
      inputApiRef.current.focus();
    }
  }, [inputApiRef]);

  const insertEmoji = useCallback(
    (e: EmojiPickDataType) => {
      if (inputApiRef.current) {
        inputApiRef.current.insertEmoji(e);
        // onPickEmoji(e);
      }
    },
    [inputApiRef]
  );

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  return (
    <div className="module-transmitter">
      <ul className="module-transmitter-actions">
        <EmojiButton onPickEmoji={insertEmoji} />
        <li className="module-transmitter-actions-content">
          <span className="iconfont iconwenjian"></span>
        </li>
      </ul>
      <div className="module-transmitter-textarea">
        <CompositionInput
          // editorRef={editorRef}
          inputApi={inputApiRef}
          // draftText={draftText}
          // draftBodyRanges={draftBodyRanges}
          // startingText={''}
          // onPickEmoji={onPickEmoji}
          onSubmit={(content, mentions) => {
            console.log(content);
            console.log(mentions);
          }}
        />
      </div>
    </div>
  );
});
