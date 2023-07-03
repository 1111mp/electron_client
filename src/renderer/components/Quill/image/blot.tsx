import Parchment from 'parchment';
import Quill from 'quill';

const Embed: typeof Parchment.Embed = Quill.import('blots/embed');

export type ImageBlotValue = {
  type: string;
  image: string;
};

export class ImageBlot extends Embed {
  static blotName = 'iimage';

  static tagName = 'img';

  static className = 'image-blot';

  static create({ type, image }: ImageBlotValue): Node {
    const node = super.create(undefined) as HTMLElement;
    node.dataset.type = type;
    node.dataset.image = image;

    node.setAttribute('src', image || '');

    return node;
  }

  static value(node: HTMLElement): string | undefined {
    return node.dataset.image;
  }
}
