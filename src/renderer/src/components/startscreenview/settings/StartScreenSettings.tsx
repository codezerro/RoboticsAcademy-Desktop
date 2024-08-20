import { FC, useReducer } from 'react'
import { SettingsInitialStateInterface } from '@renderer/utils/interfaces'
import { SettingsActionEnums, SettingsScreenStateEnums } from '@renderer/utils/enums'
import { SettingsReducerActionTypes } from '@renderer/utils/types'
import {
  StartScreenSettingsSidebar,
  StartScreenSettinsCommand,
  StartScreenSettingsConfigure,
  StartScreenSettinsAdvance
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
        className={`w-[calc(100%-142px)]  h-[508px] xxbg-red-600  mt-[68px] flex justify-center`}
      >
        <div className={`h-full w-[400px]`}>
          {settingsScreenState === SettingsScreenStateEnums.COMMAND && (
            <StartScreenSettinsCommand
              settingsScreenState={settingsScreenState}
              dispatch={dispatch}
            />
          )}
          {settingsScreenState === SettingsScreenStateEnums.CONFIGURE && (
            <StartScreenSettingsConfigure
              settingsScreenState={settingsScreenState}
              dispatch={dispatch}
            />
          )}
          {settingsScreenState === SettingsScreenStateEnums.ADVANCE && (
            <StartScreenSettinsAdvance
              settingsScreenState={settingsScreenState}
              dispatch={dispatch}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default StartScreenSettings
