package com.lexigram.app.repository;

import com.lexigram.app.model.suggestion.SuggestionPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SuggestionPrivacySettingsRepository extends JpaRepository<SuggestionPrivacySettings, Long> {

  Optional<SuggestionPrivacySettings> findBySuggestionId(Long suggestionId);

}