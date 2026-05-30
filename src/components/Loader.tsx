import { useTranslation } from 'react-i18next'
import './Loader.css'

type LoaderProps = {
  /** fullscreen = filter/auth boot; inline = admin list refresh */
  variant?: 'fullscreen' | 'inline'
}

export default function Loader({ variant = 'fullscreen' }: LoaderProps) {
  const { t } = useTranslation()
  const fullscreen = variant === 'fullscreen'
  const message = fullscreen ? t('loader.welcome') : t('common.loading')

  return (
    <div
      className={`loader-screen ${fullscreen ? 'loader-screen--fullscreen' : 'loader-screen--inline'}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loader-screen__stack">
        <div className="loader-hearts" aria-hidden="true">
          <div className="cssload-main">
            <div className="cssload-heart">
              <span className="cssload-heartL" />
              <span className="cssload-heartR" />
              <span className="cssload-square" />
            </div>
            <div className="cssload-shadow" />
          </div>
        </div>
        <p className="loader-screen__message">{message}</p>
      </div>
    </div>
  )
}
