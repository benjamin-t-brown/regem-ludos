import { ArcadeGamePath } from 'view/components/ArcadeCabinet';

export enum AppSection {
  BattleUI = 'battleMenu',
  BattleVictory = 'battleVictory',
  BattleDefeated = 'battleDefeated',
  Cutscene = 'cutscene',
  Debug = 'debug',
  ArcadeCabinet = 'arcadeCabinet',
  Choices = 'choices',
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
}

export interface AppState {
  sections: AppSection[];
  cutscene: ICutsceneAppState;
  battle: {
    chButtonsEnabled: boolean;
  };
  arcadeGame: IArcadeCabinetState;
  choices: IChoicesState;
}

export const AppStateInitial: AppState = {
  sections: [AppSection.Debug] as AppSection[],
  cutscene: {
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
    chButtonsEnabled: true,
  },
  arcadeGame: {
    path: '',
    isGameRunning: false,
    isGameReady: false,
  },
  choices: {
    choiceTexts: [],
  },
};
