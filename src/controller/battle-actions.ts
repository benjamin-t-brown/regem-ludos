import {
  Battle,
  BattleAllegiance,
  battleGetAllegiance,
  Status,
  battleGetNearestAttackable,
  battleGetTargetedEnemy,
  BattleEvent,
  battleInvokeEvent,
} from 'model/battle';
import {
  BattleCharacter,
  battleCharacterCanAct,
  battleCharacterAddStatus,
  battleCharacterRemoveStatus,
  battleCharacterSetActonState,
  BattleActionState,
  battleCharacterSetAnimationStateAttack,
  battleCharacterSetAnimationIdle,
} from 'model/battle-character';
import {
  Character,
  AnimationState,
  characterGetAnimation,
  characterGetPos,
  characterSetAnimationState,
  characterSetTransform,
  characterGetPosCenterPx,
  characterHasAnimationState,
  characterGetSize,
  characterGetPosTopLeft,
  characterGetPosTopLeftPx,
} from 'model/character';
import { roomAddParticle, TILE_WIDTH } from 'model/room';
import {
  Transform,
  TransformEase,
  transformOffsetJumpShort,
  transformOffsetJumpMedium,
  transformOffsetJumpFar,
} from 'model/utility';
import {
  timeoutPromise,
  getRandBetween,
  Point3d,
  calculateDistance,
  normalize,
} from 'utils';
import {
  particleCreateFromTemplate,
  EFFECT_TEMPLATE_SWORD_LEFT,
  EFFECT_TEMPLATE_FIREBALL,
  EFFECT_TEMPLATE_PIERCE_LEFT,
  EFFECT_TEMPLATE_RANGED_HIT,
  EFFECT_TEMPLATE_SMOKE,
  createDamageParticle,
  createStatusParticle,
  EFFECT_TEMPLATE_RANGED_LEFT,
  ParticleTemplate,
} from 'model/particle';
import {
  beginAction,
  endAction,
  setCasting,
  applySwingDamage,
  applyMagicDamage,
  applyRangeDamage,
} from 'controller/battle-management';
import { getCurrentRoom } from 'model/generics';
import { getIfExists as getAnimMetadata } from 'db/animation-metadata';
import { Animation } from 'model/animation';

import { h } from 'preact';
import ShieldIcon from 'view/icons/Shield';
import SwordIcon from 'view/icons/Sword';
import { playSoundName } from 'model/sound';

export interface BattleAction {
  name: string;
  description: string;
  type: BattleActionType;
  meta: BattleActionMeta;
  cooldown: number;
  cb: (battle: Battle, bCh: BattleCharacter) => Promise<void>;
}

interface BattleActionMeta {
  swings?: SwingType[];
  ranges?: RangeType[];
  castTime?: number;
  icon?: (props: any) => h.JSX.Element;
}

export enum BattleActionType {
  SWING = 'swing',
  RANGED = 'ranged',
  CAST = 'cast',
  CHANNEL = 'channel',
}

export enum SwingType {
  NORMAL = 'normal',
  PIERCE = 'pierce',
  KNOCK_DOWN = 'knock-down',
  FINISH = 'finish',
}

export enum RangeType {
  NORMAL = 'normal',
}

export const createParticleAtCharacter = (
  template: ParticleTemplate,
  ch: Character
) => {
  const [centerPx, centerPy] = characterGetPosCenterPx(ch);
  return particleCreateFromTemplate([centerPx, centerPy], template);
};

export const getDurationUntilStrike = (anim: Animation) => {
  const meta = getAnimMetadata(anim.name);
  const strikeFrame = meta?.strikeFrame ?? anim.sprites.length - 1;
  return anim.getDurationToIndex(strikeFrame);
};

// when jumping further distances, the character should jump higher
export const getTransformOffsetFunction = (distance: number) => {
  // 35 and 125 are distance between first column and last column
  if (distance < 45) {
    return transformOffsetJumpShort;
  } else if (distance < 100) {
    return transformOffsetJumpMedium;
  } else {
    return transformOffsetJumpFar;
  }
};

export const getTarget = (battle: Battle, bCh: BattleCharacter) => {
  const ch = bCh.ch;
  const allegiance = battleGetAllegiance(battle, ch);
  const selectedAction = bCh.ch.skills[bCh.ch.skillIndex];
  let target: BattleCharacter | null;
  if (allegiance === BattleAllegiance.ALLY) {
    target = battleGetTargetedEnemy(battle, selectedAction.type);
  } else {
    target = battleGetNearestAttackable(battle, allegiance);
  }
  return target;
};

export const moveForward = async (
  battle: Battle,
  bCh: BattleCharacter
): Promise<Transform> => {
  const ch = bCh.ch;
  const allegiance = battleGetAllegiance(battle, ch);
  const startPoint = characterGetPos(ch);
  const endPoint: Point3d = [...startPoint];
  if (allegiance === BattleAllegiance.ALLY) {
    endPoint[0] += TILE_WIDTH / 2 / 2;
    endPoint[1] -= TILE_WIDTH / 2 / 2;
  } else {
    endPoint[0] -= TILE_WIDTH / 2 / 2;
    endPoint[1] += TILE_WIDTH / 2 / 2;
  }
  const transform = new Transform(
    startPoint,
    endPoint,
    150,
    TransformEase.LINEAR,
    transformOffsetJumpShort
  );
  characterSetTransform(ch, transform);
  playSoundName('battle_jump');
  characterSetAnimationState(ch, AnimationState.BATTLE_JUMP);
  await transform.timer.onCompletion();
  return transform;
};

export const moveBackward = async (
  battle: Battle,
  bCh: BattleCharacter
): Promise<Transform> => {
  const ch = bCh.ch;
  const allegiance = battleGetAllegiance(battle, ch);
  const startPoint = characterGetPos(ch);
  const endPoint: Point3d = [...startPoint];
  if (allegiance === BattleAllegiance.ALLY) {
    endPoint[0] -= TILE_WIDTH / 2;
    endPoint[1] += TILE_WIDTH / 2;
  } else {
    endPoint[0] += TILE_WIDTH / 2;
    endPoint[1] -= TILE_WIDTH / 2;
  }
  const transform = new Transform(
    startPoint,
    endPoint,
    150,
    TransformEase.LINEAR,
    transformOffsetJumpShort
  );
  characterSetTransform(ch, transform);
  playSoundName('battle_jump');
  characterSetAnimationState(ch, AnimationState.BATTLE_JUMP);
  await transform.timer.onCompletion();
  return transform;
};

export const jumpToTarget = async (
  battle: Battle,
  bCh: BattleCharacter,
  target: BattleCharacter
) => {
  const ch = bCh.ch;
  const chSize = characterGetSize(bCh.ch);
  const targetSize = characterGetSize(target.ch);
  // for bigger targets, the character needs to jump further away so they don't look like
  // they're phasing into the sprite.  This calculation adjusts for the size of the
  // character jumping and the size of the target
  const jumpTileOffsetIters = Math.floor(
    1 + (chSize[0] - 32) / 32 + (targetSize[1] - 32) / 32
  );
  const allegiance = battleGetAllegiance(battle, ch);
  // jump to one tile closer towards the center of target
  const startPoint = characterGetPos(ch);
  const endPoint = characterGetPos(target.ch);
  if (allegiance === BattleAllegiance.ALLY) {
    for (let i = 0; i < jumpTileOffsetIters; i++) {
      endPoint[0] -= TILE_WIDTH / 2;
    }
    // if (battleCharacterGetRow(bCh) === BattleRow.BOTTOM) {
    //   endPoint[0] += TILE_WIDTH / 2;
    //   endPoint[1] += TILE_WIDTH / 2;
    // }
  } else {
    for (let i = 0; i < jumpTileOffsetIters; i++) {
      endPoint[0] += TILE_WIDTH / 2;
    }
    // if (battleCharacterGetRow(bCh) === BattleRow.TOP) {
    //   endPoint[0] -= TILE_WIDTH / 2;
    //   endPoint[1] -= TILE_WIDTH / 2;
    // }
  }
  const distance = calculateDistance(startPoint, endPoint);
  const transform = new Transform(
    startPoint,
    endPoint,
    // it should take a tiny bit longer to jump a further distance, so elongate that by
    // 1.75 at max distance in linearly interpolate between
    250 * normalize(distance, 35, 125, 1, 1.75),
    TransformEase.LINEAR,
    getTransformOffsetFunction(distance)
  );
  characterSetTransform(ch, transform);
  characterSetAnimationState(ch, AnimationState.BATTLE_JUMP);
  playSoundName('battle_jump');
  await transform.timer.onCompletion();
  return transform;
};

export const doSwing = async (
  battle: Battle,
  action: BattleAction,
  bCh: BattleCharacter,
  target: BattleCharacter,
  {
    baseDamage,
    baseStagger,
    swingType,
  }: { baseDamage: number; baseStagger: number; swingType: SwingType }
) => {
  const ch = bCh.ch;
  const numSwings = action.meta.swings?.length ?? 1;
  const actionStateIndex = bCh.actionStateIndex;
  bCh.actionStateIndex = (bCh.actionStateIndex + 1) % numSwings;

  console.log('DO SWING', action, bCh, numSwings);

  if (actionStateIndex === 0) {
    await beginAction(bCh);

    bCh.actionReadyTimer.start();
    await jumpToTarget(battle, bCh, target);
  }

  if (actionStateIndex < numSwings) {
    bCh.actionReadyTimer.start();
    bCh.actionReadyTimer.pause();

    // swing weapon
    battleCharacterSetActonState(bCh, BattleActionState.ACTING);

    let particleTemplate = EFFECT_TEMPLATE_SWORD_LEFT;
    if (swingType === SwingType.PIERCE) {
      particleTemplate = EFFECT_TEMPLATE_PIERCE_LEFT;
    }
    battleCharacterSetAnimationStateAttack(
      bCh,
      BattleActionType.SWING,
      swingType
    );
    const anim = characterGetAnimation(ch);
    const particleTimeoutMs = getDurationUntilStrike(anim);

    // show effect particles + apply damage after some timeout
    timeoutPromise(particleTimeoutMs).then(() => {
      const [centerPx, centerPy] = characterGetPosCenterPx(target.ch);
      const particle = particleCreateFromTemplate(
        [centerPx, centerPy],
        particleTemplate
      );
      roomAddParticle(battle.room, particle);
      applySwingDamage(battle, bCh, target, {
        damage: baseDamage,
        staggerDamage: baseStagger,
        attackType: swingType,
      });
    });

    await anim.onCompletion();
    if (actionStateIndex === numSwings - 1) {
      await timeoutPromise(750);
    } else {
      await timeoutPromise(400);
    }

    // HACK: don't invoke events in this file
    battleInvokeEvent(battle, BattleEvent.onCharacterActionReady, bCh);
    battleCharacterSetActonState(bCh, BattleActionState.ACTING_READY);
    battleCharacterSetAnimationIdle(bCh);

    bCh.actionReadyTimer.unpause();
  }

  if (bCh.actionStateIndex === 0) {
    await endAction(bCh);
  }
};

export const doRange = async (
  battle: Battle,
  action: BattleAction,
  bCh: BattleCharacter,
  target: BattleCharacter,
  {
    baseDamage,
    baseStagger,
    rangeType,
  }: { baseDamage: number; baseStagger: number; rangeType: RangeType }
) => {
  const ch = bCh.ch;
  const numRanges = action.meta.ranges?.length ?? 1;
  const actionStateIndex = bCh.actionStateIndex;
  bCh.actionStateIndex = (bCh.actionStateIndex + 1) % numRanges;

  console.log('DO RANGE', action, bCh, numRanges);

  if (actionStateIndex === 0) {
    await beginAction(bCh);

    bCh.actionReadyTimer.start();
    await moveBackward(battle, bCh);
  }

  if (actionStateIndex < numRanges) {
    bCh.actionReadyTimer.start();
    bCh.actionReadyTimer.pause();

    // shoot weapon
    battleCharacterSetActonState(bCh, BattleActionState.ACTING);
    battleCharacterSetAnimationStateAttack(bCh, BattleActionType.RANGED);
    const anim = characterGetAnimation(ch);
    const particleSpawnDelayMs = getDurationUntilStrike(anim);

    // spawn particle when bow is drawn and fired
    timeoutPromise(particleSpawnDelayMs).then(() => {
      const particle = createParticleAtCharacter(
        {
          ...EFFECT_TEMPLATE_RANGED_LEFT,
          flipped:
            battleGetAllegiance(battle, bCh.ch) === BattleAllegiance.ALLY,
        },
        ch
      );
      const [targetX, targetY] = characterGetPosTopLeftPx(target.ch);
      const animMetadata = getAnimMetadata(anim.name);
      const [
        spawnOffsetX,
        spawnOffsetY,
      ] = animMetadata?.rangedParticleSpawnOffset ?? [0, 0];

      particle.transform = new Transform(
        [particle.x + spawnOffsetX, particle.y + spawnOffsetY, 0],
        [targetX, targetY, 0],
        100,
        TransformEase.LINEAR
      );
      roomAddParticle(battle.room, particle);
    });

    // show effect particles + apply damage after some timeout
    timeoutPromise(particleSpawnDelayMs + 75).then(() => {
      const particle = createParticleAtCharacter(
        EFFECT_TEMPLATE_RANGED_HIT,
        target.ch
      );
      playSoundName('battle_arrow_hit');
      roomAddParticle(battle.room, particle);
      applyRangeDamage(battle, bCh, target, baseDamage, baseStagger);
    });

    await anim.onCompletion();
    if (actionStateIndex === numRanges - 1) {
      await timeoutPromise(750);
    } else {
      await timeoutPromise(400);
    }

    // HACK: don't invoke events in this file
    battleInvokeEvent(battle, BattleEvent.onCharacterActionReady, bCh);
    battleCharacterSetActonState(bCh, BattleActionState.ACTING_READY);
    battleCharacterSetAnimationIdle(bCh);

    bCh.actionReadyTimer.unpause();
  }

  if (bCh.actionStateIndex === 0) {
    await endAction(bCh);
  }
};

export const doSpell = async (
  battle: Battle,
  action: BattleAction,
  bCh: BattleCharacter,
  target: BattleCharacter,
  {
    particleText,
    particleTemplate,
    baseDamage,
    baseStagger,
  }: {
    particleText: string;
    particleTemplate: ParticleTemplate;
    baseDamage: number;
    baseStagger: number;
  }
) => {
  console.log('DO SPELL', action, bCh);

  await moveForward(battle, bCh);
  const [centerPx, centerPy] = characterGetPosCenterPx(bCh.ch);
  roomAddParticle(
    getCurrentRoom(),
    createStatusParticle(particleText, centerPx, centerPy, 'red')
  );
  await timeoutPromise(150);
  characterSetAnimationState(bCh.ch, AnimationState.BATTLE_SPELL);
  await timeoutPromise(150);
  // const ch = bCh.ch;
  // const allegiance = battleGetAllegiance(battle, ch);
  // let target: BattleCharacter | null;
  // if (allegiance === BattleAllegiance.ALLY) {
  //   target = battleGetTargetedEnemy(battle, BattleActionType.RANGED);
  // } else {
  //   target = battleGetNearestAttackable(battle, allegiance);
  // }
  if (target) {
    const [targetPx, targetPy] = characterGetPosCenterPx(target.ch);
    console.log('TARGETTING WITH SPELL', target);
    roomAddParticle(
      battle.room,
      particleCreateFromTemplate([targetPx, targetPy], particleTemplate)
    );
    // await timeoutPromise(150);

    applyMagicDamage(battle, bCh, target, baseDamage, baseStagger);
    await timeoutPromise(2000);
  }
};

export const BattleActions: { [key: string]: BattleAction } = {
  AdaTrainingSwing: {
    name: 'Training Swing',
    description: 'Jump to target and swing your weapon.',
    cooldown: 1000,
    type: BattleActionType.SWING,
    meta: {
      swings: [SwingType.NORMAL, SwingType.NORMAL],
      icon: SwordIcon,
    },
    cb: async function (battle: Battle, bCh: BattleCharacter): Promise<void> {
      const baseDamage = 1;
      const baseStagger = 5;
      const target = getTarget(battle, bCh);
      if (target) {
        await doSwing(battle, this, bCh, target, {
          baseDamage,
          baseStagger,
          swingType:
            this.meta?.swings?.[bCh.actionStateIndex] ?? SwingType.NORMAL,
        });
      }
    },
  },
  Swing: {
    name: 'Swing',
    description: 'Jump to target and swing your weapon.',
    cooldown: 1000,
    type: BattleActionType.SWING,
    meta: {
      swings: [SwingType.NORMAL, SwingType.PIERCE, SwingType.NORMAL],
      icon: SwordIcon,
    },
    cb: async (battle: Battle, bCh: BattleCharacter): Promise<void> => {
      const baseDamage = 1;
      const baseStagger = 5;
      const target = getTarget(battle, bCh);
      if (target) {
        await doSwing(battle, BattleActions.Swing, bCh, target, {
          baseDamage,
          baseStagger,
          swingType:
            BattleActions.Swing?.meta?.swings?.[bCh.actionStateIndex] ??
            SwingType.NORMAL,
        });
      }
    },
  },
  SwingSlow: {
    name: 'SwingSlow',
    description: 'A slower version of the swing.',
    cooldown: 2000,
    type: BattleActionType.SWING,
    meta: {
      swings: [SwingType.NORMAL, SwingType.NORMAL, SwingType.NORMAL],
      icon: SwordIcon,
    },
    cb: async (battle: Battle, bCh: BattleCharacter) => {
      return BattleActions.Swing.cb(battle, bCh);
    },
  },
  SwingWithLongDescription: {
    name: 'Swing LD',
    description:
      'This version of Swing is identical to Swing, except it kind of has a super duper long description.  This is done so that it can be TESTED.',
    cooldown: 100000,
    type: BattleActionType.SWING,
    meta: {
      swings: [SwingType.NORMAL, SwingType.NORMAL, SwingType.NORMAL],
      icon: SwordIcon,
    },
    cb: async (battle: Battle, bCh: BattleCharacter) => {
      return BattleActions.Swing.cb(battle, bCh);
    },
  },
  Defend: {
    name: 'Defend',
    description:
      'Brace yourself for an attack, taking less damage and reducing stagger for a short time.',
    cooldown: 5000,
    type: BattleActionType.CAST,
    meta: {
      castTime: 5000,
      icon: SwordIcon,
    },
    cb: async (battle: Battle, bCh: BattleCharacter) => {
      beginAction(bCh);

      const ch = bCh.ch;
      const transform = await moveForward(battle, bCh);

      characterSetAnimationState(ch, AnimationState.BATTLE_ITEM);
      const anim = characterGetAnimation(ch);
      await anim.onCompletion();
      battleCharacterAddStatus(bCh, Status.DEFEND);

      const inverseTransform = transform.createInverse();
      characterSetTransform(ch, inverseTransform);
      characterSetAnimationState(ch, AnimationState.BATTLE_JUMP);
      await inverseTransform.timer.onCompletion();

      inverseTransform.markForRemoval();
      battleCharacterSetAnimationIdle(bCh);

      setCasting(bCh, {
        castTime: 5000,
        onCast: async () => {
          console.log('Defense completed');
          battleCharacterRemoveStatus(bCh, Status.DEFEND);
        },
        onInterrupt: async () => {
          console.log('Defense interrupted');
          battleCharacterRemoveStatus(bCh, Status.DEFEND);
        },
      });

      await endAction(bCh);
    },
  },
};
