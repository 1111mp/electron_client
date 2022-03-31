import './styles.scss';

import { useState, useEffect, useMemo, useRef } from 'react';

import Quill, { KeyboardStatic, RangeStatic, DeltaStatic } from 'quill';
import Delta from 'quill-delta';
import ReactQuill from 'react-quill';
import { Manager, Reference } from 'react-popper';

import { EmojiBlot, EmojiCompletion } from 'Components/Quill/emoji';
import {
  matchEmojiImage,
  matchEmojiBlot,
  matchReactEmoji,
  matchEmojiText,
} from 'Components/Quill/emoji/matchers';
import { MentionCompletion } from 'Components/Quill/mentions/completion';
import { EmojiPickDataType } from 'Components/EmojiWidgets/EmojiPicker';
import { MentionBlot } from 'Components/Quill/mentions/blot';
import { matchMention } from 'Components/Quill/mentions/matchers';
import {
  MemberRepository,
  ConversationType,
} from 'Components/Quill/memberRepository';
import {
  BodyRangeType,
  getTextAndMentionsFromOps,
  insertMentionOps,
  insertEmojiOps,
  isMentionBlot,
  getDeltaToRestartMention,
  getDeltaToRemoveStaleMentions,
} from 'Components/Quill/utils';
import { convertShortName } from 'Components/EmojiWidgets/lib';
import { SignalClipboard } from 'Components/Quill/signal-clipboard';
import { useI18n } from 'Renderer/utils/i18n';

Quill.register('formats/emoji', EmojiBlot);
Quill.register('formats/mention', MentionBlot);
Quill.register('modules/emojiCompletion', EmojiCompletion);
Quill.register('modules/mentionCompletion', MentionCompletion);
Quill.register('modules/signalClipboard', SignalClipboard);

const Block = Quill.import('blots/block');
Block.tagName = 'DIV';
Quill.register(Block, true);

interface HistoryStatic {
  undo(): void;
  clear(): void;
}

export interface InputApi {
  focus: () => void;
  insertEmoji: (e: EmojiPickDataType) => void;
  reset: () => void;
  resetEmojiResults: () => void;
  submit: () => void;
}

type Props = {
  readonly disabled?: boolean;
  readonly inputApi?: React.MutableRefObject<InputApi | undefined>;
  readonly skinTone?: EmojiPickDataType['skinTone'];
  readonly draftText?: string;
  readonly draftBodyRanges?: Array<BodyRangeType>;
  members?: Array<any>;
  onDirtyChange?(dirty: boolean): unknown;
  onEditorStateChange?(
    messageText: string,
    bodyRanges: Array<BodyRangeType>,
    caretLocation?: number
  ): unknown;
  onTextTooLong(): unknown;
  onPickEmoji(o: EmojiPickDataType): unknown;
  onSubmit(message: string, mentions: Array<BodyRangeType>): unknown;
  getQuotedMessage(): unknown;
  clearQuotedMessage(): unknown;
};

const MAX_LENGTH = 64 * 1024;

export const CompositionInput: React.ComponentType<Props> = (props) => {
  const {
    disabled,
    inputApi,
    onPickEmoji,
    onSubmit,
    skinTone,
    draftText,
    draftBodyRanges,
    getQuotedMessage,
    clearQuotedMessage,
    members = [
      {
        id: 0,
        uuid: '0',
        name: '张逸凡',
        avatarPath: 'https://img2-npl.bao.163.com/avatar/default/054/200',
        title: '张逸凡',
        isMe: true,
      },
      {
        id: 1,
        uuid: '1',
        name: '成丹丹',
        avatarPath: 'https://img2-npl.bao.163.com/avatar/default/054/200',
        title: '成丹丹',
        isMe: false,
      },
    ],
  } = props;

  const [emojiCompletionElement, setEmojiCompletionElement] =
    useState<JSX.Element>();
  const [lastSelectionRange, setLastSelectionRange] =
    useState<RangeStatic | null>(null);
  const [mentionCompletionElement, setMentionCompletionElement] =
    useState<JSX.Element>();

  const emojiCompletionRef = useRef<EmojiCompletion>();
  const mentionCompletionRef = useRef<MentionCompletion>();
  const quillRef = useRef<Quill>();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<Props>(props);
  const memberRepositoryRef = useRef<MemberRepository>(new MemberRepository());

  const i18n = useI18n();

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

  const focus = () => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return;
    }

    quill.focus();
  };

  const insertEmoji = (e: EmojiPickDataType) => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return;
    }

    const range = quill.getSelection();

    const insertionRange = range || lastSelectionRange;
    if (insertionRange === null) {
      return;
    }

    const emoji = convertShortName(e.shortName, e.skinTone);
    console.log(emoji);
    const delta = new Delta()
      .retain(insertionRange.index)
      .delete(insertionRange.length)
      .insert({ emoji });
    console.log(delta);

    // https://github.com/quilljs/delta/issues/30
    quill.updateContents(delta as unknown as DeltaStatic, 'user');
    quill.setSelection(insertionRange.index + 1, 0, 'user');
  };

  const reset = () => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return;
    }

    quill.setText('');

    const historyModule = quill.getModule('history');

    if (historyModule === undefined) {
      return;
    }

    historyModule.clear();
  };

  const resetEmojiResults = () => {
    const emojiCompletion = emojiCompletionRef.current;

    if (emojiCompletion === undefined) {
      return;
    }

    emojiCompletion.reset();
  };

  const submit = () => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return;
    }

    const [text, mentions] = getTextAndMentions();
    // console.log(text);
    // console.log(mentions);

    // window.log.info(`Submitting a message with ${mentions.length} mentions`);
    // onSubmit(text, mentions);
  };

  if (inputApi) {
    // eslint-disable-next-line no-param-reassign
    inputApi.current = {
      focus,
      insertEmoji,
      reset,
      resetEmojiResults,
      submit,
    };
  }

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const onShortKeyEnter = () => {
    submit();
    return false;
  };

  const onEnter = () => {
    const quill = quillRef.current;
    const emojiCompletion = emojiCompletionRef.current;
    const mentionCompletion = mentionCompletionRef.current;

    if (quill === undefined) {
      return false;
    }

    if (emojiCompletion === undefined || mentionCompletion === undefined) {
      return false;
    }

    if (emojiCompletion.results.length) {
      emojiCompletion.completeEmoji();
      return false;
    }

    if (mentionCompletion.results.length) {
      mentionCompletion.completeMention();
      return false;
    }

    // if (propsRef.current.large) {
    //   return true;
    // }

    submit();

    return false;
  };

  const onTab = () => {
    const quill = quillRef.current;
    const emojiCompletion = emojiCompletionRef.current;
    const mentionCompletion = mentionCompletionRef.current;

    if (quill === undefined) {
      return false;
    }

    if (emojiCompletion === undefined || mentionCompletion === undefined) {
      return false;
    }

    if (emojiCompletion.results.length) {
      emojiCompletion.completeEmoji();
      return false;
    }

    if (mentionCompletion.results.length) {
      mentionCompletion.completeMention();
      return false;
    }

    return true;
  };

  const onEscape = () => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return false;
    }

    const emojiCompletion = emojiCompletionRef.current;
    const mentionCompletion = mentionCompletionRef.current;

    if (emojiCompletion) {
      if (emojiCompletion.results.length) {
        emojiCompletion.reset();
        return false;
      }
    }

    if (mentionCompletion) {
      if (mentionCompletion.results.length) {
        mentionCompletion.clearResults();
        return false;
      }
    }

    if (getQuotedMessage()) {
      clearQuotedMessage();
      return false;
    }

    return true;
  };

  const onBackspace = () => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return true;
    }

    const selection = quill.getSelection();
    if (!selection || selection.length > 0) {
      return true;
    }

    const [blotToDelete] = quill.getLeaf(selection.index);
    if (!isMentionBlot(blotToDelete)) {
      return true;
    }

    const contents = quill.getContents(0, selection.index - 1);
    const restartDelta = getDeltaToRestartMention(contents.ops!);

    quill.updateContents(restartDelta as unknown as DeltaStatic);
    quill.setSelection(selection.index, 0);

    return false;
  };

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

      const { onEditorStateChange } = propsRef.current;

      if (onEditorStateChange) {
        // `getSelection` inside the `onChange` event handler will be the
        // selection value _before_ the change occurs. `setTimeout` 0 here will
        // let `getSelection` return the selection after the change takes place.
        // this is necessary for `maybeGrabLinkPreview` as it needs the correct
        // `caretLocation` from the post-change selection index value.
        setTimeout(() => {
          const selection = quill.getSelection();

          onEditorStateChange(
            text,
            mentions,
            selection ? selection.index : undefined
          );
        }, 0);
      }
    }

    if (propsRef.current.onDirtyChange) {
      propsRef.current.onDirtyChange(text.length > 0);
    }
  };

  const removeStaleMentions = (currentMembers: Array<ConversationType>) => {
    const quill = quillRef.current;

    if (quill === undefined) {
      return;
    }

    const { ops } = quill.getContents();
    if (ops === undefined) {
      return;
    }

    const currentMemberUuids = currentMembers
      .map((m) => m.uuid)
      .filter((uuid): uuid is string => uuid !== undefined);

    const newDelta = getDeltaToRemoveStaleMentions(ops, currentMemberUuids);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quill.updateContents(newDelta as any);
  };

  const memberIds = members ? members.map((m) => m.id) : [];

  useEffect(() => {
    memberRepositoryRef.current.updateMembers(members || []);
    removeStaleMentions(members || []);
    // We are still depending on members, but ESLint can't tell
    // Comparing the actual members list does not work for a couple reasons:
    //    * Arrays with the same objects are not "equal" to React
    //    * We only care about added/removed members, ignoring other attributes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(memberIds)]);

  const reactQuill = useMemo(() => {
    const delta = generateDelta(draftText || '', draftBodyRanges || []);

    return (
      <ReactQuill
        className="module-composition-input__quill"
        onChange={onChange}
        // defaultValue={delta}
        modules={{
          toolbar: false,
          signalClipboard: true,
          clipboard: {
            matchers: [
              ['IMG', matchEmojiImage],
              ['IMG', matchEmojiBlot],
              ['SPAN', matchReactEmoji],
              [Node.TEXT_NODE, matchEmojiText],
              ['SPAN', matchMention(memberRepositoryRef)],
            ],
          },
          keyboard: {
            bindings: {
              onEnter: { key: 'Enter', handler: onEnter }, // 13 = Enter
              onShortKeyEnter: {
                key: 'Enter', // 13 = Enter
                shortKey: true,
                handler: onShortKeyEnter,
              },
              onEscape: { key: 'Escape', handler: onEscape }, // 27 = Escape
              onBackspace: { key: 'Backspace', handler: onBackspace }, // 8 = Backspace
            },
          },
          emojiCompletion: {
            setEmojiPickerElement: setEmojiCompletionElement,
            onPickEmoji,
            skinTone,
          },
          mentionCompletion: {
            me: members ? members.find((foo) => foo.isMe) : undefined,
            memberRepositoryRef,
            setMentionPickerElement: setMentionCompletionElement,
            // i18n,
          },
        }}
        formats={['emoji', 'mention']}
        placeholder={i18n('sendMessageToContact')}
        readOnly={disabled}
        ref={(element) => {
          if (element) {
            const quill = element.getEditor();
            const keyboard = quill.getModule('keyboard') as KeyboardStatic;

            // force the tab handler to be prepended, otherwise it won't be
            // executed: https://github.com/quilljs/quill/issues/1967
            keyboard.bindings[9].unshift({ key: 9, handler: onTab }); // 9 = Tab
            // also, remove the default \t insertion binding
            keyboard.bindings[9].pop();

            // When loading a multi-line message out of a draft, the cursor
            // position needs to be pushed to the end of the input manually.
            quill.once('editor-change', () => {
              const scroller = scrollerRef.current;

              if (scroller !== null) {
                quill.scrollingContainer = scroller;
              }

              setTimeout(() => {
                quill.setSelection(quill.getLength(), 0);
                quill.root.classList.add('ql-editor--loaded');
              }, 0);
            });

            quill.on(
              'selection-change',
              (newRange: RangeStatic, oldRange: RangeStatic) => {
                // If we lose focus, store the last edit point for emoji insertion
                if (newRange === null) {
                  setLastSelectionRange(oldRange);
                }
              }
            );

            quillRef.current = quill;
            emojiCompletionRef.current = quill.getModule('emojiCompletion');
            mentionCompletionRef.current = quill.getModule('mentionCompletion');
          }
        }}
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
              {emojiCompletionElement}
              {mentionCompletionElement}
            </div>
          </div>
        )}
      </Reference>
    </Manager>
  );
};
