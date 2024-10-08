import { FC, useReducer } from 'react'
import { SettingsInitialStateInterface } from '@renderer/utils/interfaces'
import { SettingsActionEnums, SettingsScreenStateEnums } from '@renderer/utils/enums'
import { SettingsReducerActionTypes } from '@renderer/utils/types'
import {
  StartScreenSettingsSidebar,
  StartScreenSettingsCommand,
  StartScreenSettingsConfigure,
  StartScreenSettingsAdvance
} from '@renderer/components/index'

interface StartScreenSettingsInterface {}

const settingsInitialState: SettingsInitialStateInterface = {
  settingsScreenState: SettingsScreenStateEnums.COMMAND
}

const reducer = (state: SettingsInitialStateInterface, action: SettingsReducerActionTypes) => {
  switch (action.type) {
    case SettingsActionEnums.UPDATE_SCREEN:
      return {
        ...state,
        settingsScreenState: action.payload.settingsScreenState
      }
    case SettingsActionEnums.RESET:
      return { ...settingsInitialState }
    default:
      throw new Error('Unkown Action')
  }
}

const StartScreenSettings: FC<StartScreenSettingsInterface> = ({}) => {
  const [{ settingsScreenState }, dispatch] = useReducer(reducer, settingsInitialState)
  return (
    <div className={`w-full h-full flex`}>
      {/* sidebar */}
      <StartScreenSettingsSidebar settingsScreenState={settingsScreenState} dispatch={dispatch} />
      {/* main input section */}
      <div
        className={`w-[calc(100%-142px)]  h-[508px]  flex justify-center ${SettingsScreenStateEnums.ADVANCE === settingsScreenState ? `mt-[36px]` : `mt-[36px]`} `}
      >
        <div className={`h-full w-[400px]`}>
          {settingsScreenState === SettingsScreenStateEnums.COMMAND && (
            <StartScreenSettingsCommand
              settingsScreenState={settingsScreenState}
              dispatch={dispatch}
            />
          )}
          {settingsScreenState === SettingsScreenStateEnums.CONFIGURE && (
            <StartScreenSettingsConfigure />
          )}
          {settingsScreenState === SettingsScreenStateEnums.ADVANCE && (
            <StartScreenSettingsAdvance
              settingsScreenState={settingsScreenState}
              dispatch={dispatch}
            />
          )}
        </div>
      </div>
    </div>
  )
}
StartScreenSettings.propTypes = {}
export default StartScreenSettings
