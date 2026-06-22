const GA_MEASUREMENT_ID = 'G-NJV1X91RHH'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Send a page view to Google Analytics (SPA route changes). */
export function trackPageView(path: string): void {
  if (typeof window.gtag !== 'function') return
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: path })
}

/** Track client-side navigations after the initial HTML load. */
export function initAnalyticsRouter(router: {
  subscribe: (listener: (state: { location: { pathname: string; search: string } }) => void) => () => void
  state: { location: { pathname: string; search: string } }
}): void {
  const report = (pathname: string, search: string) => {
    trackPageView(pathname + search)
  }

  report(router.state.location.pathname, router.state.location.search)

  router.subscribe(({ location }) => {
    report(location.pathname, location.search)
  })
}
