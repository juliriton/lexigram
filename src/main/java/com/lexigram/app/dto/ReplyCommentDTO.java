package com.lexigram.app.dto;

import java.util.UUID;

public class ReplyCommentDTO {
  private UUID experienceUuid;
  private UUID parentCommentUuid;
  private String content;

  public ReplyCommentDTO() {}

  public ReplyCommentDTO(UUID experienceUuid,
                         UUID parentCommentUuid,
                         String content) {
    this.experienceUuid = experienceUuid;
    this.parentCommentUuid = parentCommentUuid;
    this.content = content;
  }

  public UUID getExperienceUuid() {
    return experienceUuid;
  }

  public UUID getParentCommentUuid() {
    return parentCommentUuid;
  }

  public String getContent() {
    return content;
  }

}
