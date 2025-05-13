package com.lexigram.app.repository;

import com.lexigram.app.model.experience.ExperiencePrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExperiencePrivacySettingsRepository extends JpaRepository<ExperiencePrivacySettings, Long> {
}
