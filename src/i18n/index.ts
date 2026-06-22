import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import gu from '@/locales/gu.json'
import en from '@/locales/en.json'

const savedRaw = localStorage.getItem('rishta-lang') ?? 'gu'
const savedLang = savedRaw === 'hi' ? 'gu' : savedRaw

i18n.use(initReactI18next).init({
  resources: {
    gu: { translation: gu },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'gu',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('rishta-lang', lng)
  document.documentElement.lang = lng
})

export default i18n
