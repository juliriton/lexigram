package com.lexigram.app.dto;

import com.lexigram.app.model.Comment;
import com.lexigram.app.model.resonate.Resonate;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class CommentDTO {
  private UUID uuid;
  private UUID userUuid;
  private UUID experienceUuid;
  private String content;
  private long creationDate;
  private Set<UUID> replyUuids;
  private Set<UUID> resonatedUuids;
  private long resonatesAmount;

  public CommentDTO() {}

  public CommentDTO(Comment comment) {
    this.uuid = comment.getUuid();
    this.userUuid = comment.getUser().getUuid();
    this.experienceUuid = comment.getExpUuid();
    this.content = comment.getContent();
    this.creationDate = comment.getCreationDate();
    this.replyUuids = getResonatedUuids(comment);
    this.resonatedUuids = getReplyUuids(comment);
    this.resonatesAmount = comment.getResonatesAmount();
  }

  private static Set<UUID> getReplyUuids(Comment comment) {
    Set<UUID> replyUuids = new HashSet<>();
    for (Comment replyComment : comment.getReplies()) {
      replyUuids.add(replyComment.getUuid());
    }
    return replyUuids;
  }

  private static Set<UUID> getResonatedUuids(Comment comment) {
    Set<UUID> resonatedUuids = new HashSet<>();
    for (Resonate resonate : comment.getResonates()) {
      resonatedUuids.add(resonate.getUuid());
    }
    return resonatedUuids;
  }

  public UUID getUserUuid() {
    return userUuid;
  }

  public UUID getUuid() {
    return uuid;
  }

  public UUID getExperienceUuid() {
    return experienceUuid;
  }

  public String getContent() {
    return content;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public Set<UUID> getReplies() {
    return replyUuids;
  }

  public Set<UUID> getResonatedBy() {
    return resonatedUuids;
  }

  public long getResonatesAmount() {
    return resonatesAmount;
  }

}
