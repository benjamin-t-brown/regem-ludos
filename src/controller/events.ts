import { setMousePos, setKeyDown, setKeyUp } from 'model/generics';
import { CANVAS_ID } from 'model/canvas';

export const initEvents = (): void => {
  const canvasElem = document.getElementById(CANVAS_ID);
  const { left, top, width, height } = canvasElem?.getBoundingClientRect() || {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };
  window.addEventListener('mousemove', (ev: MouseEvent) => {
    const { clientX, clientY } = ev;
    let mouseX = clientX - left;
    let mouseY = clientY - top;
    if (mouseX > width) {
      mouseX = width;
    }
    if (mouseY > height) {
      mouseY = height;
    }
    setMousePos(mouseX, mouseY);
  });

  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    setKeyDown(ev.key);

    const handler = getCurrentKeyHandler();
    if (handler) {
      handler(ev);
    }
  });

  window.addEventListener('keyup', (ev: KeyboardEvent) => {
    setKeyUp(ev.key);
  });

  pushKeyHandler(async (ev: KeyboardEvent) => {
    // this doesn't do anything lol
    // switch (ev.key) {
    //   case 'ArrowUp': {
    //     break;
    //   }
    //   case 'ArrowDown': {
    //     break;
    //   }
    //   case 'ArrowLeft': {
    //     break;
    //   }
    //   case 'ArrowRight': {
    //     break;
    //   }
    //   case 'p':
    //   case 'P': {
    //     if (getIsPaused()) {
    //       unpause();
    //     } else {
    //       pause();
    //     }
    //     break;
    //   }
    //   case 'x':
    //   case 'X': {
    //     const battle = getCurrentBattle();
    //     const bCh = battle.allies[0];
    //     const skill = battleCharacterGetSelectedSkill(bCh);
    //     skill.cb(battle, bCh);
    //     break;
    //   }
    //   case 'c': {
    //     if (getKeyUpdateEnabled()) {
    //       console.log('DISABLE KEYS');
    //       disableKeyUpdate();
    //       // await callScript(getCurrentScene(), 'floor1-Skye_intro');
    //       await callScript(getCurrentScene(), 'test-spawnDespawnCharacter');
    //       showSection(AppSection.Debug, true);
    //       console.log('ENABLE KEYS');
    //       enableKeyUpdate();
    //     }
    //   }
    // }
  });
};

const keyHandlers: KeyboardHandler[] = ((window as any).keyHandlers = []);

type KeyboardHandler = (ev: KeyboardEvent) => void;
export const getCurrentKeyHandler = (): KeyboardHandler | null =>
  keyHandlers[keyHandlers.length - 1];
export const pushKeyHandler = (cb: KeyboardHandler): void => {
  keyHandlers.push(cb);
};
export const pushEmptyKeyHandler = () => {
  const handler = () => {};
  keyHandlers.push(handler);
  return handler;
};
export const popKeyHandler = (handler: KeyboardHandler) => {
  if (handler) {
    const ind = keyHandlers.indexOf(handler);
    if (ind > -1) {
      keyHandlers.splice(ind, 1);
    }
  } else {
    keyHandlers.splice(keyHandlers.length - 1, 1);
  }
};

export const isConfirmKey = (key: string) => {
  return ['Return', 'Enter', ' ', 'x', 'X', 'KeyX'].includes(key);
};
export const getConfirmKeyLabel = () => '(X)';
export const isCancelKey = (key: string) => {
  return ['Escape', 'z', 'Z', 'KeyZ'].includes(key);
};
export const getCancelKeyLabel = () => '(Z)';
export const isAuxKey = (key: string) => {
  return ['c', 'C', 'KeyC'].includes(key);
};
export const getPauseKeyLabel = () => '(Space)';
export const isPauseKey = (key: string) => [' '].includes(key);
export const getAuxKeyLabel = () => '(C)';
