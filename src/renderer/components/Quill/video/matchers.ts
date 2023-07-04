import Delta from 'quill-delta';

export const matchVideoBlot = (node: HTMLElement, delta: Delta): Delta => {
  if (node.classList.contains('video-blot')) {
    const { type, video, name, size } = node.dataset;
    return new Delta().insert({
      ivideo: { type, video, name, size: parseInt(size!) },
    });
  }
  return delta;
};
