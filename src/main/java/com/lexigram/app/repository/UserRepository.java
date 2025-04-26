package com.lexigram.app.repository;

import com.lexigram.app.model.User;
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
  Set<User> findByFollowers(User user);
  Set<User> findByFollowing(User user);
  Optional<User> findByUuid(UUID uuid);
  Optional<User> findFollowerById(Long id);
}
