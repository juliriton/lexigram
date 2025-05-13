package com.lexigram.app.repository;

import com.lexigram.app.model.resonate.Resonate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ResonateRepository extends JpaRepository<Resonate, Long> {
  void deleteByExperienceUuidAndUserId(UUID uuid, Long id);
  Optional<Resonate> findByExperienceUuidAndUserId(UUID uuid, Long id);
  Optional<Resonate> findBySuggestionUuidAndUserId(UUID uuid, Long id);
  void deleteBySuggestionUuidAndUserId(UUID uuid, Long id);
}
