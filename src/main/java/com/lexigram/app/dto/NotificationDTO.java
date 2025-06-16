package com.lexigram.app.dto;

import com.lexigram.app.types.NotificationType;

import java.util.UUID;

public class NotificationDTO {
  private UUID uuid;
  private String title;
  private String text;
  private boolean read;
  private long creationDate;

  private UUID actorUuid;

  private UUID experienceUuid;
  private UUID suggestionUuid;

  private NotificationType type;

  public NotificationDTO(UUID uuid,
                         String title,
                         String text,
                         boolean read,
                         long creationDate,
                         UUID actorUuid,
                         UUID experienceUuid,
                         UUID suggestionUuid,
                         NotificationType type) {
    this.uuid = uuid;
    this.title = title;
    this.text = text;
    this.read = read;
    this.creationDate = creationDate;
    this.actorUuid = actorUuid;
    this.experienceUuid = experienceUuid;
    this.suggestionUuid = suggestionUuid;
    this.type = type;
  }

  public UUID getUuid() {
    return uuid;
  }

  public String getTitle() {
    return title;
  }

  public String getText() {
    return text;
  }

  public boolean isRead() {
    return read;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public UUID getActorUuid() {
    return actorUuid;
  }

  public UUID getExperienceUuid() {
    return experienceUuid;
  }

  public UUID getSuggestionUuid() {
    return suggestionUuid;
  }

  public NotificationType getType() {
    return type;
  }

}
