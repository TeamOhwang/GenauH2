package com.project.repository;

import com.project.entity.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {
    List<AlertRule> findByUserId(Long userId);
    List<AlertRule> findByEnabledIsTrue();
}