import { Room, roomRemoveCharacter, tilePosToWorldPos } from 'model/room';
import {
  AnimationState,
  Character,
  characterSetAnimationState,
  characterGetAnimationState,
  CharacterTemplate,
  characterOnAnimationCompletion,
  characterModifyHp,
  characterHasAnimationState,
  WeaponEquipState,
} from 'model/character';
import { Point, randomId } from 'utils';
import { BattleAI } from 'controller/battle-ai';
import {
  BattleAction,
  BattleActionType,
  SwingType,
} from 'controller/battle-actions';
import { completeCast, endAction } from 'controller/battle-management';
import { Timer, Gauge } from 'model/utility';
import {
  Battle,
  BattlePosition,
  Status,
  BattleTemplateEnemy,
  BattleAllegiance,
  battleGetCharactersOfAllegiance,
  battleGetOppositeAllegiance,
  battleGetAllegiance,
  battleInvokeEvent,
  BattleEvent,
  battleSubscribeEvent,
  battleUnsubscribeEvent,
} from './battle';
import { playSoundName } from './sound';
import { getNow } from './generics';
import { get as getBattleAction } from 'db/battle-actions';
import { getIfExists as getCharacterTemplate } from 'db/characters';

export enum BattleActionState {
  IDLE = 'idle',
  ACTING = 'acting',
  ACTING_READY = 'acting-ready',
  CASTING = 'casting',
  CHANNELING = 'channeling',
  STAGGERED = 'staggered',
  KNOCKED_DOWN = 'knocked-down',
}

export interface BattleCharacter {
  ch: Character;
  armor: number;
  isDefeated: boolean;
  shouldRemove: boolean;
  actionTimer: Timer; // cooldown timer
  actionReadyTimer: Timer; // timer for how long to wait while in the actionReady state
  staggerTimer: Timer;
  staggerGauge: Gauge;
  castTimer: Timer;
  armorTimer: Timer; // timer for tracking simultaneous hits that break armor
  position: BattlePosition;
  actionState: BattleActionState;
  actionStateIndex: number;
  statuses: Status[];
  canActSignaled: boolean;
  onCanActCb: () => Promise<void>;
  onCast: () => Promise<void>;
  onCastInterrupted: () => Promise<void>;
  onChannelInterrupted: () => Promise<void>;
  staggerSoundName?: string;
  ai?: BattleAI;
}

const battleCharacterCreate = (
  ch: Character,
  position: BattlePosition
): BattleCharacter => {
  const skill = ch.skills[ch.skillIndex];
  const staggerDmg = ch.stats.STAGGER;
  const bCh: BattleCharacter = {
    ch,
    armor: 0,
    isDefeated: false,
    shouldRemove: false,
    actionTimer: new Timer(skill?.cooldown ?? 2000),
    actionReadyTimer: new Timer(1500),
    staggerTimer: new Timer(2000),
    staggerGauge: new Gauge(staggerDmg, 0.002),
    castTimer: new Timer(1000),
    armorTimer: new Timer(250),
    position,
    actionState: BattleActionState.IDLE,
    actionStateIndex: 0,
    statuses: [] as Status[],
    canActSignaled: false,
    onCanActCb: async function () {},
    onCast: async function () {},
    onCastInterrupted: async function () {},
    onChannelInterrupted: async function () {},
    ai: undefined,
  };
  return bCh;
};

export const battleCharacterCreateEnemy = (
  ch: Character,
  template: BattleTemplateEnemy
): BattleCharacter => {
  if (ch.name.lastIndexOf('+') === -1) {
    ch.name = ch.name + '+' + randomId();
  }

  const bCh = battleCharacterCreate(ch, template.position);

  bCh.ai = template.ai;
  bCh.armor = template.armor ?? ch.template?.armor ?? 0;
  bCh.staggerSoundName = template.chTemplate.staggerSoundName;

  return bCh;
};
export const battleCharacterCreateAlly = (
  ch: Character,
  args: {
    position: BattlePosition;
  }
): BattleCharacter => {
  const bCh = battleCharacterCreate(ch, args.position);
  const template = getCharacterTemplate(ch.name);
  if (template) {
    bCh.staggerSoundName = template.staggerSoundName;
    bCh.armor = template.armor ?? ch.template?.armor ?? 0;
  }
  return bCh;
};

export const battleCharacterIsPreventingTurn = (bCh: BattleCharacter) => {
  return [BattleActionState.ACTING, BattleActionState.ACTING_READY].includes(
    bCh.actionState
  );
};

export const battleCharacterIsActing = (bCh: BattleCharacter) => {
  return [
    BattleActionState.ACTING,
    BattleActionState.ACTING_READY,
    BattleActionState.CASTING,
  ].includes(bCh.actionState);
};

export const battleCharacterIsActingReady = (bCh: BattleCharacter) => {
  return bCh.actionState === BattleActionState.ACTING_READY;
};

export const battleCharacterIsStaggered = (bCh: BattleCharacter) => {
  return (
    bCh.actionState === BattleActionState.STAGGERED ||
    bCh.actionState === BattleActionState.KNOCKED_DOWN
  );
};

export const battleCharacterIsKnockedDown = (bCh: BattleCharacter) => {
  return bCh.actionState === BattleActionState.KNOCKED_DOWN;
};

export const battleCharacterIsCasting = (bCh: BattleCharacter) => {
  return bCh.actionState === BattleActionState.CASTING;
};

export const battleCharacterIsChanneling = (bCh: BattleCharacter) => {
  return bCh.actionState === BattleActionState.CHANNELING;
};

export const battleCharacterSetActonState = (
  bCh: BattleCharacter,
  state: BattleActionState
) => {
  bCh.actionState = state;
};

export const battleCharacterCanAct = (
  battle: Battle,
  bCh: BattleCharacter
): boolean => {
  if (battle.isPaused) {
    return false;
  }
  if (bCh.actionState === BattleActionState.CHANNELING) {
    return true;
  }
  if (battleCharacterIsActing(bCh)) {
    return false;
  }
  if (battleCharacterIsStaggered(bCh)) {
    return false;
  }
  const ch = bCh.ch;
  const allegiance = battleGetAllegiance(battle, ch);
  const opposingBattleCharacters =
    allegiance === BattleAllegiance.ALLY ? battle.enemies : battle.allies;
  for (let i = 0; i < opposingBattleCharacters.length; i++) {
    const bc = opposingBattleCharacters[i];
    if (battleCharacterIsPreventingTurn(bc)) {
      return false;
    }
  }
  return bCh.actionTimer.isComplete();
};

export const battleCharacterSetCanActCb = (
  bCh: BattleCharacter,
  cb: () => Promise<void>
): void => {
  bCh.onCanActCb = cb;
};
export const battleCharacterRemoveCanActCb = (bCh: BattleCharacter): void => {
  bCh.onCanActCb = async function () {};
};

export const battleCharacterAddStatus = (
  bCh: BattleCharacter,
  status: Status
) => {
  if (!bCh.statuses.includes(status)) {
    bCh.statuses.push(status);
  }
};

export const battleCharacterRemoveStatus = (
  bCh: BattleCharacter,
  status: Status
) => {
  const ind = bCh.statuses.indexOf(status);
  if (ind > -1) {
    bCh.statuses.splice(ind, 1);
  }
};

export const battleCharacterGetSelectedSkill = (
  bCh: BattleCharacter
): BattleAction => {
  const skill = bCh.ch.skills[bCh.ch.skillIndex] ?? getBattleAction('NoWeapon');
  return skill;
};

export const battleCharacterGetEvasion = (bCh: BattleCharacter) => {
  return bCh.ch.stats.EVA;
};

export const battleCharacterSetAnimationStateAfterTakingDamage = (
  bCh: BattleCharacter
) => {
  if (battleCharacterIsStaggered(bCh)) {
    characterSetAnimationState(bCh.ch, AnimationState.BATTLE_STAGGERED, true);
  } else {
    characterSetAnimationState(bCh.ch, AnimationState.BATTLE_DAMAGED, true);
    characterOnAnimationCompletion(bCh.ch, () => {
      if (battleCharacterIsStaggered(bCh)) {
        characterSetAnimationState(
          bCh.ch,
          AnimationState.BATTLE_STAGGERED,
          true
        );
      } else {
        battleCharacterSetAnimationIdle(bCh);
      }
    });
  }
};

export const battleCharacterSetAnimationIdle = (bCh: BattleCharacter) => {
  if (battleCharacterIsChanneling(bCh)) {
    characterSetAnimationState(bCh.ch, AnimationState.BATTLE_CHANNEL);
  } else if (battleCharacterIsCasting(bCh)) {
    characterSetAnimationState(bCh.ch, AnimationState.BATTLE_CAST);
  } else if (bCh.ch.weaponEquipState === WeaponEquipState.RANGED) {
    characterSetAnimationState(bCh.ch, AnimationState.BATTLE_IDLE_RANGED);
  } else {
    characterSetAnimationState(bCh.ch, AnimationState.BATTLE_IDLE);
  }
};

export const battleCharacterSetAnimationStateAttack = (
  bCh: BattleCharacter,
  actionType: BattleActionType,
  swingType?: SwingType
) => {
  switch (actionType) {
    case BattleActionType.RANGED: {
      characterSetAnimationState(bCh.ch, AnimationState.BATTLE_RANGED);
      break;
    }
    case BattleActionType.CAST: {
      characterSetAnimationState(bCh.ch, AnimationState.BATTLE_CAST);
      break;
    }
    case BattleActionType.CHANNEL: {
      console.error('No channel type implemented to set animation');
      break;
    }
    case BattleActionType.SWING: {
      switch (swingType) {
        case SwingType.NORMAL: {
          characterSetAnimationState(bCh.ch, AnimationState.BATTLE_ATTACK);
          break;
        }
        case SwingType.PIERCE: {
          if (
            characterHasAnimationState(
              bCh.ch,
              AnimationState.BATTLE_ATTACK_PIERCE
            )
          ) {
            characterSetAnimationState(
              bCh.ch,
              AnimationState.BATTLE_ATTACK_PIERCE
            );
            break;
          } else {
            characterSetAnimationState(bCh.ch, AnimationState.BATTLE_ATTACK);
          }
        }
        case SwingType.KNOCK_DOWN: {
          if (
            characterHasAnimationState(
              bCh.ch,
              AnimationState.BATTLE_ATTACK_KNOCKDOWN
            )
          ) {
            characterSetAnimationState(
              bCh.ch,
              AnimationState.BATTLE_ATTACK_KNOCKDOWN
            );
            break;
          } else {
            characterSetAnimationState(bCh.ch, AnimationState.BATTLE_ATTACK);
          }
        }
        case SwingType.FINISH: {
          if (
            characterHasAnimationState(
              bCh.ch,
              AnimationState.BATTLE_ATTACK_FINISH
            )
          ) {
            characterSetAnimationState(
              bCh.ch,
              AnimationState.BATTLE_ATTACK_FINISH
            );
            break;
          } else {
            characterSetAnimationState(bCh.ch, AnimationState.BATTLE_ATTACK);
          }
        }
      }
    }
  }
};

export const updateBattleCharacter = (
  battle: Battle,
  bCh: BattleCharacter
): void => {
  if (bCh.ch.hp <= 0) {
    // enforce the animation state of defeated every frame
    if (
      characterGetAnimationState(bCh.ch) !== AnimationState.BATTLE_DEFEATED &&
      characterGetAnimationState(bCh.ch) !== AnimationState.BATTLE_DEAD
    ) {
      characterSetAnimationState(bCh.ch, AnimationState.BATTLE_DEFEATED);
    }

    if (!bCh.isDefeated) {
      bCh.isDefeated = true;
      playSoundName('dead');
      characterSetAnimationState(bCh.ch, AnimationState.BATTLE_DEFEATED);

      // HACK: assumes that a character can only die at the end of a turn
      const removeCharacter = () => {
        battleUnsubscribeEvent(
          battle,
          BattleEvent.onTurnEnded,
          removeCharacter
        );

        let ind = battle.enemies.indexOf(bCh);
        // if ch is an enemy, remove from room
        if (ind > -1) {
          bCh.shouldRemove = true;
          battle.defeated.push(bCh);
          roomRemoveCharacter(battle.room, bCh.ch);
          return;
        }
        ind = battle.allies.indexOf(bCh);
        if (ind > -1) {
          bCh.shouldRemove = true;
          battle.defeated.push(bCh);
        }
      };
      battleSubscribeEvent(battle, BattleEvent.onTurnEnded, removeCharacter);
    }
    return;
  }

  if (battle.isCompleted) {
    return;
  }

  if (battleCharacterIsStaggered(bCh)) {
    if (bCh.staggerTimer.isComplete()) {
      battleCharacterSetAnimationIdle(bCh);
      bCh.actionTimer.unpause();
      battleInvokeEvent(battle, BattleEvent.onCharacterRecovered, bCh);
      battleCharacterSetActonState(bCh, BattleActionState.IDLE);
    }
  }
  if (battleCharacterIsCasting(bCh)) {
    if (bCh.castTimer.isComplete()) {
      completeCast(bCh);
    }
  }

  if (battleCharacterIsActingReady(bCh) && bCh.actionReadyTimer.isComplete()) {
    bCh.actionStateIndex = 0;
    endAction(bCh);
  }

  bCh.staggerGauge.update();

  if (battleCharacterIsActing(bCh)) {
    if (battleCharacterIsActingReady(bCh)) {
      if (bCh.ai) {
        bCh.ai(battle, bCh);
      }
    }
  } else {
    if (battleCharacterCanAct(battle, bCh)) {
      if (!bCh.canActSignaled) {
        bCh.canActSignaled = true;
        battleInvokeEvent(battle, BattleEvent.onCharacterReady, bCh);
      }

      bCh.onCanActCb();
      if (bCh.ai && !battleCharacterIsChanneling(bCh)) {
        bCh.ai(battle, bCh);
      }
    }
  }
};
