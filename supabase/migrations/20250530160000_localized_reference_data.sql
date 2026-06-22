-- Localized reference data: cities, sub_casts, qualifications

alter table cities add column if not exists name_en text;
alter table cities add column if not exists name_gu text;
alter table cities add column if not exists sort_order int not null default 0;

alter table sub_casts add column if not exists name_en text;
alter table sub_casts add column if not exists name_gu text;

alter table qualifications add column if not exists name_en text;
alter table qualifications add column if not exists name_gu text;

-- Backfill sub_cast gu labels from existing name column
update sub_casts set name_gu = name where name_gu is null;

-- Backfill qualification labels from code
update qualifications set name_en = name, name_gu = name where name_en is null;
