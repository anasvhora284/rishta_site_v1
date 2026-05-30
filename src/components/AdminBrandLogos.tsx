import samajLogo from '@/assets/SplashScreenLogo.png'
import rishtaLogo from '@/assets/samajRishta.png'
import './AdminBrandLogos.css'

interface AdminBrandLogosProps {
  size?: 'sm' | 'md'
}

export default function AdminBrandLogos({ size = 'md' }: AdminBrandLogosProps) {
  return (
    <div className={`admin-brand-logos admin-brand-logos--${size}`}>
      <div className="admin-brand-logos__circle">
        <img src={samajLogo} alt="" className="admin-brand-logos__img" />
      </div>
      <div className="admin-brand-logos__circle">
        <img src={rishtaLogo} alt="" className="admin-brand-logos__img" />
      </div>
    </div>
  )
}
