package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class ReplyCommentDTO {
  @NotNull
  private UUID experienceUuid;

  @NotNull
  private UUID parentCommentUuid;

  @NotNull
  @Size(min = 1, max = 100)
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
