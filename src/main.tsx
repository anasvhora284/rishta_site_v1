import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { router } from './App'
import { store } from './duck/store'
import './i18n'
import './index.css'
import './styles/layout.css'
import { initAnalyticsRouter } from './utils/analytics'
import { theme } from './utils/theme'

initAnalyticsRouter(router)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
