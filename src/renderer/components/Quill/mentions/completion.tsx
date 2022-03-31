import { createRef } from 'react';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import classNames from 'classnames';
import Quill, { DeltaStatic } from 'quill';
import Delta from 'quill-delta';
import { Avatar } from 'antd';
import { debounce } from 'lodash';
import { ConversationType } from '../memberRepository';
// import { LocalizerType } from '../../types/Util';
import { MemberRepository } from '../memberRepository';
import { matchBlotTextPartitions } from '../utils';

export interface MentionCompletionOptions {
  // i18n: LocalizerType;
  memberRepositoryRef: React.RefObject<MemberRepository>;
  setMentionPickerElement: (element: JSX.Element | null) => void;
  me?: ConversationType;
}

declare global {
  interface HTMLElement {
    // Webkit-specific
    scrollIntoViewIfNeeded: (bringToCenter: boolean) => void;
  }
}

const Keyboard = Quill.import('modules/keyboard');
const MENTION_REGEX = /(?:^|\W)@([-+\w]*)$/;

export class MentionCompletion {
  results: Array<ConversationType>;

  index: number;

  root: HTMLDivElement;

  quill: Quill;

  options: MentionCompletionOptions;

  suggestionListRef: React.RefObject<HTMLDivElement>;

  constructor(quill: Quill, options: MentionCompletionOptions) {
    this.results = [];
    this.index = 0;
    this.options = options;
    this.root = document.body.appendChild(document.createElement('div'));
    this.quill = quill;
    this.suggestionListRef = createRef<HTMLDivElement>();

    const clearResults = () => {
      if (this.results.length) {
        this.clearResults();
      }

      return true;
    };

    const changeIndex = (by: number) => (): boolean => {
      if (this.results.length) {
        this.changeIndex(by);
        return false;
      }

      return true;
    };

    this.quill.keyboard.addBinding({ key: Keyboard.keys.LEFT }, clearResults); // Left Arrow
    this.quill.keyboard.addBinding({ key: Keyboard.keys.UP }, changeIndex(-1)); // Up Arrow
    this.quill.keyboard.addBinding({ key: Keyboard.keys.RIGHT }, clearResults); // Right Arrow
    this.quill.keyboard.addBinding({ key: Keyboard.keys.DOWN }, changeIndex(1)); // Down Arrow

    this.quill.on('text-change', debounce(this.onTextChange.bind(this), 0));
    this.quill.on('selection-change', this.onSelectionChange.bind(this));
  }

  destroy(): void {
    this.root.remove();
  }

  changeIndex(by: number): void {
    this.index = (this.index + by + this.results.length) % this.results.length;
    this.render();
    const suggestionList = this.suggestionListRef.current;
    if (suggestionList) {
      const selectedElement = suggestionList.querySelector<HTMLElement>(
        '[aria-selected="true"]'
      );
      if (selectedElement) {
        selectedElement.scrollIntoViewIfNeeded(false);
      }
    }
  }

  onSelectionChange(): void {
    // Selection should never change while we're editing a mention
    this.clearResults();
  }

  possiblyShowMemberResults(): Array<ConversationType> {
    const range = this.quill.getSelection();

    if (range) {
      const [blot, index] = this.quill.getLeaf(range.index);

      const [leftTokenTextMatch] = matchBlotTextPartitions(
        blot,
        index,
        MENTION_REGEX
      );

      if (leftTokenTextMatch) {
        const [, leftTokenText] = leftTokenTextMatch;

        let results: Array<ConversationType> = [];

        const memberRepository = this.options.memberRepositoryRef.current;

        if (memberRepository) {
          if (leftTokenText === '') {
            results = memberRepository.getMembers(this.options.me);
          } else {
            const fullMentionText = leftTokenText;
            results = memberRepository.search(fullMentionText, this.options.me);
          }
        }

        return results;
      }
    }

    return [];
  }

  onTextChange(): void {
    const showMemberResults = this.possiblyShowMemberResults();

    if (showMemberResults.length > 0) {
      this.results = showMemberResults;
      this.index = 0;
      this.render();
    } else if (this.results.length !== 0) {
      this.clearResults();
    }
  }

  completeMention(resultIndexArg?: number): void {
    const resultIndex = resultIndexArg || this.index;

    const range = this.quill.getSelection();

    if (range === null) return;

    const member = this.results[resultIndex];

    const [blot, index] = this.quill.getLeaf(range.index);

    const [leftTokenTextMatch] = matchBlotTextPartitions(
      blot,
      index,
      MENTION_REGEX
    );

    if (leftTokenTextMatch) {
      const [, leftTokenText] = leftTokenTextMatch;

      this.insertMention(
        member,
        range.index - leftTokenText.length - 1,
        leftTokenText.length + 1,
        true
      );
    }
  }

  insertMention(
    mention: ConversationType,
    index: number,
    range: number,
    withTrailingSpace = false
  ): void {
    const delta = new Delta()
      .retain(index)
      .delete(range)
      .insert({ mention }) as unknown as DeltaStatic;

    if (withTrailingSpace) {
      this.quill.updateContents(delta.insert(' '), 'user');
      this.quill.setSelection(index + 2, 0, 'user');
    } else {
      this.quill.updateContents(delta, 'user');
      this.quill.setSelection(index + 1, 0, 'user');
    }

    this.clearResults();
  }

  clearResults(): void {
    this.results = [];
    this.index = 0;

    this.render();
  }

  onUnmount(): void {
    document.body.removeChild(this.root);
  }

  render(): void {
    const { results: memberResults, index: memberResultsIndex } = this;

    if (memberResults.length === 0) {
      this.options.setMentionPickerElement(null);
      return;
    }

    const element = createPortal(
      <Popper
        placement="top"
        modifiers={[
          {
            name: 'sameWidth',
            enabled: true,
            phase: 'beforeWrite',
            requires: ['computeStyles'],
            fn: ({ state }) => {
              state.styles.popper.width = `${state.rects.reference.width}px`;
            },
            effect: ({ state }) => {
              state.elements.popper.style.width = `${
                state.elements.reference.getBoundingClientRect().width
              }px`;
            },
          },
        ]}
      >
        {({ ref, style }) => (
          <div
            ref={ref}
            className="module-composition-input__suggestions"
            style={{
              ...style,
              bottom: '6px',
            }}
            role="listbox"
            aria-expanded
            aria-activedescendant={`mention-result--${
              memberResults.length ? memberResults[memberResultsIndex].name : ''
            }`}
            tabIndex={0}
          >
            <div
              ref={this.suggestionListRef}
              className="module-composition-input__suggestions--scroller"
            >
              {memberResults.map((member, index) => (
                <button
                  type="button"
                  key={member.uuid}
                  id={`mention-result--${member.name}`}
                  role="option button"
                  aria-selected={memberResultsIndex === index}
                  onClick={() => {
                    this.completeMention(index);
                  }}
                  className={classNames(
                    'module-composition-input__suggestions__row',
                    'module-composition-input__suggestions__row--mention',
                    memberResultsIndex === index
                      ? 'module-composition-input__suggestions__row--selected'
                      : null
                  )}
                >
                  <Avatar
                    src={member.avatarPath}
                    shape="circle"
                    // i18n={this.options.i18n}
                    size={28}
                    alt={member.title}
                  />
                  <div className="module-composition-input__suggestions__title">
                    {member.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Popper>,
      this.root
    );

    this.options.setMentionPickerElement(element);
  }
}
