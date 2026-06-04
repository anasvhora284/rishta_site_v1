# City verification — resolved (2026-06-04)

## A. Verified villages — keep as-is ✓
Anghadi, Bandhni, Malvan, Navakhal — correct Gujarat villages. Added to `CITIES` list. No DB change.

## B. Keep as-is ✓
- **Virar (Mumbai)- Maharashtra** — unchanged
- **Anklav**, **Navli** — correct spelling, unchanged
- **Gana**, **Salun**, **Not Provided** — unchanged pending future review

## C. `city_other` — internal only ✓
- Kept in database (legacy Google Forms “Other” + address detail)
- **Not shown** on profile cards or filters except when `city` = `Other`
- Admin edits **preserve** existing `city_other` (won’t wipe on save)

## Still open (7 profiles — city = Other, no detail)
| ID | Name | DOB |
|----|------|-----|
| 661 | Farhin Farukbhai Mansuri | 1999-10-25 |
| 664 | Mahir Farukbhai vhora | 2002-10-30 |
| 753 | Sahista Aarifbhai Mansuri | 2002-03-03 |
| 755 | Sirin ben Firoz Bhai vhora | 1995-05-21 |
| 767 | વહોરા uvesh mehbub bhai | 2004-10-16 |
| 551 | Vahora sahil | 2026-02-09 ⚠️ bad DOB |
| 843 | Harun Dilipbhai vhora | 1996-01-18 |

Reply with mappings when known.
