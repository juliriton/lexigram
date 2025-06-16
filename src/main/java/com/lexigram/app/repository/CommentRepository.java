package com.lexigram.app.repository;

import com.lexigram.app.model.Comment;
import com.lexigram.app.model.experience.Experience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

  Optional<Comment> findByUuid(UUID uuid);
  void deleteByUuid(UUID uuid);

  List<Comment> findByExperienceAndParentCommentIsNullOrderByCreationDateDesc(Experience experience);
  Page<Comment> findByExperienceAndParentCommentIsNull(Experience experience, Pageable pageable);

  @Query("SELECT c FROM comments c LEFT JOIN FETCH c.replies WHERE c.experience = :experience AND c.parentComment IS NULL ORDER BY c.creationDate DESC")
  List<Comment> findByExperienceAndParentCommentIsNullWithRepliesOrderByCreationDateDesc(@Param("experience") Experience experience);

  long countByExperience(Experience experience);

  @Query("SELECT COUNT(c) FROM comments c WHERE c.experience = :experience AND c.parentComment IS NULL")
  long countTopLevelCommentsByExperience(@Param("experience") Experience experience);

  @Query("SELECT c FROM comments c LEFT JOIN FETCH c.replies r LEFT JOIN FETCH r.user WHERE c.experience = :experience AND c.parentComment IS NULL ORDER BY c.creationDate DESC")
  List<Comment> findTopLevelCommentsWithReplies(@Param("experience") Experience experience);

  @Query("SELECT c FROM comments c WHERE c.experience = :experience ORDER BY c.creationDate DESC")
  List<Comment> findAllByExperienceOrderByCreationDateDesc(@Param("experience") Experience experience);
}

