export type ProfileStatus = 'pending' | 'approved' | 'rejected'

export type Gender = 'male' | 'female'
export type MaritalStatus = 'unmarried' | 'divorce' | 'widowed'

export interface Profile {
  id: string
  profile_id: number | null
  name: string
  gender: Gender
  qualification: string
  qualification_other: string | null
  current_profile: string
  father_name: string
  father_occupation: string
  mother_name: string
  city: string
  city_other: string | null
  date_of_birth: string
  marital_status: MaritalStatus
  height: string
  weight_other: string
  parent_contact: string
  sub_cast: string
  education_category: string | null
  status: ProfileStatus
  is_test?: boolean
  admin_notes: string | null
  created_at: string
  approved_at: string | null
  approved_by: string | null
}

export interface ProfileFormData {
  name: string
  gender: Gender | ''
  qualification: string
  qualification_other: string
  current_profile: string
  father_name: string
  father_occupation: string
  mother_name: string
  city: string
  city_other: string
  date_of_birth: string
  marital_status: MaritalStatus | ''
  height: string
  weight_other: string
  parent_contact: string
  sub_cast: string
}

export interface FilterState {
  fromAge: string
  toAge: string
  gender: Gender | ''
  qualification: string[]
  city: string[]
  maritalStatus: string[]
}

export const QUALIFICATIONS = [
  '10th',
  '12th',
  'Bachelor',
  'Diploma',
  'Engineering',
  'Master',
  'Medical',
  'Other',
] as const

export const CITIES = [
  'AHMEDABAD', 'AJARPURA', 'ALARSA', 'ANAND', 'ASOJ', 'Ajarpura', 'Anklav',
  'BAHIYAL', 'BHADARVA', 'BHALEJ', 'BHARUCH', 'BORSAD', 'Borsad', 'CHANGA',
  'DAKOR', 'DUBAI', 'GANDHINAGAR', 'Gana', 'KANIJ', 'KAPADWANJ', 'KASOR',
  'KATHLAL', 'KHAMBHAT', 'KHANDHLI', 'KHEDA', 'KOSINDRA', 'Kalsar (dakor)',
  'Khambhat', 'MAHEMDAVAD', 'MAHESANA', 'MAHUDHA', 'MALAVADA', 'MANDVI',
  'MUMBAI', 'Mahemdavad', 'NADIAD', 'NAPA', 'NAVSARI', 'Navli', 'Not Provided',
  'OD', 'PADRA', 'PETLAD', 'PIPLAG', 'RAS', 'SANJAN', 'SEVALIYA', 'SOJITRA',
  'SURAT', 'SURELI', 'Salun', 'TARAPUR', 'THASRA', 'UMETHA', 'UMRETH', 'USA',
  'UTTARSANDA', 'VADODARA', 'VALASAN', 'VANSOL', 'VASAD', 'VASNA', 'VASO',
  'VIRSAD', 'Virar (Mumbai)- Maharashtra', 'Wakaner', 'Other',
] as const

export const TEAM_CONTACTS = {
  chief: { name: 'Nurulhasan Vohra', phone: '9825090992' },
  social: [
    { name: 'Salimbhai Vhora (Mahemdabad)', phone: '9427084786' },
    { name: 'Altafbhai Vhora (LIC)', phone: '9428660790' },
    { name: 'Ilyasbhai Vhora (Chemical)', phone: '9574668782' },
    { name: 'Idrishbhai Vhora (Mahudha)', phone: '9825853404' },
    { name: 'Samirbhai Vhora (Boriyavi)', phone: '7016288489' },
    { name: 'Mo.Shafibhai Vhora (Nadiad)', phone: '9723113658' },
    { name: 'Dr.Sarfaraz Mansuri', phone: '7383344881' },
    { name: 'Haji Ismailbhai Vhora (Dabhan)', phone: '9723786001' },
  ],
  it: [
    { name: 'Mo.Shafibhai Vhora (Nadiad)', phone: '9723113658' },
    { name: 'Dr.Sarfaraz Mansuri', phone: '7383344881' },
    { name: 'Mo.Ayaz Salimbhai Vhora', phone: '7990484682' },
    { name: 'Anas Salimbhai Vhora', phone: '7041317915' },
    { name: 'Maaz Vhora', phone: '' },
    { name: 'Faizal Vhora', phone: '' },
  ],
}
