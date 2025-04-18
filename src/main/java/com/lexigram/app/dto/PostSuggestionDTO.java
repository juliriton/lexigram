package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class PostSuggestionDTO {

  @Size(min = 1)
  private Set<String> tags;

  @NotBlank
  @Size(min = 1, max = 100, message = "Suggestions must be between 1 and 100 characters.")
  private String body;

  public PostSuggestionDTO() {}

  public PostSuggestionDTO(Set<String> tags, String body) {
    this.tags = tags;
    this.body = body;
  }

  public Set<String> getTags() {
    return tags;
  }
  public String getBody() {
    return body;
  }

}
