/**
 * Rebuild cities / sub_casts / qualifications reference tables in Supabase.
 * Usage: npm run rebuild-reference-data
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { CANONICAL_CITIES, CITY_ALIASES_TO_CODE } from '../src/data/canonical-cities'
import { CANONICAL_QUALIFICATIONS } from '../src/data/canonical-qualifications'

/** Romanized English labels for peta atak (sub-cast). */
const SUB_CAST_EN: Record<string, string> = {
  મહેમદાવાદી: 'Mehmadavi',
  બોરસદા: 'Borsada',
  પેટલાદી: 'Petladi',
  ખંભાતી: 'Khambhati',
  માતાવાડીયા: 'Matavadiya',
  કાસરા: 'Kasra',
  કાનમા: 'Kanma',
  કકડીયા: 'Kakadiya',
  કરોલીયા: 'Karoliya',
  કોટીયા: 'Kotiya',
  કાનોહરીયા: 'Kanohariya',
  કોસંદ્રીયા: 'Kosandriya',
  ખડોલા: 'Khadola',
  ખેડીયા: 'Khediya',
  ગાનીયા: 'Ganiya',
  ચુડેલા: 'Chudela',
  ચાંગીયા: 'Changiya',
  ગરોરીયા: 'Garoriya',
  ડાકોરીયા: 'Dakoriya',
  ડેમોલા: 'Demola',
  કુમસાલા: 'Kumsala',
  નારીયા: 'Nariya',
  નાપીયા: 'Napiya',
  નાવલીયા: 'Navaliya',
  નીસરાયા: 'Nisaraya',
  પેટલીયા: 'Petliya',
  ફીશાયા: 'Fishaya',
  બારૈયા: 'Baraiya',
  બાકરોલા: 'Bakarola',
  ભાલોડીયા: 'Bhalodiya',
  માંગરોલા: 'Mangarola',
  માતરીયા: 'Matariya',
  માંડડીયા: 'Mandadiya',
  મધુડીયા: 'Madhudiya',
  મોરશા: 'Morsha',
  રામોલા: 'Ramola',
  રૂપાલા: 'Rupala',
  લાંભેલા: 'Lambhela',
  લાખપીરીયા: 'Lakhpiriya',
  વસોયા: 'Vasoya',
  વઘાસોલા: 'Vaghasola',
  વડોલીયા: 'Vadoliya',
  વડુકડીયા: 'Vadukadiya',
  વાસથીયા: 'Vasthiya',
  વાંકવડીયા: 'Vankvadiya',
  વિંછીયા: 'Vinchhiya',
  શીજોલા: 'Shijola',
  સરસપુરીયા: 'Sarsapuriya',
  સંગયા: 'Sangya',
  સુંગયા: 'Sungya',
  અડાસીયા: 'Adasiya',
  અસાલાલીયા: 'Asalaliya',
  અજરુપુરીયા: 'Ajarupuriya',
  અસાલીયા: 'Asaliya',
  આમડોલા: 'Amdola',
  અમોટીયા: 'Amotiya',
  ઓડીયા: 'Odiya',
  ઉમરેઠા: 'Umretha',
  ઉત્તરસંડીયા: 'Uttarsandiya',
  કડવાલા: 'Kadvala',
  ગાડીયા: 'Gadiya',
  લવાળા: 'Lavala',
  બચેલા: 'Bachela',
  મહીડીયા: 'Mahidiya',
  વાસાથીયા: 'Vasathiya',
  નરસાથીયા: 'Narsathiya',
  અગીયાવાળા: 'Agiyavala',
  માણેજ: 'Manej',
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''")
}

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  // --- Cities table ---
  const cityRows = CANONICAL_CITIES.map((c, i) => ({
    name: c.code,
    name_en: c.nameEn,
    name_gu: c.nameGu,
    sort_order: i + 1,
  }))

  const { error: citiesDeleteError } = await supabase.from('cities').delete().neq('name', '')
  if (citiesDeleteError) {
    console.error('Failed clearing cities:', citiesDeleteError.message)
    process.exit(1)
  }

  const { error: citiesInsertError } = await supabase.from('cities').insert(cityRows)
  if (citiesInsertError) {
    console.error('Failed inserting cities:', citiesInsertError.message)
    process.exit(1)
  }
  console.log(`Cities: inserted ${cityRows.length} rows`)

  // --- Profile city alias cleanup ---
  for (const [from, to] of Object.entries(CITY_ALIASES_TO_CODE)) {
    const { error } = await supabase.from('profiles').update({ city: to }).eq('city', from)
    if (error) console.warn(`Profile city alias ${from} -> ${to}:`, error.message)
  }

  // --- Sub casts English labels ---
  const { data: subCasts, error: subCastFetchError } = await supabase
    .from('sub_casts')
    .select('name, sort_order')

  if (subCastFetchError) {
    console.error('Failed fetching sub_casts:', subCastFetchError.message)
    process.exit(1)
  }

  for (const row of subCasts ?? []) {
    const nameGu = row.name as string
    const nameEn = SUB_CAST_EN[nameGu] ?? nameGu
    const { error } = await supabase
      .from('sub_casts')
      .update({ name_en: nameEn, name_gu: nameGu })
      .eq('name', nameGu)
    if (error) console.warn(`sub_cast ${nameGu}:`, error.message)
  }
  console.log(`Sub-casts: updated ${subCasts?.length ?? 0} rows`)

  // --- Qualifications ---
  for (const q of CANONICAL_QUALIFICATIONS) {
    const { error } = await supabase
      .from('qualifications')
      .upsert(
        { name: q.value, name_en: q.nameEn, name_gu: q.nameGu },
        { onConflict: 'name' },
      )
    if (error) console.warn(`qualification ${q.value}:`, error.message)
  }
  console.log(`Qualifications: upserted ${CANONICAL_QUALIFICATIONS.length} rows`)

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
