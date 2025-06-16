package com.lexigram.app.repository;

import com.lexigram.app.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
  Collection<Notification> findByRecipientIdOrderByCreationDateDesc(Long recipientId);
  Optional<Notification> findByUuid(UUID uuid);
  List<Notification> findByRecipientId(Long id);

}
