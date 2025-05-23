package com.lexigram.app.repository;

import com.lexigram.app.model.experience.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
  Optional<Experience> findById(Long id);
  void deleteById(Long id);
  Optional<Experience> findByUuid(UUID uuid);
  Set<Experience> getExperiencesByUserId(Long id);
  Set<Experience> getExperiencesByUserUuid(UUID uuid);
  Set<Experience> findByQuoteStartingWithIgnoreCase(String prefix);
  Set<Experience> findByTagsNameStartingWithIgnoreCase(String prefix);
  Set<Experience> findByUserUsernameStartingWithIgnoreCase(String prefix);
}
