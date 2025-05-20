package com.lexigram.app.repository;

import com.lexigram.app.model.suggestion.SuggestionPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuggestionPrivacySettingsRepository extends JpaRepository<SuggestionPrivacySettings, Long> {
}
