import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAdminSession, isSuperUserSession } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'

export function useAdminAuth() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(null)
  const [isSuperUser, setIsSuperUser] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const verify = async () => {
      const { data } = await supabase.auth.getSession()
      let session = data.session
      if (session) {
        await supabase.auth.refreshSession()
        const refreshed = await supabase.auth.getSession()
        session = refreshed.data.session ?? session
      }
      if (!isAdminSession(session)) {
        navigate('/admin/login')
      } else {
        setUserId(session!.user.id)
        setIsSuperUser(isSuperUserSession(session))
      }
      setAuthChecked(true)
    }
    void verify()
  }, [navigate])

  return { userId, authReady: authChecked && !!userId, isSuperUser }
}
