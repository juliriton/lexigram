package com.lexigram.app.repository;

import com.lexigram.app.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findById(Long id);
  Optional<User> findByUsername(String username);
  Optional<User> findByEmail(String email);
  Boolean existsByUsername(String username);
  Boolean existsByEmail(String email);
  Set<User> findByUserPrivacySettingsVisibilityTrue();
  Optional<User> findByUuid(UUID uuid);
  Set<User> findByUsernameContainingIgnoreCase(String object);
  Set<User> findByUsernameStartingWithIgnoreCase(String object);
}
