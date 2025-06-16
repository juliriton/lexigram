package com.lexigram.app.service;

import com.lexigram.app.dto.NotificationDTO;
import com.lexigram.app.model.Notification;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.NotificationRepository;
import com.lexigram.app.repository.UserRepository;
import com.lexigram.app.types.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;

  @Autowired
  public NotificationService(NotificationRepository notificationRepository,
                             UserRepository userRepository) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  public Collection<NotificationDTO> getAllNotificationsByUserId(Long userId) {
    Optional<User> user = userRepository.findById(userId);

    if (user.isEmpty()) {
      return Collections.emptyList();
    }

    Collection<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreationDateDesc(userId);
    List<NotificationDTO> notificationDTOs = new ArrayList<>();

    for (Notification n : notifications) {
      UUID actorUuid = n.getActor() != null ? n.getActor().getUuid() : null;
      UUID experienceUuid = n.getExperience() != null ? n.getExperience().getUuid() : null;
      UUID suggestionUuid = n.getSuggestion() != null ? n.getSuggestion().getUuid() : null;

      notificationDTOs.add(new NotificationDTO(
          n.getUuid(),
          n.getTitle(),
          n.getText(),
          n.isRead(),
          n.getCreationDate(),
          actorUuid,
          experienceUuid,
          suggestionUuid,
          n.getType()
      ));
    }

    return notificationDTOs;
  }

  public boolean deleteNotificationByUuid(Long userId, UUID uuid) {
    Optional<User> user = userRepository.findById(userId);

    if (user.isEmpty()) {
      return false;
    }

    Optional<Notification> optionalNotification = notificationRepository.findByUuid(uuid);

    if (optionalNotification.isPresent()) {
      notificationRepository.delete(optionalNotification.get());
      return true;
    }

    return false;
  }

  public boolean acknowledgeNotificationByUuid(Long userId, UUID uuid) {
    Optional<User> user = userRepository.findById(userId);

    if (user.isEmpty()) {
      return false;
    }

    Optional<Notification> optionalNotification = notificationRepository.findByUuid(uuid);

    if (optionalNotification.isPresent()) {
      Notification notification = optionalNotification.get();
      notification.setRead(true);
      notificationRepository.save(notification);
      return true;
    }

    return false;
  }

  @Transactional
  public boolean acknowledgeAllNotifications(Long userId) {
    Optional<User> user = userRepository.findById(userId);

    if (user.isEmpty()) {
      return false;
    }

    List<Notification> notifications = notificationRepository.findByRecipientId(userId);

    if (notifications.isEmpty()) return false;

    for (Notification notification : notifications) {
      if (!notification.isRead()) {
        notification.setRead(true);
      }
    }

    notificationRepository.saveAll(notifications);
    return true;
  }

  @Transactional
  public boolean deleteAllNotifications(Long userId) {
    Optional<User> user = userRepository.findById(userId);

    if (user.isEmpty()) {
      return false;
    }

    List<Notification> notifications = notificationRepository.findByRecipientId(userId);

    if (notifications.isEmpty()) return false;

    notificationRepository.deleteAll(notifications);
    return true;
  }

  public Notification createFollowNotification(User actor, User recipient) {
    return createNotification(
        recipient,
        actor,
        "New Follower",
        actor.getUsername() + " started following you.",
        null,
        null,
        NotificationType.FOLLOW
    );
  }


  public Notification resonateExperienceNotification(User actor, Experience experience) {
    return createNotification(
        experience.getUser(),
        actor,
        "New Resonate",
        actor.getUsername() + " resonated with your experience.",
        experience,
        null,
        NotificationType.RESONATE
    );
  }

  public Notification resonateSuggestionNotification(User actor, Suggestion suggestion) {
    return createNotification(
        suggestion.getUser(),
        actor,
        "New Resonate",
        actor.getUsername() + " resonated with your suggestion.",
        null,
        suggestion,
        NotificationType.RESONATE
    );
  }

  public Notification commentExperienceNotification(User actor, Experience experience) {
    return createNotification(
        experience.getUser(),
        actor,
        "New Comment",
        actor.getUsername() + " commented on your experience.",
        experience,
        null,
        NotificationType.COMMENT
    );
  }

  public Notification mentionExperienceNotification(User actor, Experience experience, User mentionedUser) {
    return createNotification(
        mentionedUser,
        actor,
        "Mentioned in Experience",
        actor.getUsername() + " mentioned you in an experience.",
        experience,
        null,
        NotificationType.MENTION
    );
  }

  private Notification createNotification(
      User recipient,
      User actor,
      String title,
      String text,
      @Nullable Experience experience,
      @Nullable Suggestion suggestion,
      NotificationType type
  ) {
    Notification notification = new Notification();
    notification.setTitle(title);
    notification.setText(text);
    notification.setRead(false);
    notification.setRecipient(recipient);
    notification.setActor(actor);
    notification.setExperience(experience);
    notification.setSuggestion(suggestion);
    notification.setType(type);

    return notificationRepository.save(notification);
  }




}
