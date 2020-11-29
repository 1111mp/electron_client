// Keyboard/mouse mode
let interactionMode: 'mouse' | 'keyboard' = 'mouse';
window.document.body.classList.add('mouse-mode');

export default function () {
  (window as any).enterKeyboardMode = () => {
    if (interactionMode === 'keyboard') {
      return;
    }

    interactionMode = 'keyboard';
    window.document.body.classList.add('keyboard-mode');
    window.document.body.classList.remove('mouse-mode');
  };

  (window as any).enterMouseMode = () => {
    if (interactionMode === 'mouse') {
      return;
    }

    interactionMode = 'mouse';
    window.document.body.classList.add('mouse-mode');
    window.document.body.classList.remove('keyboard-mode');
  };

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Tab') {
        (window as any).enterKeyboardMode();
      }
    },
    true
  );

  document.addEventListener('wheel', (window as any).enterMouseMode, true);
  document.addEventListener('mousedown', (window as any).enterMouseMode, true);

  (window as any).getInteractionMode = () => interactionMode;

  return Promise.resolve();
}
