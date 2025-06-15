package com.lexigram.app.repository;

import com.lexigram.app.model.resonate.Resonate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import com.lexigram.app.model.Comment;
import com.lexigram.app.model.user.User;

public interface ResonateRepository extends JpaRepository<Resonate, Long> {
  void deleteByExperienceUuidAndUserId(UUID uuid, Long id);
  Optional<Resonate> findByExperienceUuidAndUserId(UUID uuid, Long id);
  Optional<Resonate> findBySuggestionUuidAndUserId(UUID uuid, Long id);
  void deleteBySuggestionUuidAndUserId(UUID uuid, Long id);
  Optional<Resonate> findByUserAndComment(User user, Comment comment);
  Optional<Resonate> findByUserIdAndCommentUuid(Long userId, UUID commentUuid);
  void deleteByUserIdAndCommentUuid(Long userId, UUID commentUuid);
}