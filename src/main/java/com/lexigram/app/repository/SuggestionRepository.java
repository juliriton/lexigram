package com.lexigram.app.repository;

import com.lexigram.app.model.Suggestion;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface SuggestionRepository {
  Optional<Set<Suggestion>> findSuggestionByUserId(Long id);
}
