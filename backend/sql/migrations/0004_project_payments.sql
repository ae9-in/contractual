CREATE TABLE IF NOT EXISTS project_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('Unfunded', 'Funded', 'Released') NOT NULL DEFAULT 'Unfunded',
  funded_at TIMESTAMP NULL,
  released_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_project_payments_project UNIQUE (project_id),
  CONSTRAINT fk_project_payments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_payments_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_payment_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NOT NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  type ENUM('Funded', 'Released') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_tx_payment FOREIGN KEY (payment_id) REFERENCES project_payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_tx_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_tx_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_payment_tx_project_created (project_id, created_at)
) ENGINE=InnoDB;

INSERT INTO project_payments (project_id, amount, status)
SELECT p.id, p.budget, 'Unfunded'
FROM projects p
LEFT JOIN project_payments pp ON pp.project_id = p.id
WHERE pp.project_id IS NULL;
