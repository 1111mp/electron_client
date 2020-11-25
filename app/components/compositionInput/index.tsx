import './styles.scss';

import * as React from 'react';

import Delta from 'quill-delta';
import ReactQuill from 'react-quill';
import { Manager, Reference } from 'react-popper';
import Quill, { KeyboardStatic, RangeStatic } from 'quill';

import {
  matchEmojiImage,
  matchEmojiBlot,
  matchReactEmoji,
  matchEmojiText,
} from 'components/quill/emoji/matchers';
// import { matchMention } from ''
import {
  BodyRangeType,
  getTextAndMentionsFromOps,
  insertMentionOps,
  insertEmojiOps,
} from 'components/quill/utils';

interface HistoryStatic {
  undo(): void;
  clear(): void;
}

type Props = {
  readonly draftText?: string;
  readonly draftBodyRanges?: Array<BodyRangeType>;
  onDirtyChange?(dirty: boolean): unknown;
  onEditorStateChange?(
    messageText: string,
    bodyRanges: Array<BodyRangeType>,
    caretLocation?: number
  ): unknown;
  onTextTooLong(): unknown;
};

const MAX_LENGTH = 64 * 1024;

export const CompositionInput: React.ComponentType<Props> = (props) => {
  const { draftText, draftBodyRanges } = props;

  const quillRef = React.useRef<Quill>();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const propsRef = React.useRef<Props>(props);

  const generateDelta = (
    text: string,
    bodyRanges: Array<BodyRangeType>
  ): Delta => {
    const initialOps = [{ insert: text }];
    const opsWithMentions = insertMentionOps(initialOps, bodyRanges);
    const opsWithEmojis = insertEmojiOps(opsWithMentions);

    return new Delta(opsWithEmojis);
  };

  const getTextAndMentions = (): [string, Array<BodyRangeType>] => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return ['', []];
    }

    const contents = quill.getContents();

    if (contents === undefined) {
      return ['', []];
    }

    const { ops } = contents;

    if (ops === undefined) {
      return ['', []];
    }

    return getTextAndMentionsFromOps(ops);
  };

  // const onEnter = () => {
  //   const quill = quillRef.current;
  //   const emojiCompletion = emojiCompletionRef.current;
  //   const mentionCompletion = mentionCompletionRef.current;

  //   if (quill === undefined) {
  //     return false;
  //   }

  //   if (emojiCompletion === undefined || mentionCompletion === undefined) {
  //     return false;
  //   }

  //   if (emojiCompletion.results.length) {
  //     emojiCompletion.completeEmoji();
  //     return false;
  //   }

  //   if (mentionCompletion.results.length) {
  //     mentionCompletion.completeMention();
  //     return false;
  //   }

  //   if (propsRef.current.large) {
  //     return true;
  //   }

  //   submit();

  //   return false;
  // };

  const onChange = () => {
    const quill = quillRef.current;

    const [text, mentions] = getTextAndMentions();

    if (quill !== undefined) {
      const historyModule: HistoryStatic = quill.getModule('history');

      if (text.length > MAX_LENGTH) {
        historyModule.undo();
        propsRef.current.onTextTooLong();
        return;
      }

      if (propsRef.current.onEditorStateChange) {
        const selection = quill.getSelection();

        propsRef.current.onEditorStateChange(
          text,
          mentions,
          selection ? selection.index : undefined
        );
      }
    }

    if (propsRef.current.onDirtyChange) {
      propsRef.current.onDirtyChange(text.length > 0);
    }
  };

  const reactQuill = React.useMemo(() => {
    const delta = generateDelta(draftText || '', draftBodyRanges || []);

    return (
      <ReactQuill
        className="module-composition-input__quill"
        onChange={onChange}
        // defaultValue={delta}
        modules={{
          toolbar: false,
        }}
        // modules={{
        //   toolbar: false,
        //   signalClipboard: true,
        //   clipboard: {
        //     matchers: [
        //       ['IMG', matchEmojiImage],
        //       ['IMG', matchEmojiBlot],
        //       ['SPAN', matchReactEmoji],
        //       [Node.TEXT_NODE, matchEmojiText],
        //       ['SPAN', matchMention(memberRepositoryRef)],
        //     ],
        //   },
        //   keyboard: {
        //     bindings: {
        //       onEnter: { key: 13, handler: onEnter }, // 13 = Enter
        //       onShortKeyEnter: {
        //         key: 13, // 13 = Enter
        //         shortKey: true,
        //         handler: onShortKeyEnter,
        //       },
        //       onEscape: { key: 27, handler: onEscape }, // 27 = Escape
        //       onBackspace: { key: 8, handler: onBackspace }, // 8 = Backspace
        //     },
        //   },
        //   emojiCompletion: {
        //     setEmojiPickerElement: setEmojiCompletionElement,
        //     onPickEmoji,
        //     skinTone,
        //   },
        //   mentionCompletion: {
        //     me: members ? members.find((foo) => foo.isMe) : undefined,
        //     memberRepositoryRef,
        //     setMentionPickerElement: setMentionCompletionElement,
        //     i18n,
        //   },
        // }}
        // formats={['emoji', 'mention']}
        placeholder={'sendMessage'}
        // readOnly={disabled}
        // ref={(element) => {
        //   if (element) {
        //     const quill = element.getEditor();
        //     const keyboard = quill.getModule('keyboard') as KeyboardStatic;

        //     // force the tab handler to be prepended, otherwise it won't be
        //     // executed: https://github.com/quilljs/quill/issues/1967
        //     keyboard.bindings[9].unshift({ key: 9, handler: onTab }); // 9 = Tab
        //     // also, remove the default \t insertion binding
        //     keyboard.bindings[9].pop();

        //     // When loading a multi-line message out of a draft, the cursor
        //     // position needs to be pushed to the end of the input manually.
        //     quill.once('editor-change', () => {
        //       const scroller = scrollerRef.current;

        //       if (scroller !== null) {
        //         quill.scrollingContainer = scroller;
        //       }

        //       setTimeout(() => {
        //         quill.setSelection(quill.getLength(), 0);
        //         quill.root.classList.add('ql-editor--loaded');
        //       }, 0);
        //     });

        //     quill.on(
        //       'selection-change',
        //       (newRange: RangeStatic, oldRange: RangeStatic) => {
        //         // If we lose focus, store the last edit point for emoji insertion
        //         if (newRange === null) {
        //           setLastSelectionRange(oldRange);
        //         }
        //       }
        //     );
        //     quillRef.current = quill;
        //     emojiCompletionRef.current = quill.getModule('emojiCompletion');
        //     mentionCompletionRef.current = quill.getModule('mentionCompletion');
        //   }
        // }}
      />
    );
  }, []);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <div className="module-composition-input__input" ref={ref}>
            <div
              ref={scrollerRef}
              className="module-composition-input__input__scroller"
            >
              {reactQuill}
              {/* {emojiCompletionElement}
              {mentionCompletionElement} */}
            </div>
          </div>
        )}
      </Reference>
    </Manager>
  );
};
