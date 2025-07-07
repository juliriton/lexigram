package com.lexigram.app.repository;

import com.lexigram.app.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, Long> {
  Optional<Tag> findByName(String name);
  Optional<Tag> findByUuid(UUID uuid);
  Set<Tag> findByNameContainingIgnoreCase(String object);
  Set<Tag> findByNameStartingWithIgnoreCase(String object);
}
