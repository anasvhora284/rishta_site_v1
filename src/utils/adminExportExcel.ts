import * as XLSX from 'xlsx'
import type { TFunction } from 'i18next'
import type { Profile } from '@/types/profile'
import { calculateAge, displayCity } from '@/utils'
import { formatAdminDate } from '@/components/admin/adminTypes'
import { formatLocalizedQualificationDisplay } from '@/utils/qualificationNormalize'
import { localizedName, type LocalizedLabel } from '@/utils/localizeReference'

function isHiddenFromBrowse(profile: Profile): boolean {
  if (profile.is_test) return true
  return (profile.admin_notes ?? '').toLowerCase().includes('hidden from browse')
}

export type ExportScope = 'all' | 'approved' | 'pending' | 'rejected' | 'hidden' | 'filtered'

export interface AdminExportOptions {
  profiles: Profile[]
  allProfiles?: Profile[]
  language: 'gu' | 'en'
  scope: ExportScope
  cityMap?: Map<string, LocalizedLabel>
  qualificationMap?: Map<string, LocalizedLabel>
  subCastMap?: Map<string, LocalizedLabel>
  adminNameMap?: Map<string, string>
  t: TFunction
}

interface ColumnDef {
  key: string
  labelGu: string
  labelEn: string
  width: number
}

const EXCEL_COLUMNS: ColumnDef[] = [
  { key: 'profile_id', labelGu: 'પ્રોફાઇલ ID', labelEn: 'Profile ID', width: 14 },
  { key: 'name', labelGu: 'પૂરું નામ', labelEn: 'Full Name', width: 28 },
  { key: 'gender', labelGu: 'જાતિ', labelEn: 'Gender', width: 12 },
  { key: 'date_of_birth', labelGu: 'જન્મ તારીખ', labelEn: 'Date of Birth', width: 15 },
  { key: 'age', labelGu: 'ઉંમર (વર્ષ)', labelEn: 'Age (Years)', width: 12 },
  { key: 'marital_status', labelGu: 'મેરિટલ સ્ટેટસ', labelEn: 'Marital Status', width: 16 },
  { key: 'height', labelGu: 'ઊંચાઈ', labelEn: 'Height', width: 12 },
  { key: 'weight_other', labelGu: 'વજન / અન્ય વિગત', labelEn: 'Weight / Other Details', width: 20 },
  { key: 'qualification', labelGu: 'ક્વોલિફિકેશન', labelEn: 'Qualification', width: 26 },
  { key: 'education_category', labelGu: 'શિક્ષણ કેટેગરી', labelEn: 'Education Category', width: 20 },
  { key: 'current_profile', labelGu: 'હાલની પ્રોફાઇલ / વ્યવસાય', labelEn: 'Occupation / Profession', width: 28 },
  { key: 'city', labelGu: 'શહેર', labelEn: 'City', width: 20 },
  { key: 'sub_cast', labelGu: 'અટક', labelEn: 'Sub Caste / Atak', width: 18 },
  { key: 'father_name', labelGu: 'પિતાનું નામ', labelEn: 'Father Name', width: 26 },
  { key: 'father_occupation', labelGu: 'પિતાનો વ્યવસાય', labelEn: 'Father Occupation', width: 26 },
  { key: 'mother_name', labelGu: 'માતાનું નામ', labelEn: 'Mother Name', width: 26 },
  { key: 'parent_contact', labelGu: 'સંપર્ક નંબર (WhatsApp)', labelEn: 'Contact Phone', width: 22 },
  { key: 'expectations', labelGu: 'અપેક્ષાઓ', labelEn: 'Expectations', width: 36 },
  { key: 'status', labelGu: 'સ્ટેટસ', labelEn: 'Status', width: 14 },
  { key: 'visibility', labelGu: 'બ્રાઉઝ સ્થિતિ', labelEn: 'Browse Visibility', width: 22 },
  { key: 'created_at', labelGu: 'સબમિશન તારીખ', labelEn: 'Submitted Date', width: 18 },
  { key: 'approved_at', labelGu: 'મંજૂરી તારીખ', labelEn: 'Approved Date', width: 18 },
  { key: 'acted_by', labelGu: 'મંજૂર / રિજેક્ટ કરનાર', labelEn: 'Approved / Acted By Admin', width: 24 },
  { key: 'admin_notes', labelGu: 'એડમિન નોટ્સ / રિજેક્ટ કારણ', labelEn: 'Admin Notes', width: 32 },
]

export function formatProfileRow(
  profile: Profile,
  lng: 'gu' | 'en',
  options: {
    cityMap?: Map<string, LocalizedLabel>
    qualificationMap?: Map<string, LocalizedLabel>
    subCastMap?: Map<string, LocalizedLabel>
    adminNameMap?: Map<string, string>
    t: TFunction
  },
): Record<string, string | number> {
  const { cityMap, qualificationMap, subCastMap, adminNameMap, t } = options
  const isGu = lng === 'gu'

  // Gender
  const gender = profile.gender === 'male' ? (isGu ? 'છોકરો' : 'Male') : isGu ? 'છોકરી' : 'Female'

  // Age
  let age: number | '' = ''
  try {
    if (profile.date_of_birth) {
      age = calculateAge(profile.date_of_birth)
    }
  } catch {
    age = ''
  }

  // Marital status
  let marital = ''
  if (profile.marital_status) {
    if (isGu) {
      marital = t(`marital.${profile.marital_status}`) || profile.marital_status
    } else {
      switch (profile.marital_status) {
        case 'unmarried':
          marital = 'Unmarried'
          break
        case 'divorce':
          marital = 'Divorce'
          break
        case 'widowed':
          marital = 'Widowed'
          break
        default:
          marital = profile.marital_status
      }
    }
  }

  // Qualification
  const qualification = qualificationMap
    ? formatLocalizedQualificationDisplay(profile, lng, qualificationMap, t)
    : profile.qualification || ''

  // City
  const city = displayCity(profile, { cityMap, lng })

  // Sub Cast
  const subCastRecord = subCastMap?.get(profile.sub_cast)
  const subCast = subCastRecord ? localizedName(subCastRecord, lng, profile.sub_cast) : profile.sub_cast || ''

  // Status
  let status = ''
  switch (profile.status) {
    case 'approved':
      status = isGu ? 'અપ્રૂવ્ડ' : 'Approved'
      break
    case 'pending':
      status = isGu ? 'પેન્ડિંગ' : 'Pending'
      break
    case 'rejected':
      status = isGu ? 'રિજેક્ટેડ' : 'Rejected'
      break
    default:
      status = profile.status
  }

  // Hidden / Visibility
  const hidden = isHiddenFromBrowse(profile)
  const visibility = hidden
    ? isGu
      ? 'હિડન (છુપાયેલ)'
      : 'Hidden from browse'
    : isGu
      ? 'બ્રાઉઝ પર ઉપલબ્ધ'
      : 'Visible on browse'

  // Admin Acted By
  const actedByName = profile.approved_by
    ? adminNameMap?.get(profile.approved_by) || (isGu ? 'એડમિન' : 'Admin')
    : ''

  const rowData: Record<string, string | number> = {}

  for (const col of EXCEL_COLUMNS) {
    const colHeader = isGu ? col.labelGu : col.labelEn
    let val: string | number = ''

    switch (col.key) {
      case 'profile_id':
        val = profile.profile_id != null ? profile.profile_id : ''
        break
      case 'name':
        val = profile.name || ''
        break
      case 'gender':
        val = gender
        break
      case 'date_of_birth':
        val = profile.date_of_birth || ''
        break
      case 'age':
        val = age
        break
      case 'marital_status':
        val = marital
        break
      case 'height':
        val = profile.height || ''
        break
      case 'weight_other':
        val = profile.weight_other || ''
        break
      case 'qualification':
        val = qualification
        break
      case 'education_category':
        val = profile.education_category || ''
        break
      case 'current_profile':
        val = profile.current_profile || ''
        break
      case 'city':
        val = city
        break
      case 'sub_cast':
        val = subCast
        break
      case 'father_name':
        val = profile.father_name || ''
        break
      case 'father_occupation':
        val = profile.father_occupation || ''
        break
      case 'mother_name':
        val = profile.mother_name || ''
        break
      case 'parent_contact':
        val = profile.parent_contact ? String(profile.parent_contact).trim() : ''
        break
      case 'expectations':
        val = profile.expectations ? profile.expectations.trim() : ''
        break
      case 'status':
        val = status
        break
      case 'visibility':
        val = visibility
        break
      case 'created_at':
        val = profile.created_at ? formatAdminDate(profile.created_at) : ''
        break
      case 'approved_at':
        val = profile.approved_at ? formatAdminDate(profile.approved_at) : ''
        break
      case 'acted_by':
        val = actedByName
        break
      case 'admin_notes':
        val = profile.admin_notes ? profile.admin_notes.trim() : ''
        break
    }

    rowData[colHeader] = val
  }

  return rowData
}

function buildWorksheet(rows: Record<string, string | number>[]): XLSX.WorkSheet {
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = EXCEL_COLUMNS.map((c) => ({ wch: c.width }))
  return ws
}

export function saveWorkbookFile(wb: XLSX.WorkBook, filename: string): void {
  try {
    XLSX.writeFile(wb, filename)
  } catch {
    // Browser fallback
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 150)
  }
}

export function exportProfilesToExcel(options: AdminExportOptions): { success: boolean; filename: string; count: number } {
  const {
    profiles,
    allProfiles,
    language,
    scope,
    cityMap,
    qualificationMap,
    subCastMap,
    adminNameMap,
    t,
  } = options

  const isGu = language === 'gu'
  const rowHelperOpts = { cityMap, qualificationMap, subCastMap, adminNameMap, t }

  const wb = XLSX.utils.book_new()
  const today = new Date().toISOString().slice(0, 10)

  // Scope label for filename
  let filenameScope = 'Profiles'
  switch (scope) {
    case 'approved':
      filenameScope = 'Approved'
      break
    case 'pending':
      filenameScope = 'Pending'
      break
    case 'rejected':
      filenameScope = 'Rejected'
      break
    case 'hidden':
      filenameScope = 'Hidden'
      break
    case 'filtered':
      filenameScope = 'Filtered'
      break
    case 'all':
      filenameScope = 'All'
      break
  }

  const filename = `68_Samaj_Rishta_${filenameScope}_${today}.xlsx`

  if (scope === 'all' && allProfiles && allProfiles.length > 0) {
    // When exporting 'all', create sheets:
    // 1. All Profiles
    // 2. Approved
    // 3. Pending
    // 4. Rejected
    // 5. Hidden
    const allRows = allProfiles.map((p) => formatProfileRow(p, language, rowHelperOpts))
    const mainSheetName = isGu ? 'તમામ પ્રોફાઇલ્સ' : 'All Profiles'
    XLSX.utils.book_append_sheet(wb, buildWorksheet(allRows), mainSheetName)

    const approvedList = allProfiles.filter((p) => p.status === 'approved' && !isHiddenFromBrowse(p))
    if (approvedList.length > 0) {
      const approvedRows = approvedList.map((p) => formatProfileRow(p, language, rowHelperOpts))
      XLSX.utils.book_append_sheet(wb, buildWorksheet(approvedRows), isGu ? 'અપ્રૂવ્ડ' : 'Approved')
    }

    const pendingList = allProfiles.filter((p) => p.status === 'pending' && !isHiddenFromBrowse(p))
    if (pendingList.length > 0) {
      const pendingRows = pendingList.map((p) => formatProfileRow(p, language, rowHelperOpts))
      XLSX.utils.book_append_sheet(wb, buildWorksheet(pendingRows), isGu ? 'પેન્ડિંગ' : 'Pending')
    }

    const rejectedList = allProfiles.filter((p) => p.status === 'rejected' && !isHiddenFromBrowse(p))
    if (rejectedList.length > 0) {
      const rejectedRows = rejectedList.map((p) => formatProfileRow(p, language, rowHelperOpts))
      XLSX.utils.book_append_sheet(wb, buildWorksheet(rejectedRows), isGu ? 'રિજેક્ટેડ' : 'Rejected')
    }

    const hiddenList = allProfiles.filter((p) => isHiddenFromBrowse(p))
    if (hiddenList.length > 0) {
      const hiddenRows = hiddenList.map((p) => formatProfileRow(p, language, rowHelperOpts))
      XLSX.utils.book_append_sheet(wb, buildWorksheet(hiddenRows), isGu ? 'હિડન' : 'Hidden')
    }

    saveWorkbookFile(wb, filename)
    return { success: true, filename, count: allProfiles.length }
  }

  // Single sheet export for specific scope or filtered selection
  const rows = profiles.map((p) => formatProfileRow(p, language, rowHelperOpts))
  let sheetName = isGu ? 'પ્રોફાઇલ્સ' : 'Profiles'
  switch (scope) {
    case 'approved':
      sheetName = isGu ? 'અપ્રૂવ્ડ પ્રોફાઇલ્સ' : 'Approved Profiles'
      break
    case 'pending':
      sheetName = isGu ? 'પેન્ડિંગ પ્રોફાઇલ્સ' : 'Pending Profiles'
      break
    case 'rejected':
      sheetName = isGu ? 'રિજેક્ટેડ પ્રોફાઇલ્સ' : 'Rejected Profiles'
      break
    case 'hidden':
      sheetName = isGu ? 'હિડન પ્રોફાઇલ્સ' : 'Hidden Profiles'
      break
    case 'filtered':
      sheetName = isGu ? 'ફિલ્ટર કરેલ પ્રોફાઇલ્સ' : 'Filtered Profiles'
      break
  }

  XLSX.utils.book_append_sheet(wb, buildWorksheet(rows), sheetName)
  saveWorkbookFile(wb, filename)

  return { success: true, filename, count: profiles.length }
}
