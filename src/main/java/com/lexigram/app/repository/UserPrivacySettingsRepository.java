package com.lexigram.app.repository;

import com.lexigram.app.model.user.UserPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPrivacySettingsRepository extends JpaRepository<UserPrivacySettings, Long> {
  UserPrivacySettings findByUserId(Long user_id);
}
