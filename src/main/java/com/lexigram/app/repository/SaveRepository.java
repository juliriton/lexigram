package com.lexigram.app.repository;

import com.lexigram.app.model.Save;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface SaveRepository extends JpaRepository<Save, Long> {
  Optional<Save> findByExperienceUuidAndUserId(UUID uuid, Long id);
  void deleteByExperienceUuidAndUserId(UUID uuid, Long id);
  Optional<Save> findBySuggestionUuidAndUserId(UUID uuid, Long id);
  void deleteBySuggestionUuidAndUserId(UUID uuid, Long id);
  Set<Save> getAllByUserId(Long id);
}

