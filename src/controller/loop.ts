import {
  getCurrentRoom,
  getCurrentBattle,
  setFrameMultiplier,
  setNow,
  setDeltaT,
  getMousePos,
  getIsPaused,
  setIsPaused,
  getRenderables,
  getCurrentPlayer,
  getCurrentOverworld,
  getCurrentScene,
  getRenderBackgroundColor,
  setCameraDrawOffset,
  getAllTimers,
  getGlobalParticleSystem,
  getCameraTransform,
  setCameraTransform,
} from 'model/generics';
import { createAnimation } from 'model/animation';
import {
  TILE_WIDTH,
  TILE_HEIGHT,
  roomGetTileAt,
  roomGetTileBelow,
} from 'model/room';
import { pixelToIsoCoords, isoToPixelCoords } from 'utils';
import {
  clearScreen,
  drawAnimation,
  drawRoom,
  drawRect,
  drawSprite,
} from 'view/draw';
import {
  Character,
  characterGetAnimation,
  characterUpdate,
} from 'model/character';
import { Particle, particleUpdate } from 'model/particle';
import {
  BattleCharacter,
  battleCharacterIsActing,
  battleCharacterIsCasting,
} from 'model/battle-character';
import { renderUi } from 'view/ui';
import { updateBattle } from 'controller/battle-management';
import { updateOverworld } from 'controller/overworld-management';
import { getDrawScale, getCtx, getScreenSize, getCanvas } from 'model/canvas';
import { updateScene } from './scene-management';
import { playerGetCameraOffset } from 'model/player';
import { battlePauseTimers, battleUnpauseTimers } from 'model/battle';

export const pause = () => {
  if (getIsPaused()) {
    return;
  }
  setIsPaused(true);
  renderUi();
  getAllTimers().forEach(t => {
    t.pauseOverride();
  });

  const transform = getCameraTransform();
  if (transform) {
    transform.timer.pauseOverride();
  }

  const room = getCurrentRoom();
  if (room) {
    room.characters.forEach((ch: Character) => {
      if (ch.transform) {
        ch.transform.timer.pauseOverride();
      }
      const anim = characterGetAnimation(ch);
      anim.pause();
    });
    room.particles.forEach((p: Particle) => {
      p.timer.pauseOverride();
      if (p.anim) {
        p.anim.pause();
      }
      if (p.transform) {
        p.transform.timer.pauseOverride();
      }
    });
  }

  const battle = getCurrentBattle();
  if (battle) {
    battlePauseTimers(battle);
    battle.isPaused = true;
  }
};

export const unpause = () => {
  if (!getIsPaused()) {
    return;
  }
  setIsPaused(false);
  renderUi();
  getAllTimers().forEach(t => {
    t.unpauseOverride();
  });

  const transform = getCameraTransform();
  if (transform) {
    transform.timer.unpauseOverride();
  }

  const room = getCurrentRoom();
  if (room) {
    room.characters.forEach((ch: Character) => {
      if (ch.transform) {
        ch.transform.timer.unpauseOverride();
      }
      const anim = characterGetAnimation(ch);
      anim.unpause();
    });
    room.particles.forEach((p: Particle) => {
      p.timer.unpauseOverride();
      if (p.anim) {
        p.anim.unpause();
      }
      if (p.transform) {
        p.transform.timer.unpauseOverride();
      }
    });
  }

  const battle = getCurrentBattle();
  if (battle) {
    battleUnpauseTimers(battle);
    battle.isPaused = false;
  }
};

export const runMainLoop = async (): Promise<void> => {
  const startTime = performance.now();
  let prevNow = startTime;
  const sixtyFpsMs = 16;
  (window as any).running = true;
  const canvasOuter = getCanvas('outer');
  const outerCtx: any = canvasOuter.getContext('2d');

  // for debugging
  // const reLoop = () =>
  //   (window as any).running && setTimeout(() => loop(performance.now()), 100);
  const reLoop = () => (window as any).running && requestAnimationFrame(loop);

  const loop = (now: number) => {
    const dt = now - prevNow;
    const fm = dt / sixtyFpsMs;
    setFrameMultiplier(fm > 4 ? 4 : fm);
    setDeltaT(dt);
    prevNow = now;
    setNow(now);

    if (getIsPaused()) {
      // clearScreen();
      // clearScreen(getCtx('outer'));
      const [screenW, screenH] = getScreenSize();
      // drawRect(0, 0, screenW, screenH, getRenderBackgroundColor());
      const room = getCurrentRoom();
      const battle = getCurrentBattle();
      const roomVisible = room.visible;

      // position the camera in the right spot
      let roomXOffset = 0;
      let roomYOffset = 0;
      if (battle) {
        roomXOffset = screenW / 2 - 32 / 2;
        roomYOffset = screenH / 4 - 13;
      } else {
        const player = getCurrentPlayer();
        if (player) {
          const [oX, oY] = playerGetCameraOffset(player);
          roomXOffset = oX;
          roomYOffset = oY;
        }
      }
      setCameraDrawOffset([roomXOffset, roomYOffset]);
      if (roomVisible) {
        drawRoom(room, [roomXOffset, roomYOffset], undefined, true);
      }

      reLoop();
      // if ((window as any).running)
      //   setTimeout(() => loop(performance.now()), 100); // for debugging
      return;
    }

    getAllTimers().forEach(t => {
      t.update();
    });

    const [screenW, screenH] = getScreenSize();
    const scene = getCurrentScene();
    const battle = getCurrentBattle();
    const overworld = getCurrentOverworld();
    const room = getCurrentRoom();

    if (scene) {
      updateScene(scene);
    }

    let roomVisible = false;
    let roomXOffset = 0;
    let roomYOffset = 0;
    if (room) {
      roomVisible = room.visible;
      for (let i = 0; i < room.tiles.length; i++) {
        room.tiles[i].highlighted = false;
      }

      if (overworld) {
        updateOverworld(overworld);
      }

      if (battle) {
        updateBattle(battle);
      }

      for (let i = 0; i < room.characters.length; i++) {
        const ch = room.characters[i];
        characterUpdate(ch);
        // const tile = roomGetTileBelow(room, ch);
        // if (tile) {
        //   tile.highlighted = true;
        // }
      }
      for (let i = 0; i < room.particles.length; i++) {
        particleUpdate(room.particles[i]);
        if (room.particles[i].shouldRemove) {
          room.particles.splice(i, 1);
          i--;
        }
      }

      // position the camera in the right spot
      if (battle) {
        roomXOffset = screenW / 2 - 32 / 2;
        roomYOffset = screenH / 4 - 13;
      } else {
        const player = getCurrentPlayer();
        if (player) {
          const transform = getCameraTransform();
          if (transform) {
            const [x, y] = transform.current();
            roomXOffset = x;
            roomYOffset = y;
            transform.update();
            // if (transform.shouldRemove) {
            //   setCameraTransform(null);
            // }
          } else {
            const [oX, oY] = playerGetCameraOffset(player);
            roomXOffset = oX;
            roomYOffset = oY;
          }
        }
      }
      setCameraDrawOffset([roomXOffset, roomYOffset]);

      // const [mouseX, mouseY] = getMousePos();
      // const [worldX, worldY] = pixelToIsoCoords(
      //   mouseX / getDrawScale() - roomXOffset - TILE_WIDTH / 2,
      //   mouseY / getDrawScale() - roomYOffset - TILE_HEIGHT / 2
      // );
      // const tileX = Math.floor((worldX / TILE_WIDTH) * 2);
      // const tileY = Math.floor((worldY / TILE_HEIGHT) * 2);
      // const tile = roomGetTileAt(room, tileX, tileY);

      // // if (lastHighlightedTile !== tile && lastHighlightedTile) {
      // //   lastHighlightedTile.highlighted = false;
      // // }
      // if (tile) {
      //   // console.log('highlight tile', tile.x, tile.y);
      //   tile.highlighted = true;
      // }

      // console.log('OFFSET', roomXOffset, roomYOffset);

      // drawSprite('ada_0', 100, 100, 1);
    }

    const ps = getGlobalParticleSystem();
    if (ps) {
      ps.updateDraw();
      reLoop();
      return;
    }

    clearScreen();
    clearScreen(getCtx('outer'));
    drawRect(0, 0, screenW, screenH, getRenderBackgroundColor());
    if (roomVisible) {
      drawRoom(room, [roomXOffset, roomYOffset]);
    }
    const renderables = getRenderables();
    for (const i in renderables) {
      const cb = renderables[i];
      cb();
    }

    reLoop();
  };
  loop(startTime);
};
