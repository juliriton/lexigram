package com.lexigram.app.repository;

import com.lexigram.app.model.Experience;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;


public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
  Optional<UserProfile> findById(Long id);
  Set<Experience> getExperiencesByUserId(Long id);
  Set<Suggestion> getSuggestionsByUserId(Long id);
}
