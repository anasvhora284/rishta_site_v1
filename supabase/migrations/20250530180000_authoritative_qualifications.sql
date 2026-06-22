-- Authoritative qualification labels + NOT PROVIDED city English label
UPDATE qualifications SET name_en = '10th Standard', name_gu = 'ધોરણ ૧૦' WHERE name = '10th';
UPDATE qualifications SET name_en = '12th Standard', name_gu = 'ધોરણ ૧૨' WHERE name = '12th';
UPDATE qualifications SET name_en = 'Bachelor', name_gu = 'સ્નાતક (બેચલર)' WHERE name = 'Bachelor';
UPDATE qualifications SET name_en = 'Diploma', name_gu = 'ડિપ્લોમા' WHERE name = 'Diploma';
UPDATE qualifications SET name_en = 'Engineering', name_gu = 'એન્જિનિયરિંગ' WHERE name = 'Engineering';
UPDATE qualifications SET name_en = 'Master', name_gu = 'સ્નાતકોત્તર (માસ્ટર)' WHERE name = 'Master';
UPDATE qualifications SET name_en = 'Medical', name_gu = 'મેડિકલ' WHERE name = 'Medical';
UPDATE qualifications SET name_en = 'Other', name_gu = 'અન્ય' WHERE name = 'Other';
UPDATE cities SET name_en = 'Not Given', name_gu = 'આપેલ નથી' WHERE name = 'NOT PROVIDED';
