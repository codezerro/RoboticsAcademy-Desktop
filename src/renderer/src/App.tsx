import { useEffect, useState } from 'react'
import { TopBar, SpeedDialUtils } from './components'
import './assets/index.css'
import AppClosingWarning from './components/utlits/AppClosingWarning'
import StartScreen from './views/StartScreen'
import { AllCommandConfigureInterface, DatabaseFetching } from './utils/interfaces'
import { ResponseStatus } from './utils/enums'
import { RA_URL } from './constants'

const App = () => {
  const [isAppClosing, setIsAppclosing] = useState<boolean>(false)
  const [content, setContent] = useState(false)
  const [djangoPort, setDjangoPort] = useState<number>(7164)
  const [url, setUrl] = useState<string>(`${RA_URL}${djangoPort}/`)

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const commandConfigIdRes: DatabaseFetching<ResponseStatus, number | null, string[]> =
          await window.api.getActiveCommandId()
        const commandConfigRes: DatabaseFetching<
          ResponseStatus,
          AllCommandConfigureInterface[] | null,
          string[]
        > = await window.api.getAllCommandConfig()

        const command: AllCommandConfigureInterface | null =
          commandConfigRes.data?.find((config) => config.id === commandConfigIdRes.data) || null
        setDjangoPort(command?.django.ports[0] ?? 7164)
        setUrl(`${RA_URL}${command?.django.ports[0] ?? 7164}/`)
      } catch (error) {
        console.log(error)
      }
    }
    fetchPorts()
  }, [djangoPort])

  return (
    <div className="absolute w-screen h-screen rounded-lg">
      {/* top bar */}
      <TopBar setIsAppclosing={setIsAppclosing} />
      {/* Waiting Screen in when window close */}
      {isAppClosing && <AppClosingWarning />}
      {/* Start Screen */}

      {!content && <StartScreen setContent={setContent} setDjangoPort={setDjangoPort} />}
      {/* new screen */}
      <>
        {content && (
          <div className="mt-6 w-full h-[calc(100%-28px)]">
            <iframe
              id={'iframe'}
              style={{
                width: '100%',
                height: '100%'
              }}
              src={url}
            ></iframe>
          </div>
        )}
      </>
      {content && <SpeedDialUtils setContent={setContent} setUrl={setUrl} />}
    </div>
  )
}

export default App
