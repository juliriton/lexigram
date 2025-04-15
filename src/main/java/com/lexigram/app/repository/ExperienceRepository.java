package com.lexigram.app.repository;

import com.lexigram.app.model.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
  Optional<Experience> findExperienceByUserId(Long id);
}
