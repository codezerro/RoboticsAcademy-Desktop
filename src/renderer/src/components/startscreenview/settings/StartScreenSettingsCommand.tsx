import { ChangeEvent, Dispatch, FC, useEffect, useState } from 'react'
import { DeleteIcon, TaskIcon } from '@renderer/assets'
import ButtonWrapper from '@renderer/components/buttons/ButtonWrapper'
import { ResponseStatus, SettingsScreenStateEnums } from '@renderer/utils/enums'
import { SettingsReducerActionTypes } from '@renderer/utils/types'

import { AllDockersImages, TIMER } from '@renderer/constants'
import SettingsCommandTerminal from './SettingsCommandTerminal'
import Loader from '@renderer/components/utlits/Loader'
import { AllCommandConfigureInterface, DatabaseFetching } from '@renderer/utils/interfaces'

interface StartScreenSettinsCommandInterface {
  settingsScreenState: SettingsScreenStateEnums
  dispatch: Dispatch<SettingsReducerActionTypes>
}
const StartScreenSettingsCommand: FC<StartScreenSettinsCommandInterface> = ({}) => {
  // state
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDeleteButtonLoading, setIsDeleteButtonLoading] = useState<boolean>(false)
  const [isUseButtonLoading, setIsUseButtonLoading] = useState<boolean>(false)
  // command state
  const [activeCommandConfigId, setActiveCommandConfigId] = useState<number>(0)
  const [allCommandConfigure, setAllCommandConfigure] = useState<
    AllCommandConfigureInterface[] | []
  >([])

  const [selectedCommandConfig, setSelectedCommandConfig] =
    useState<AllCommandConfigureInterface | null>(null)

  // docker image state
  const [activeDockerImage, setActiveDockerImage] = useState<string>(``)
  //@ts-ignore
  const [allDockerImages, setAllDockerImages] = useState<{}>(AllDockersImages)
  const [selectedDockerImage, setSelectedDockerImage] = useState<string>(``)

  // update and current state
  const [dockerCommand, setDockerCommand] = useState<string>('')
  const [errorMsg, setErroMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  // Fetching data from database
  useEffect(() => {
    setIsLoading(true)
    const fetchingData = async () => {
      try {
        const commandConfigIdRes: DatabaseFetching<ResponseStatus, number | null, string[]> =
          await window.api.getActiveCommandId()
        const commandRes: DatabaseFetching<
          ResponseStatus,
          AllCommandConfigureInterface[] | null,
          string[]
        > = await window.api.getAllCommandConfig()

        const dockerImageRes: DatabaseFetching<ResponseStatus, string | null, string[]> =
          await window.api.getActiveDockerImage()

        if (
          commandRes.status === ResponseStatus.ERROR ||
          commandConfigIdRes.status === ResponseStatus.ERROR ||
          dockerImageRes.status === ResponseStatus.ERROR
        ) {
          setErroMsg(`error while fetching!`)
          return
        }
        setActiveCommandConfigId(commandConfigIdRes.data ?? 1)
        setAllCommandConfigure(commandRes.data ?? [])
        setActiveDockerImage(dockerImageRes.data ?? `noDockerImage`)

        const command: AllCommandConfigureInterface | null =
          commandRes.data?.find((command) => command.id === commandConfigIdRes.data) || null

        setSelectedCommandConfig(command)
        setSelectedDockerImage(dockerImageRes.data ?? `noDockerImage`)
      } catch (error) {
        setErroMsg(`error while fetching!`)
      } finally {
        setIsLoading(false)
        setTimeout(() => {
          setErroMsg(``)
        }, TIMER)
      }
    }
    fetchingData()
  }, [])

  //
  useEffect(() => {
    const buildCommand = () => {
      if (selectedCommandConfig === null) {
        setDockerCommand(``)
        return
      }

      const { command, django, consoles, gazebo, other } = selectedCommandConfig

      const ports = `-p ${django.ports[0]}:${django.ports[1]} -p ${gazebo.ports[0]}:${gazebo.ports[1]} -p ${consoles.ports[0]}:${consoles.ports[1]} -p ${other.ports[0]}:${other.ports[1]}`

      setDockerCommand([command.join(' '), ports, allDockerImages[selectedDockerImage]].join(' '))
    }

    buildCommand()
  }, [selectedDockerImage, selectedCommandConfig])

  // on change func
  const handleChangeDockerImage = (e: ChangeEvent<HTMLSelectElement>) => {
    const dockerImage = e.target.value
    setSelectedDockerImage(dockerImage)

    const command: AllCommandConfigureInterface | null =
      allCommandConfigure.find((config: AllCommandConfigureInterface) => {
        if (dockerImage === `noDockerImage` && config.command.length === 0) return config
        else return config
      }) || null

    setSelectedCommandConfig(command)
  }
  const handleChangeCommandConfig = (e: ChangeEvent<HTMLSelectElement>) => {
    const configId = Number(e.target.value)
    const configure = allCommandConfigure.find((config) => {
      return config.id === configId
    })

    setSelectedCommandConfig(configure != null ? configure : null)
  }

  //! helper func
  const isSelectDisabled = (imageName: string, command: number): boolean => {
    if (imageName === `noDockerImage`) {
      return !(command === 0)
    }
    return command === 0
  }

  const handleUse = async () => {
    if (
      selectedCommandConfig?.id === activeCommandConfigId &&
      selectedDockerImage === activeDockerImage
    )
      return

    try {
      setIsUseButtonLoading(true)
      const updateRes: DatabaseFetching<ResponseStatus, null, string[]> =
        await window.api.updateCommandUtils(selectedCommandConfig?.id || 1, selectedDockerImage)
      if (updateRes.status === ResponseStatus.ERROR) {
        setErroMsg(updateRes.msg[0])
        return
      }

      // save Active state
      setActiveCommandConfigId(selectedCommandConfig?.id || 1)

      // save select state
      setActiveDockerImage(selectedDockerImage)
      // success msg
      setSuccessMsg(`Saved successfully.`)
    } catch (error) {
      setErroMsg(`Something went wrong!`)
    } finally {
      setTimeout(() => {
        setSuccessMsg(``)
        setErroMsg(``)
        setIsUseButtonLoading(false)
      }, TIMER)
    }
  }

  const handleDelete = async () => {
    if (selectedCommandConfig?.default) return

    setIsDeleteButtonLoading(true)
    try {
      const id = selectedCommandConfig?.id ?? -1

      const deleteComfigRes: DatabaseFetching<ResponseStatus, null, string[]> =
        await window.api.deleteCommandConfig(id)
      if (deleteComfigRes.status != ResponseStatus.SUCCESS) {
        setErroMsg(deleteComfigRes.msg[0])
        return
      }
      setAllCommandConfigure((prevCommand) => {
        return prevCommand.filter((command) => {
          return command.id != id
        })
      })

      const newId = allCommandConfigure[0].id
      const activeCommandRes: DatabaseFetching<ResponseStatus, null, string[]> =
        await window.api.updateCommandUtils(newId, activeDockerImage)

      if (activeCommandRes.status != ResponseStatus.SUCCESS) {
        setErroMsg(activeCommandRes.msg[0])
        return
      }

      setActiveCommandConfigId(newId)
      setSelectedCommandConfig(allCommandConfigure[0])
      setSuccessMsg(`configure deleted successfully.`)
    } catch (error) {
      setErroMsg(`Something went wrong!`)
      console.error(error)
    } finally {
      setTimeout(() => {
        setErroMsg(``)
        setSuccessMsg(``)
        setIsDeleteButtonLoading(false)
      }, TIMER)
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center gap-4">
          <Loader>
            <span className="text-base font-normal">loading...</span>
          </Loader>
        </div>
      ) : (
        <div className=" w-full flex flex-col justify-start items-center gap-4">
          {/* select docker */}
          <div className="relative ">
            <label htmlFor="default" className="block mb-2 text-base font-medium text-[#d9d9d9]">
              Select RADI Docker Image :{selectedDockerImage}
            </label>

            <select
              id="docker_image"
              className="w-[400px] h-[40px] bg-white border-gray-300 text-[#454545] text-base rounded-lg focus:ring-red-500 focus:border-red-500 block px-4"
              onChange={(e) => handleChangeDockerImage(e)}
              value={`${selectedDockerImage}`}
            >
              {Object.keys(allDockerImages).map((key, index) => (
                <option value={key} key={index}>
                  {allDockerImages[key]}
                </option>
              ))}
            </select>
          </div>
          {/* selet command  */}

          <div className="relative">
            <label htmlFor="default" className="block mb-2 text-base font-medium text-[#d9d9d9]">
              Select RADI Docker Image
            </label>

            {selectedDockerImage && (
              <select
                id="command"
                className="w-[400px] h-[40px]  bg-white border-gray-300 text-[#454545] text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 px-4 block"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChangeCommandConfig(e)}
                value={selectedCommandConfig != null ? selectedCommandConfig.id : 0}
              >
                {allCommandConfigure.map((command: AllCommandConfigureInterface, index: number) => (
                  <option
                    value={command.id}
                    key={index}
                    disabled={isSelectDisabled(selectedDockerImage, command.command.length)}
                  >
                    {command.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Commands */}
          {dockerCommand.length > 0 && selectedDockerImage != `noDockerImage` && (
            <SettingsCommandTerminal dockerCommand={dockerCommand} />
          )}
          {/* Delete or Use */}
          <div className={`relative w-[400px] flex justify-between items-center`}>
            {!selectedCommandConfig?.default}
            <ButtonWrapper
              cssClass={`${selectedCommandConfig?.default ? `bg-slate-400 cursor-not-allowed` : `bg-red-600`}`}
              onClick={handleDelete}
              isLoading={isDeleteButtonLoading}
              loadingText="deleting..."
            >
              <img src={DeleteIcon} alt="delete icon" className="w-[24px]" />
              <span className="text-[#d9d9d9] font-medium text-lg">Delete</span>
            </ButtonWrapper>

            <ButtonWrapper
              cssClass={`${selectedCommandConfig?.id !== activeCommandConfigId || selectedDockerImage != activeDockerImage ? `bg-green-600` : `bg-gray-400  cursor-not-allowed`} `}
              onClick={handleUse}
              isLoading={isUseButtonLoading}
              loadingText="saving..."
            >
              <img src={TaskIcon} alt="delete icon" className="w-[24px]" />
              <span className="text-[#d9d9d9] font-medium text-lg">Use</span>
            </ButtonWrapper>
          </div>

          {/* show error*/}
          {errorMsg && <div className="mt-4 text-sm text-red-700 font-extralight">{errorMsg}</div>}
          {/* show success*/}
          {successMsg && (
            <div className="mt-4 text-sm text-green-500 font-extralight">{successMsg}</div>
          )}
        </div>
      )}
    </>
  )
}

StartScreenSettingsCommand.propTypes = {}
export default StartScreenSettingsCommand
