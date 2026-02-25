SET @has_tip_total := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'project_payments'
    AND column_name = 'tip_total'
);

SET @add_tip_total_sql := IF(
  @has_tip_total = 0,
  'ALTER TABLE project_payments ADD COLUMN tip_total DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER amount',
  'SELECT 1'
);

PREPARE add_tip_total_stmt FROM @add_tip_total_sql;
EXECUTE add_tip_total_stmt;
DEALLOCATE PREPARE add_tip_total_stmt;

ALTER TABLE project_payment_transactions
  MODIFY COLUMN type ENUM('Funded', 'Released', 'Tip') NOT NULL;
