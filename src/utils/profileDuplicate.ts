import type { Profile } from '@/types/profile'
import {
  exactMatchKey,
  nameDobKey,
  namePhoneKey,
  profileMatchKeys,
  type ProfileMatchKeys,
} from '@/utils/profileMatch'

export type DuplicateLevel = 'new' | 'exact' | 'name_dob' | 'name_phone'

export interface DuplicateMatch {
  profile: Profile
  level: Exclude<DuplicateLevel, 'new'>
  reasons: string[]
}

export interface DuplicateAssessment {
  level: DuplicateLevel
  matches: DuplicateMatch[]
}

const LEVEL_RANK: Record<DuplicateLevel, number> = {
  exact: 4,
  name_dob: 3,
  name_phone: 2,
  new: 0,
}

const STATUS_RANK: Record<Profile['status'], number> = {
  approved: 3,
  pending: 2,
  rejected: 1,
}

function compareMatches(a: DuplicateMatch, b: DuplicateMatch): number {
  const levelDiff = LEVEL_RANK[b.level] - LEVEL_RANK[a.level]
  if (levelDiff !== 0) return levelDiff
  const statusDiff = STATUS_RANK[b.profile.status] - STATUS_RANK[a.profile.status]
  if (statusDiff !== 0) return statusDiff
  const idA = a.profile.profile_id ?? 0
  const idB = b.profile.profile_id ?? 0
  return idB - idA
}

/** Only approved live profiles should receive merged data. */
export function isMergeTarget(profile: Profile): boolean {
  return profile.status === 'approved'
}

export function mergeEligibleMatches(assessment: DuplicateAssessment): DuplicateMatch[] {
  return assessment.matches.filter((m) => isMergeTarget(m.profile))
}

function matchLevel(candidate: ProfileMatchKeys, other: ProfileMatchKeys): DuplicateLevel {
  if (exactMatchKey(candidate) === exactMatchKey(other)) return 'exact'
  if (nameDobKey(candidate) === nameDobKey(other)) return 'name_dob'
  if (
    candidate.phoneNorm &&
    other.phoneNorm &&
    namePhoneKey(candidate) === namePhoneKey(other)
  ) {
    return 'name_phone'
  }
  return 'new'
}

function reasonsForLevel(level: Exclude<DuplicateLevel, 'new'>): string[] {
  switch (level) {
    case 'exact':
      return ['Same name, date of birth, phone, father, and city']
    case 'name_dob':
      return ['Same name and date of birth']
    case 'name_phone':
      return ['Same name and phone number']
  }
}

export function assessDuplicate(candidate: Profile, corpus: Profile[]): DuplicateAssessment {
  const candidateKeys = profileMatchKeys(candidate)
  const matches: DuplicateMatch[] = []

  for (const profile of corpus) {
    if (profile.id === candidate.id) continue
    const level = matchLevel(candidateKeys, profileMatchKeys(profile))
    if (level === 'new') continue
    matches.push({
      profile,
      level,
      reasons: reasonsForLevel(level),
    })
  }

  matches.sort(compareMatches)

  if (!matches.length) return { level: 'new', matches: [] }

  return { level: matches[0].level, matches }
}

export function preferredMergeTarget(assessment: DuplicateAssessment | null): Profile | null {
  if (!assessment?.matches.length) return null
  return mergeEligibleMatches(assessment)[0]?.profile ?? null
}

export function bestDuplicateMatch(assessment: DuplicateAssessment): DuplicateMatch | null {
  return assessment.matches[0] ?? null
}

export function hasDuplicateMatches(assessment: DuplicateAssessment | null | undefined): boolean {
  return !!assessment && assessment.level !== 'new' && assessment.matches.length > 0
}

export function profileFieldDiff(
  a: Profile,
  b: Profile,
): { field: string; before: string; after: string }[] {
  const pairs: { field: string; a: string; b: string }[] = [
    { field: 'name', a: a.name, b: b.name },
    { field: 'gender', a: a.gender, b: b.gender },
    { field: 'qualification', a: a.qualification, b: b.qualification },
    { field: 'current_profile', a: a.current_profile, b: b.current_profile },
    { field: 'father_name', a: a.father_name, b: b.father_name },
    { field: 'father_occupation', a: a.father_occupation, b: b.father_occupation },
    { field: 'mother_name', a: a.mother_name, b: b.mother_name },
    { field: 'city', a: a.city, b: b.city },
    { field: 'city_other', a: a.city_other ?? '', b: b.city_other ?? '' },
    { field: 'date_of_birth', a: a.date_of_birth, b: b.date_of_birth },
    { field: 'marital_status', a: a.marital_status, b: b.marital_status },
    { field: 'height', a: a.height, b: b.height },
    { field: 'weight_other', a: a.weight_other, b: b.weight_other },
    { field: 'parent_contact', a: a.parent_contact, b: b.parent_contact },
    { field: 'sub_cast', a: a.sub_cast, b: b.sub_cast },
  ]

  return pairs
    .filter(({ a: va, b: vb }) => va.trim() !== vb.trim())
    .map(({ field, a: before, b: after }) => ({ field, before, after }))
}
