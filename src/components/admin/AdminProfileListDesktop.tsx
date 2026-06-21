import { Box } from '@mui/material'
import AdminProfileListItem from '@/components/admin/AdminProfileListItem'
import type { Profile } from '@/types/profile'
import type { DuplicateAssessment } from '@/utils/profileDuplicate'

interface AdminProfileListDesktopProps {
  profiles: Profile[]
  duplicateById: Map<string, DuplicateAssessment>
  selectedId: string | null
  onSelect: (profile: Profile) => void
}

export default function AdminProfileListDesktop({
  profiles,
  duplicateById,
  selectedId,
  onSelect,
}: AdminProfileListDesktopProps) {
  return (
    <Box className="admin-profile-list admin-profile-list--desktop">
      {profiles.map((profile) => (
        <AdminProfileListItem
          key={profile.id}
          profile={profile}
          duplicate={duplicateById.get(profile.id)}
          selected={selectedId === profile.id}
          layout="desktop"
          onSelect={onSelect}
        />
      ))}
    </Box>
  )
}
