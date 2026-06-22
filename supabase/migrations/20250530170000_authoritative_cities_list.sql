DELETE FROM cities;
INSERT INTO cities (name, name_en, name_gu, sort_order) VALUES
('AHMEDABAD', 'Ahmedabad', 'અમદાવાદ', 1),
('AJARPURA', 'Ajarpura', 'અજરપુરા', 2),
('ALARSA', 'Alarsa', 'અલારસા', 3),
('ANAND', 'Anand', 'આણંદ', 4),
('ANGHADI', 'Anghadi', 'અંગાઢી', 5),
('ANKLAV', 'Anklav', 'અંકલાવ', 6),
('ANKLESHWAR', 'Ankleshwar', 'અંકલેશ્વર', 7),
('ASOJ', 'Asoj', 'આસોજ', 8),
('BAHIYAL', 'Bahiyal', 'બહિયલ', 9),
('BANDHNI', 'Bandhni', 'બાંધણી', 10),
('BHADARVA', 'Bhadarva', 'ભાદરવા', 11),
('BHALEJ', 'Bhalej', 'ભાલેજ', 12),
('BHARUCH', 'Bharuch', 'ભરૂચ', 13),
('BORSAD', 'Borsad', 'બોરસદ', 14),
('CHANGA', 'Changa', 'ચાંગા', 15),
('DAKOR', 'Dakor', 'ડાકોર', 16),
('DUBAI', 'Dubai', 'દુબઈ', 17),
('GAMDI', 'Gamdi', 'ગામડી', 18),
('GANA', 'Gana', 'ગાણા', 19),
('GANDHINAGAR', 'Gandhinagar', 'ગાંધીનગર', 20),
('KALSAR', 'Kalsar', 'કલસર', 21),
('KANIJ', 'Kanij', 'કનીજ', 22),
('KANJARI', 'Kanjari', 'કંજારી', 23),
('KAPADWANJ', 'Kapadwanj', 'કપડવંજ', 24),
('KASOR', 'Kasor', 'કાસોર', 25),
('KATHLAL', 'Kathlal', 'કઠલાલ', 26),
('KHAMBHAT', 'Khambhat', 'ખંભાત', 27),
('KHANDALI', 'Khandali', 'ખંડાળી', 28),
('KHEDA', 'Kheda', 'ખેડા', 29),
('KOSINDRA', 'Kosindra', 'કોસિન્દ્રા', 30),
('MAHEMDAVAD', 'Mahemdavad', 'મહેમદાવાદ', 31),
('MAHESANA', 'Mahesana', 'મહેસાણા', 32),
('MAHUDHA', 'Mahudha', 'મહુધા', 33),
('MALAVADA', 'Malavada', 'માલાવાડા', 34),
('MALVAN', 'Malvan', 'માલવણ', 35),
('MANDVI', 'Mandvi', 'માંડવી', 36),
('MOGAR', 'Mogar', 'મોગર', 37),
('MUMBAI', 'Mumbai', 'મુંબઈ', 38),
('NADIAD', 'Nadiad', 'નડિયાદ', 39),
('NAPA', 'Napa', 'નાપા', 40),
('NAR', 'Nar', 'નાર', 41),
('NAVAKHAL', 'Navakhal', 'નવાખલ', 42),
('NAVLI', 'Navli', 'નાવલી', 43),
('NAVSARI', 'Navsari', 'નવસારી', 44),
('NOT PROVIDED', 'Not Provided', 'આપેલ નથી', 45),
('OD', 'Od', 'ઓડ', 46),
('PADRA', 'Padra', 'પાદરા', 47),
('PANSORA', 'Pansora', 'પાંસોરા', 48),
('PETLAD', 'Petlad', 'પેટલાદ', 49),
('PIPLAG', 'Piplag', 'પીપળગ', 50),
('RAS', 'Ras', 'રાસ', 51),
('RUDAN', 'Rudan', 'રૂદન', 52),
('SALUN', 'Salun', 'સાલુણ', 53),
('SANJAN', 'Sanjan', 'સંજાણ', 54),
('SEVALIYA', 'Sevaliya', 'સેવાલિયા', 55),
('SOJITRA', 'Sojitra', 'સોજીત્રા', 56),
('SURAT', 'Surat', 'સુરત', 57),
('SURELI', 'Sureli', 'સુરેલી', 58),
('TARAPUR', 'Tarapur', 'તારાપુર', 59),
('THASRA', 'Thasra', 'ઠાસરા', 60),
('UMETHA', 'Umetha', 'ઉમેઠા', 61),
('UMRETH', 'Umreth', 'ઉમરેઠ', 62),
('USA', 'USA', 'યુ.એસ.એ.', 63),
('UTTARSANDA', 'Uttarsanda', 'ઉત્તરસંડા', 64),
('VADODARA', 'Vadodara', 'વડોદરા', 65),
('VALASAN', 'Valasan', 'વાલાસણ', 66),
('VANSOL', 'Vansol', 'વાંસોલ', 67),
('VASAD', 'Vasad', 'વાસદ', 68),
('VASNA', 'Vasna', 'વાસણા', 69),
('VASO', 'Vaso', 'વાસો', 70),
('VIRAR', 'Virar', 'વિરાર', 71),
('VIRSAD', 'Virsad', 'વીરસદ', 72),
('VYARA', 'Vyara', 'વ્યારા', 73),
('WAKANER', 'Wakaner', 'વાંકાનેર', 74),
('OTHER', 'Other', 'અન્ય', 75);

UPDATE profiles SET city = 'AJARPURA' WHERE city = 'Ajarpura';
UPDATE profiles SET city = 'BORSAD' WHERE city = 'Borsad';
UPDATE profiles SET city = 'KHAMBHAT' WHERE city = 'Khambhat';
UPDATE profiles SET city = 'MAHEMDAVAD' WHERE city = 'Mahemdavad';
UPDATE profiles SET city = 'KALSAR' WHERE city = 'Kalsar (dakor)';
UPDATE profiles SET city = 'ANGHADI' WHERE city = 'Anghadi';
UPDATE profiles SET city = 'ANKLAV' WHERE city = 'Anklav';
UPDATE profiles SET city = 'BANDHNI' WHERE city = 'Bandhni';
UPDATE profiles SET city = 'GANA' WHERE city = 'Gana';
UPDATE profiles SET city = 'MALVAN' WHERE city = 'Malvan';
UPDATE profiles SET city = 'NAVAKHAL' WHERE city = 'Navakhal';
UPDATE profiles SET city = 'NAVLI' WHERE city = 'Navli';
UPDATE profiles SET city = 'SALUN' WHERE city = 'Salun';
UPDATE profiles SET city = 'WAKANER' WHERE city = 'Wakaner';
UPDATE profiles SET city = 'NOT PROVIDED' WHERE city = 'Not Provided';
UPDATE profiles SET city = 'OTHER' WHERE city = 'Other';
UPDATE profiles SET city = 'OD' WHERE city = 'ODE';
UPDATE profiles SET city = 'KHANDALI' WHERE city = 'KHANDHLI';
UPDATE profiles SET city = 'VIRAR' WHERE city = 'Virar (Mumbai)- Maharashtra';
UPDATE profiles SET city = 'VIRAR' WHERE city = 'Virar (Mumbai), Maharashtra';
