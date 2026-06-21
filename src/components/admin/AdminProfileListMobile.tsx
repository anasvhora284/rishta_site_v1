import { Box } from '@mui/material'
import AdminProfileListItem from '@/components/admin/AdminProfileListItem'
import type { Profile } from '@/types/profile'
import type { DuplicateAssessment } from '@/utils/profileDuplicate'

interface AdminProfileListMobileProps {
  profiles: Profile[]
  duplicateById: Map<string, DuplicateAssessment>
  onSelect: (profile: Profile) => void
}

export default function AdminProfileListMobile({
  profiles,
  duplicateById,
  onSelect,
}: AdminProfileListMobileProps) {
  return (
    <Box className="admin-profile-list admin-profile-list--mobile">
      {profiles.map((profile) => (
        <AdminProfileListItem
          key={profile.id}
          profile={profile}
          duplicate={duplicateById.get(profile.id)}
          layout="mobile"
          onSelect={onSelect}
        />
      ))}
    </Box>
  )
}
