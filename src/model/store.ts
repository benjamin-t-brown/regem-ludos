import { ArcadeGamePath } from 'view/components/ArcadeCabinet';

export enum AppSection {
  BattleUI = 'battleMenu',
  BattleVictory = 'battleVictory',
  BattleDefeated = 'battleDefeated',
  Cutscene = 'cutscene',
  Debug = 'debug',
  ArcadeCabinet = 'arcadeCabinet',
  Choices = 'choices',
  Settings = 'settings',
  Modal = 'modal',
  Save = 'save',
  Menu = 'menu',
}

export enum CutsceneSpeaker {
  Left = 'left',
  Left2 = 'left2',
  Right = 'right',
  Right2 = 'right2',
  Center = 'center',
  None = 'none',
}

export interface ICutsceneAppState {
  text: string;
  showBars: boolean;
  speaker: CutsceneSpeaker;
  speakerName: string;
  visible: boolean;
  portraitLeft: string;
  portraitLeftEmotion: string;
  portraitLeft2: string;
  portraitLeft2Emotion: string;
  portraitRight: string;
  portraitRightEmotion: string;
  portraitRight2: string;
  portraitRight2Emotion: string;
  portraitCenter: string;
  portraitCenterEmotion: string;
}

export interface IArcadeCabinetState {
  path: ArcadeGamePath | '';
  isGameRunning: boolean;
  isGameReady: boolean;
}

export interface IChoicesState {
  choiceTexts: string[];
  keyHandlerInternal: () => void;
}

export interface IBattleUiState {
  disabled: boolean;
  paused: boolean;
  characterIndexSelected: number;
  targetIndexSelected: number;
}

export interface IOverworldAppState {
  characterText: string;
  prevCharacterText: string;
}

export enum ModalSection {
  TUTORIAL_ATTACK = 'TUTORIAL_ATTACK',
  TUTORIAL_PAUSING = 'TUTORIAL_PAUSING',
  TUTORIAL_ATTACK_AMOUNTS = 'TUTORIAL_ATTACK_AMOUNTS',
  TUTORIAL_STAGGER = 'TUTORIAL_STAGGER',
  TUTORIAL_BACK_ROW = 'TUTORIAL_BACK_ROW',
  TUTORIAL_MAGIC = 'TUTORIAL_MAGIC',
  TUTORIAL_ARMOR = 'TUTORIAL_ARMOR',
  INFO = 'INFO',
  CONFIRM = 'CONFIRM',
}

export interface IModalState {
  section: ModalSection;
  onClose: () => void;
  onConfirm?: () => void;
  text?: string;
}

export interface ISettingsState {
  onClose: () => void;
}

export interface ISaveState {
  onClose: () => void;
}

export interface IMenuState {
  onClose: () => void;
}

export interface AppState {
  sections: AppSection[];
  overworld: IOverworldAppState;
  cutscene: ICutsceneAppState;
  battle: IBattleUiState;
  arcadeGame: IArcadeCabinetState;
  choices: IChoicesState;
  modal: IModalState;
  settings: ISettingsState;
  save: ISaveState;
  menu: IMenuState;
}

export const AppStateInitial: AppState = {
  sections: [AppSection.Debug] as AppSection[],
  overworld: {
    characterText: '',
    prevCharacterText: '',
  },
  cutscene: {
    showBars: true,
    text: '',
    speaker: CutsceneSpeaker.None,
    speakerName: '',
    visible: true,
    portraitLeft: '',
    portraitLeftEmotion: '',
    portraitLeft2: '',
    portraitLeft2Emotion: '',
    portraitRight: '',
    portraitRightEmotion: '',
    portraitRight2: '',
    portraitRight2Emotion: '',
    portraitCenter: '',
    portraitCenterEmotion: '',
  },
  battle: {
    characterIndexSelected: 0,
    targetIndexSelected: 0,
    disabled: false,
    paused: false,
  },
  arcadeGame: {
    path: '',
    isGameRunning: false,
    isGameReady: false,
  },
  choices: {
    choiceTexts: [],
    keyHandlerInternal: () => {},
  },
  modal: {
    section: ModalSection.TUTORIAL_ATTACK,
    onClose: () => {},
  },
  settings: {
    onClose: () => {},
  },
  save: {
    onClose: () => {},
  },
  menu: {
    onClose: () => {},
  },
};
