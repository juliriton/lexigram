package com.lexigram.app.repository;

import com.lexigram.app.model.experience.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
  Optional<Experience> findById(Long id);
  void deleteById(Long id);
  Optional<Experience> findByUuid(UUID uuid);
  @Query("SELECT DISTINCT e FROM experiences e LEFT JOIN FETCH e.mentions WHERE e.user.id = :id")
  Set<Experience> getExperiencesByUserId(@Param("id") Long id);
  Set<Experience> getExperiencesByUserUuid(UUID uuid);
  Set<Experience> findByQuoteStartingWithIgnoreCase(String prefix);
  Set<Experience> findByTagsNameStartingWithIgnoreCase(String prefix);
  Set<Experience> findByUserUsernameStartingWithIgnoreCase(String prefix);
  Set<Experience> findByUserUsernameContainingIgnoreCase(String object);
  Set<Experience> findByTagsNameContainingIgnoreCase(String object);
  Set<Experience> findByQuoteContainingIgnoreCase(String object);
}
