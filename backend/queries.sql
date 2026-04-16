SELECT id, username, first_name, last_name, location 
FROM core_user 
WHERE role = 'worker' 
  AND location = 'Mumbai, MH' 
  AND is_active = 1;
