//* Start Screen
export enum ScreenStateEnums {
  CHECKING = 'CHECKING',
  START = 'START',
  LOADING = 'LOADING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  SETTINGS = 'SETTINGS'
}
export enum ButtonEnums {
  START = 'START',
  CONTINUE = 'CONTINUE',
  BACK = 'BACK',
  STOP = 'STOP'
}
export enum ActionEnums {
  START = 'START',
  CHANGE_SCREEN = 'CHANGE_SCREEN',
  UPDATE_PROGRESS = 'UPDATE_PROGRESS',
  EXPAND_DIV = 'EXPAND_DIV',
  RESET = 'RESET'
}

//* Start Screen Settings
export enum SettingsScreenStateEnums {
  COMMAND = 'COMMAND',
  CONFIGURE = 'CONFIGURE',
  ADVANCE = 'ADVANCE'
}

export enum SettingsActionEnums {
  UPDATE_SCREEN = 'UPDATE_SCREEN',
  RESET = 'RESET'
}

// * response
export enum ResponseStatus {
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}
