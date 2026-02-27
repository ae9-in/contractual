SET @schema_name = DATABASE();

SET @stmt = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @schema_name
        AND TABLE_NAME = 'freelancer_profiles'
        AND COLUMN_NAME = 'profile_photo_url'
    ),
    'SELECT 1',
    'ALTER TABLE freelancer_profiles ADD COLUMN profile_photo_url VARCHAR(500) NULL AFTER experience_years'
  )
);
PREPARE s1 FROM @stmt;
EXECUTE s1;
DEALLOCATE PREPARE s1;

SET @stmt = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @schema_name
        AND TABLE_NAME = 'freelancer_profiles'
        AND COLUMN_NAME = 'organization_name'
    ),
    'SELECT 1',
    'ALTER TABLE freelancer_profiles ADD COLUMN organization_name VARCHAR(150) NULL AFTER profile_photo_url'
  )
);
PREPARE s2 FROM @stmt;
EXECUTE s2;
DEALLOCATE PREPARE s2;

SET @stmt = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @schema_name
        AND TABLE_NAME = 'freelancer_profiles'
        AND COLUMN_NAME = 'organization_website'
    ),
    'SELECT 1',
    'ALTER TABLE freelancer_profiles ADD COLUMN organization_website VARCHAR(255) NULL AFTER organization_name'
  )
);
PREPARE s3 FROM @stmt;
EXECUTE s3;
DEALLOCATE PREPARE s3;

SET @stmt = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @schema_name
        AND TABLE_NAME = 'freelancer_profiles'
        AND COLUMN_NAME = 'organization_industry'
    ),
    'SELECT 1',
    'ALTER TABLE freelancer_profiles ADD COLUMN organization_industry VARCHAR(120) NULL AFTER organization_website'
  )
);
PREPARE s4 FROM @stmt;
EXECUTE s4;
DEALLOCATE PREPARE s4;
