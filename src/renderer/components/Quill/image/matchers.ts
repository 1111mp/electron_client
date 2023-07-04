import Delta from 'quill-delta';

export const matchImageBlot = (node: HTMLElement, delta: Delta): Delta => {
  if (node.classList.contains('image-blot')) {
    const { type, image, name, size } = node.dataset;
    return new Delta().insert({
      iimage: { type, image, name, size: parseInt(size!) },
    });
  }
  return delta;
};
