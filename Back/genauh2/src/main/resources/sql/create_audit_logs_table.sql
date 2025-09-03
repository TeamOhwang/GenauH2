-- 감사 로그 테이블 생성
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    actor_id BIGINT,
    actor_name VARCHAR(100),
    actor_email VARCHAR(100),
    target_id BIGINT,
    target_name VARCHAR(100),
    target_email VARCHAR(100),
    message VARCHAR(500) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_action_type (action_type),
    INDEX idx_severity (severity),
    INDEX idx_actor_id (actor_id),
    INDEX idx_target_id (target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
