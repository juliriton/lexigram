package com.lexigram.app.repository;

import com.lexigram.app.model.Experience;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExperienceRepository {
  Optional<Experience> findExperienceByUserId(Long id);
}
