import Parchment from 'parchment';
import Quill from 'quill';
import { createRoot } from 'react-dom/client';
import { Emojify } from 'Components/Emojify';
import { MentionBlotValue } from '../utils';

const Embed: typeof Parchment.Embed = Quill.import('blots/embed');

export class MentionBlot extends Embed {
  static blotName = 'mention';

  static className = 'mention-blot';

  static tagName = 'span';
  contentNode: any;

  static create(value: MentionBlotValue): Node {
    const node = super.create(undefined) as HTMLElement;

    MentionBlot.buildSpan(value, node);

    return node;
  }

  static value(node: HTMLElement): MentionBlotValue {
    const { uuid, title } = node.dataset;
    if (uuid === undefined || title === undefined) {
      throw new Error(
        `Failed to make MentionBlot with uuid: ${uuid} and title: ${title}`
      );
    }

    return {
      uuid,
      title,
    };
  }

  static buildSpan(mention: MentionBlotValue, node: HTMLElement): void {
    node.setAttribute('data-uuid', mention.uuid || '');
    node.setAttribute('data-title', mention.title || '');

    const mentionSpan = document.createElement('span');

    const root = createRoot(mentionSpan);
    root.render(
      <span className="module-composition-input__at-mention">
        <bdi>
          @
          <Emojify text={mention.title} />
        </bdi>
      </span>
    );

    node.appendChild(mentionSpan);
  }

  constructor(node: Node) {
    super(node);

    this.contentNode && this.contentNode.removeAttribute('contenteditable');
  }
}
