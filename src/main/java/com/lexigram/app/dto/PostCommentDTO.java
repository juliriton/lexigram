package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PostCommentDTO {

  @NotNull
  @Size(min = 1, max = 100)
  private String content;

  public PostCommentDTO(String content) {
    this.content = content;
  }

  public String getContent() {
    return content;
  }

}
