import Delta from 'quill-delta';

export const matchImageBlot = (node: HTMLElement, delta: Delta): Delta => {
  if (node.classList.contains('image-blot')) {
    const { type, image } = node.dataset;
    return new Delta().insert({ iimage: { type, image } });
  }
  return delta;
};
