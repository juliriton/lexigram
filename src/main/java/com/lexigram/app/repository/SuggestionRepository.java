package com.lexigram.app.repository;

import com.lexigram.app.model.suggestion.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
  Optional<Suggestion> findById(Long id);
  void deleteById(Long suggestionId);
  Set<Suggestion> getSuggestionsByUserId(Long id);
  Optional<Suggestion> findByUuid(UUID suggestionUuid);
  Set<Suggestion> getSuggestionsByUserUuid(UUID uuid);
  Set<Suggestion> findByBodyStartingWithIgnoreCase(String prefix);
  Set<Suggestion> findByTagsNameStartingWithIgnoreCase(String prefix);
  Set<Suggestion> findByUserUsernameStartingWithIgnoreCase(String prefix);
  Set<Suggestion> findByBodyContainingIgnoreCase(String object);
  Set<Suggestion> findByTagsNameContainingIgnoreCase(String object);
  Set<Suggestion> findByUserUsernameContainingIgnoreCase(String object);
}
