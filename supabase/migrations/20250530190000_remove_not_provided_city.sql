-- Remove "Not Provided" as a city option; migrate existing profiles to Other.
UPDATE profiles
SET city = 'OTHER', city_other = COALESCE(NULLIF(TRIM(city_other), ''), 'Not provided')
WHERE city IN ('NOT PROVIDED', 'Not Provided');

DELETE FROM cities WHERE name IN ('NOT PROVIDED', 'Not Provided');

-- Re-number sort_order after removal
WITH ordered AS (
  SELECT name, ROW_NUMBER() OVER (ORDER BY sort_order, name) AS new_order
  FROM cities
)
UPDATE cities c
SET sort_order = o.new_order
FROM ordered o
WHERE c.name = o.name;
