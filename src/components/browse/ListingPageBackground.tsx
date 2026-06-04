import './ListingPageBackground.css'

/** Layered brand background for profile listing (no photo tile). */
export default function ListingPageBackground() {
  return (
    <div className="listing-page-bg" aria-hidden>
      <div className="listing-page-bg__base" />
      <div className="listing-page-bg__glow listing-page-bg__glow--gold" />
      <div className="listing-page-bg__glow listing-page-bg__glow--rose" />
      <div className="listing-page-bg__glow listing-page-bg__glow--deep" />
      <div className="listing-page-bg__pattern" />
      <div className="listing-page-bg__vignette" />
    </div>
  )
}
