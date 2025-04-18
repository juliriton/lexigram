package com.lexigram.app.repository;

import com.lexigram.app.model.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
  Set<Suggestion> getSuggestionsByUserId(Long id);
}
