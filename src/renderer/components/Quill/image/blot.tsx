import Parchment from 'parchment';
import Quill from 'quill';

import type { ImageBlotValue } from '../utils';

const Embed: typeof Parchment.Embed = Quill.import('blots/embed');

export class ImageBlot extends Embed {
  static blotName = 'iimage';

  static tagName = 'IMG';

  static className = 'image-blot';

  static create({ type, image, size, name }: ImageBlotValue): Node {
    const node = super.create(undefined) as HTMLElement;
    node.dataset.type = type;
    node.dataset.image = image;
    node.dataset.name = name;
    node.dataset.size = `${size}`;

    node.setAttribute('src', image || '');

    return node;
  }

  static value(node: HTMLElement): ImageBlotValue {
    const { type, image, size, name } = node.dataset;
    if (type === void 0 || image === void 0 || size === void 0) {
      throw new Error(
        `Failed to make ImageBlot with type: ${type} and image: ${image}`
      );
    }

    return {
      type,
      image,
      name,
      size: parseInt(size),
    };
  }
}
