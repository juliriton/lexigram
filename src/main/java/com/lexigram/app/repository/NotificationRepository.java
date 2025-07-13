package com.lexigram.app.repository;

import com.lexigram.app.model.FollowRequest;
import com.lexigram.app.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
  Collection<Notification> findByRecipientIdOrderByCreationDateDesc(Long recipientId);
  Optional<Notification> findByUuid(UUID uuid);
  List<Notification> findByRecipientId(Long id);

  @Modifying
  @Transactional
  @Query("DELETE FROM Notification n WHERE n.followRequest = :followRequest")
  void deleteByFollowRequest(@Param("followRequest") FollowRequest followRequest);

  void deleteByExperienceId(Long id);
  void deleteBySuggestionId(Long id);
}
