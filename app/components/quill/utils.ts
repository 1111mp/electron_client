import emojiRegex from 'emoji-regex';
import Op from 'quill-delta/dist/Op';

export interface BodyRangeType {
  start: number;
  length: number;
  mentionUuid: string;
  replacementText: string;
  conversationID?: string;
}

export interface MentionBlotValue {
  uuid: string;
  title: string;
}

export type InsertOp<K extends string, T> = Op & { insert: { [V in K]: T } };

export type InsertMentionOp = InsertOp<'mention', MentionBlotValue>;
export type InsertEmojiOp = InsertOp<'emoji', string>;

export const isSpecificInsertOp = (op: Op, type: string): boolean => {
  return (
    op.insert !== undefined &&
    typeof op.insert === 'object' &&
    Object.hasOwnProperty.call(op.insert, type)
  );
};

export const isInsertEmojiOp = (op: Op): op is InsertEmojiOp =>
  isSpecificInsertOp(op, 'emoji');

export const isInsertMentionOp = (op: Op): op is InsertMentionOp =>
  isSpecificInsertOp(op, 'mention');

export const getTextAndMentionsFromOps = (
  ops: Array<Op>
): [string, Array<BodyRangeType>] => {
  const mentions: Array<BodyRangeType> = [];

  const text = ops
    .reduce((acc, op) => {
      if (typeof op.insert === 'string') {
        return acc + op.insert;
      }

      if (isInsertEmojiOp(op)) {
        return acc + op.insert.emoji;
      }

      if (isInsertMentionOp(op)) {
        mentions.push({
          length: 1, // The length of `\uFFFC`
          mentionUuid: op.insert.mention.uuid,
          replacementText: op.insert.mention.title,
          start: acc.length,
        });

        return `${acc}\uFFFC`;
      }

      return acc;
    }, '')
    .trim();

  return [text, mentions];
};

export const insertMentionOps = (
  incomingOps: Array<Op>,
  bodyRanges: Array<BodyRangeType>
): Array<Op> => {
  const ops = [...incomingOps];

  // Working backwards through bodyRanges (to avoid offsetting later mentions),
  // Shift off the op with the text to the left of the last mention,
  // Insert a mention based on the current bodyRange,
  // Unshift the mention and surrounding text to leave the ops ready for the next range
  bodyRanges
    .sort((a, b) => b.start - a.start)
    .forEach(({ start, length, mentionUuid, replacementText }) => {
      const op = ops.shift();

      if (op) {
        const { insert } = op;

        if (typeof insert === 'string') {
          const left = insert.slice(0, start);
          const right = insert.slice(start + length);

          const mention = {
            uuid: mentionUuid,
            title: replacementText,
          };

          ops.unshift({ insert: right });
          ops.unshift({ insert: { mention } });
          ops.unshift({ insert: left });
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
