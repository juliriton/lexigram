package com.lexigram.app.dto;

import com.lexigram.app.model.Comment;
import com.lexigram.app.model.resonate.Resonate;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class CommentDTO {

  private UUID uuid;
  private UserDTO user;
  private String content;
  private long creationDate;
  private long resonatesAmount;
  private long repliesAmount;
  private List<CommentDTO> replies;
  private Set<UUID> resonatedBy;
  private UUID experienceUuid;

  public CommentDTO() {}

  public CommentDTO(Comment comment) {
    this.uuid = comment.getUuid();
    this.user = new UserDTO(comment.getUser());
    this.content = comment.getContent();
    this.creationDate = comment.getCreationDate();
    this.resonatesAmount = comment.getResonatesAmount();
    this.repliesAmount = comment.getReplies() != null ? comment.getReplies().size() : 0;
    this.experienceUuid = comment.getExpUuid();

    // Construir lista de respuestas
    if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
      this.replies = comment.getReplies().stream()
          .map(CommentDTO::new)
          .collect(Collectors.toList());
    } else {
      this.replies = List.of();
    }

    // Construir conjunto de UUIDs de usuarios que resonaron
    if (comment.getResonates() != null) {
      this.resonatedBy = comment.getResonates().stream()
          .map(resonate -> resonate.getUser().getUuid())
          .collect(Collectors.toSet());
    } else {
      this.resonatedBy = Set.of();
    }
  }

  // Getters y setters
  public UUID getUuid() {
    return uuid;
  }

  public void setUuid(UUID uuid) {
    this.uuid = uuid;
  }

  public UserDTO getUser() {
    return user;
  }

  public void setUser(UserDTO user) {
    this.user = user;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public void setCreationDate(long creationDate) {
    this.creationDate = creationDate;
  }

  public long getResonatesAmount() {
    return resonatesAmount;
  }

  public void setResonatesAmount(long resonatesAmount) {
    this.resonatesAmount = resonatesAmount;
  }

  public long getRepliesAmount() {
    return repliesAmount;
  }

  public void setRepliesAmount(long repliesAmount) {
    this.repliesAmount = repliesAmount;
  }

  public List<CommentDTO> getReplies() {
    return replies;
  }

  public void setReplies(List<CommentDTO> replies) {
    this.replies = replies;
  }

  public Set<UUID> getResonatedBy() {
    return resonatedBy;
  }

  public void setResonatedBy(Set<UUID> resonatedBy) {
    this.resonatedBy = resonatedBy;
  }

  public UUID getExperienceUuid() {
    return experienceUuid;
  }

  public void setExperienceUuid(UUID experienceUuid) {
    this.experienceUuid = experienceUuid;
  }

  @Override
  public String toString() {
    return "CommentDTO{" +
        "uuid=" + uuid +
        ", user=" + (user != null ? user.getUsername() : "null") +
        ", content='" + content + '\'' +
        ", creationDate=" + creationDate +
        ", resonatesAmount=" + resonatesAmount +
        ", repliesAmount=" + repliesAmount +
        ", repliesCount=" + (replies != null ? replies.size() : 0) +
        ", experienceUuid=" + experienceUuid +
        '}';
  }
}