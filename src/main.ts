import { loadTiles } from 'model/sprite';
import { runMainLoop } from 'controller/loop';
import { loadRes } from 'controller/res-loader';
import { getCanvas, setDrawScale } from 'model/canvas';
import { initEvents } from 'controller/events';
import { mountUi, renderUi } from 'view/ui';
import { initHooks } from 'view/hooks';
import { initScene } from 'model/scene';
import initDb from 'db';
import { loadRPGScript } from 'lib/rpgscript';
import {
  disableKeyUpdate,
  enableKeyUpdate,
  getCurrentScene,
  getCurrentPlayer,
  getCurrentRoom,
} from 'model/generics';

import ArcadeCabinet, { ArcadeGamePath } from 'view/components/ArcadeCabinet';
import OverworldSection from 'view/components/OverworldSection';
import { get as getOverworld } from 'db/overworlds';
import {
  enableOverworldControl,
  initiateOverworld,
} from 'controller/overworld-management';
import { playerCreate } from 'model/player';
import {
  AnimationState,
  Facing,
  characterCreateFromTemplate,
  characterCreate,
} from 'model/character';
import HudGamepad from 'lib/hud-gamepad';

import { callScript } from 'controller/scene-management';
import { getAngleTowards } from 'utils';
import { battleStatsCreate } from 'model/battle';
import { BattleActions } from 'controller/battle-actions';
import { get as getCharacter } from 'db/characters';
import { createPFPath, pfPathToRoomPath } from 'controller/pathfinding';
import {
  loadSettingsFromLS,
  setCurrentSettings,
} from 'controller/save-management';
import { awaitAllRoomProps, loadDynamicPropsTileset } from 'model/room';
import { showModal } from 'controller/ui-actions';
import { ModalSection } from 'model/store';
import { playMusic } from 'model/sound';

function parseQuery(queryString: string): Record<string, string> {
  const query = {};
  const pairs = (queryString[0] === '?'
    ? queryString.substr(1)
    : queryString
  ).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

export const main = async (): Promise<void> => {
  // Mount this first so that appInterface is MOST LIKELY set when loading the overworld,
  // which may depend on that being loaded because it calls the load trigger for a room
  // when it starts.
  // Still, it's loose.  This depends on the ui mounting fully in the time it takes
  // for the rest of the app to load.  This is probably fine, but is not definitive.
  console.log('mount ui');
  mountUi();

  console.log('load rpgscript');
  initScene();
  const scene = getCurrentScene();
  await loadRPGScript('quest', scene);
  await loadRPGScript('test2', scene);
  await loadRPGScript('test', scene);
  await loadRPGScript('example', scene);
  await loadRPGScript('utils', scene);
  await loadRPGScript('floor1-atrium', scene);
  await loadRPGScript('floor1-tut', scene);
  await loadRPGScript('intro', scene);

  console.log('load res');
  await loadRes();
  // Need this loaded to load rooms, some props need height info to load properly
  await loadDynamicPropsTileset();

  console.log('init db');
  await initDb();

  // loading db might load some prop images dynamically, this waits for those to load
  await awaitAllRoomProps();

  console.log('load tiles');
  await loadTiles();

  try {
    const settings = loadSettingsFromLS();
    setCurrentSettings(settings);
    console.log('Settings have been loaded from localStorage.');
  } catch (e) {
    console.log('Settings have NOT been loaded from localStorage.');
  }

  console.log('create canvas');
  getCanvas(); // loads the canvas before the events so getBoundingClientRect works correctly
  setDrawScale(4);
  initEvents();
  initHooks();

  const adaTemplate = getCharacter('Ada');
  const player = playerCreate(adaTemplate);
  const conscience = characterCreateFromTemplate(getCharacter('Conscience'));
  player.party.push(conscience);
  player.partyStorage.push(conscience);
  player.battlePositions.push(conscience);

  await new Promise<void>(resolve => {
    const touchSomething = () => {
      window.removeEventListener('keydown', touchSomething);
      window.removeEventListener('mousedown', touchSomething);
      resolve();
    };
    window.addEventListener('keydown', touchSomething);
    window.addEventListener('mousedown', touchSomething);
  });

  console.log('initiate overworld');
  const query = parseQuery(window.location.search);
  if (query.room) {
    const overworldTemplate = getOverworld(query.room);
    initiateOverworld(player, overworldTemplate);
  } else {
    initiateOverworld(player, getOverworld('TEST2'));
  }
  enableOverworldControl();

  // load save
  scene.storage.quest_tutorial_active = true;

  console.log('run loop');
  runMainLoop();

  (document.getElementById('controls') as any).style.display = 'none';
  renderUi();

  // HudGamepad.GamePad.setup({
  //   canvas: 'controls',
  //   select: false,
  //   trace: true,
  //   debug: true,
  //   buttons: [
  //     { name: 'x', color: 'rgba(255,255,0,0.5)' },
  //     { name: 'y', color: 'rgba(0,255,255,0.75)' },
  //   ],
  // });
};
