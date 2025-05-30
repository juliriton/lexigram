package com.lexigram.app.repository;

import com.lexigram.app.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface TagRepository extends JpaRepository<Tag, Long> {
  Optional<Tag> findByName(String name);
  Set<Tag> findByNameStartingWith(String prefix);
}
