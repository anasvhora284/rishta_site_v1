import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import SiteNavbar from '@/components/SiteNavbar'
import {
  TeamSectionPlanA,
  TeamSectionPlanB,
  TeamSectionPlanC,
} from '@/components/team/TeamSectionVariants'
import '@/pages/Browse/Filter.css'
import './TeamDesignPreviewPage.css'

const OPTIONS = [
  { id: 'a', Component: TeamSectionPlanA, titleKey: 'teamPreview.planA.title', descKey: 'teamPreview.planA.desc' },
  { id: 'b', Component: TeamSectionPlanB, titleKey: 'teamPreview.planB.title', descKey: 'teamPreview.planB.desc' },
  { id: 'c', Component: TeamSectionPlanC, titleKey: 'teamPreview.planC.title', descKey: 'teamPreview.planC.desc' },
] as const

export default function TeamDesignPreviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.background = '#DBE3F0'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container team-preview-page">
        <SiteNavbar showBack onBack={() => navigate('/')} />

        <div className="page-content-zone">
          <div className="team-preview-page__intro">
            <h1>{t('teamPreview.title')}</h1>
            <p>{t('teamPreview.intro')}</p>
          </div>

          {OPTIONS.map(({ id, Component, titleKey, descKey }) => (
            <section key={id} className="team-preview-option" aria-labelledby={`team-preview-${id}-title`}>
              <span className="team-preview-option__label">{t('teamPreview.optionLabel', { id: id.toUpperCase() })}</span>
              <h2 id={`team-preview-${id}-title`} className="team-preview-option__title">
                {t(titleKey)}
              </h2>
              <p className="team-preview-option__desc">{t(descKey)}</p>
              <Component />
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
