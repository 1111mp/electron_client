import emojiRegex from 'emoji-regex';
import Delta from 'quill-delta';
import type { LeafBlot, DeltaOperation } from 'quill';
import type Op from 'quill-delta/dist/Op';

import { MentionBlot } from './mentions/blot';

export enum BodyRangeType {
  Mention = 'mention',
  Files = 'files',
}

export interface BodyRangeBasic {
  start: number;
  length: number;
  conversationID?: string;
}

interface BodyRangeMention {
  body: BodyRangeType.Mention;
  mentionId: number;
  replacementText: string;
}

interface BodyRangeFiles {
  body: BodyRangeType.Files;
  type: string;
  url: string;
  size: number;
  name?: string;
}

export type BodyRange = BodyRangeBasic & (BodyRangeMention | BodyRangeFiles);

export interface MentionBlotValue {
  id: number;
  title: string;
}

export interface ImageBlotValue {
  type: string;
  image: string;
  size: number;
  name?: string;
}

export interface VideoBlotValue {
  type: string;
  video: string;
  size: number;
  name?: string;
}

export const isMentionBlot = (blot: LeafBlot): blot is MentionBlot =>
  blot.value() && blot.value().mention;

export type InsertOp<K extends string, T> = Op & { insert: { [V in K]: T } };

export type InsertMentionOp = InsertOp<'mention', MentionBlotValue>;
export type InsertEmojiOp = InsertOp<'emoji', string>;
export type InsertIImageOp = InsertOp<'iimage', ImageBlotValue>;
export type InsertIVideoOp = InsertOp<'ivideo', VideoBlotValue>;

export const isSpecificInsertOp = (op: Op, type: string): boolean => {
  return (
    op.insert !== undefined &&
    typeof op.insert === 'object' &&
    Object.hasOwnProperty.call(op.insert, type)
  );
};

export const isInsertIVideoOp = (op: Op): op is InsertIVideoOp =>
  isSpecificInsertOp(op, 'ivideo');

export const isInsertIImageOp = (op: Op): op is InsertIImageOp =>
  isSpecificInsertOp(op, 'iimage');

export const isInsertEmojiOp = (op: Op): op is InsertEmojiOp =>
  isSpecificInsertOp(op, 'emoji');

export const isInsertMentionOp = (op: Op): op is InsertMentionOp =>
  isSpecificInsertOp(op, 'mention');

export const getTextAndBodysFromOps = (
  ops: Array<Op>
): [string, Array<BodyRange>] => {
  const bodys: Array<BodyRange> = [];

  const text = ops
    .reduce((acc, op) => {
      if (typeof op.insert === 'string') {
        return acc + op.insert;
      }

      // iimage
      if (isInsertIImageOp(op)) {
        bodys.push({
          body: BodyRangeType.Files,
          length: 1, // The length of `\uFFFC`
          type: op.insert.iimage.type,
          name: op.insert.iimage.name,
          url: op.insert.iimage.image,
          size: op.insert.iimage.size,
          start: acc.length,
        });

        return `${acc}\uFFFC`;
      }

      // ivideo
      if (isInsertIVideoOp(op)) {
        bodys.push({
          body: BodyRangeType.Files,
          length: 1, // The length of `\uFFFC`
          type: op.insert.ivideo.type,
          name: op.insert.ivideo.name,
          url: op.insert.ivideo.video,
          size: op.insert.ivideo.size,
          start: acc.length,
        });

        return `${acc}\uFFFC`;
      }

      // emoji
      if (isInsertEmojiOp(op)) {
        return acc + op.insert.emoji;
      }

      // mention
      if (isInsertMentionOp(op)) {
        bodys.push({
          body: BodyRangeType.Mention,
          length: 1, // The length of `\uFFFC`
          mentionId: op.insert.mention.id,
          replacementText: op.insert.mention.title,
          start: acc.length,
        });

        return `${acc}\uFFFC`;
      }

      return acc;
    }, '')
    .trim();

  return [text, bodys];
};

export const insertBodyOps = (
  incomingOps: Array<Op>,
  bodyRanges: Array<BodyRange>
): Array<Op> => {
  const ops = [...incomingOps];

  // Working backwards through bodyRanges (to avoid offsetting later mentions),
  // Shift off the op with the text to the left of the last mention,
  // Insert a mention based on the current bodyRange,
  // Unshift the mention and surrounding text to leave the ops ready for the next range
  bodyRanges
    .sort((a, b) => b.start - a.start)
    .forEach((bodyRange) => {
      const op = ops.shift();

      if (op) {
        const { insert } = op;

        if (typeof insert === 'string') {
          const { body, start, length } = bodyRange;

          const left = insert.slice(0, start);
          const right = insert.slice(start + length);

          if (body === BodyRangeType.Mention) {
            const mention = {
              id: bodyRange.mentionId,
              title: bodyRange.replacementText,
            };

            ops.unshift({ insert: right });
            ops.unshift({ insert: { mention } });
            ops.unshift({ insert: left });
          }

          if (body === BodyRangeType.Files) {
            const file = {
              type: bodyRange.type,
              name: bodyRange.name,
              size: bodyRange.size,
              [bodyRange.type.startsWith('image') ? 'image' : 'video']:
                bodyRange.url,
            };

            ops.unshift({ insert: right });
            ops.unshift({
              insert: {
                [bodyRange.type.startsWith('image') ? 'iimage' : 'ivideo']:
                  file,
              },
            });
            ops.unshift({ insert: left });
          }
        } else {
          ops.unshift(op);
        }
      }
    });

  return ops;
};

export const insertEmojiOps = (incomingOps: Array<Op>): Array<Op> => {
  return incomingOps.reduce((ops, op) => {
    if (typeof op.insert === 'string') {
      const text = op.insert;
      const re = emojiRegex();
      let index = 0;
      let match: RegExpExecArray | null;

      // eslint-disable-next-line no-cond-assign
      while ((match = re.exec(text))) {
        const [emoji] = match;
        ops.push({ insert: text.slice(index, match.index) });
        ops.push({ insert: { emoji } });
        index = match.index + emoji.length;
      }

      ops.push({ insert: text.slice(index, text.length) });
    } else {
      ops.push(op);
    }

    return ops;
  }, [] as Array<Op>);
};

export const getBlotTextPartitions = (
  blot: LeafBlot,
  index: number
): [string, string] => {
  if (blot !== undefined && blot.text !== undefined) {
    const leftLeafText = blot.text.substr(0, index);
    const rightLeafText = blot.text.substr(index);

    return [leftLeafText, rightLeafText];
  }

  return ['', ''];
};

export const matchBlotTextPartitions = (
  blot: LeafBlot,
  index: number,
  leftRegExp: RegExp,
  rightRegExp?: RegExp
): Array<RegExpMatchArray | null> => {
  const [leftText, rightText] = getBlotTextPartitions(blot, index);

  const leftMatch = leftRegExp.exec(leftText);
  let rightMatch = null;

  if (rightRegExp) {
    rightMatch = rightRegExp.exec(rightText);
  }

  return [leftMatch, rightMatch];
};

export const getDeltaToRestartMention = (ops: Array<Op>): Delta => {
  const changes = ops.reduce((acc, op): Array<Op> => {
    if (op.insert && typeof op.insert === 'string') {
      acc.push({ retain: op.insert.length });
    } else {
      acc.push({ retain: 1 });
    }
    return acc;
  }, Array<Op>());
  changes.push({ delete: 1 });
  changes.push({ insert: '@' });
  return new Delta(changes);
};

export const getDeltaToRemoveStaleMentions = (
  ops: Array<Op>,
  memberIds: Array<number>
): Delta => {
  const newOps = ops.reduce((memo, op) => {
    if (op.insert) {
      if (isInsertMentionOp(op) && !memberIds.includes(op.insert.mention.id)) {
        const deleteOp = { delete: 1 };
        const textOp = { insert: `@${op.insert.mention.title}` };
        return [...memo, deleteOp, textOp];
      }

      if (typeof op.insert === 'string') {
        const retainStringOp = { retain: op.insert.length };
        return [...memo, retainStringOp];
      }

      const retainEmbedOp = { retain: 1 };
      return [...memo, retainEmbedOp];
    }

    return [...memo, op];
  }, Array<Op>());

  return new Delta(newOps);
};

// Not yet used
export const getTextFromOps = (ops: Array<Op>): string =>
  ops
    .reduce((acc, op) => {
      if (typeof op.insert === 'string') {
        return acc + op.insert;
      }

      if (isInsertEmojiOp(op)) {
        return acc + op.insert.emoji;
      }

      if (isInsertMentionOp(op)) {
        return `${acc}@${op.insert.mention.title}`;
      }

      return acc;
    }, '')
    .trim();
