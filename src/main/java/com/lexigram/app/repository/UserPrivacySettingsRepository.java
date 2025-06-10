package com.lexigram.app.repository;

import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPrivacySettingsRepository extends JpaRepository<UserPrivacySettings, Long> {
  UserPrivacySettings findByUserId(Long user_id);
  Optional<UserPrivacySettings> findByUser(User user);
}
