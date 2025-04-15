package com.lexigram.app.dto;

import com.lexigram.app.model.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class PostSuggestionDTO {

  @Size(min = 1)
  private Set<Tag> tags;

  @NotBlank
  @Size(min = 1, max = 100, message = "Suggestions must be between 1 and 100 characters.")
  private String suggestion;

  public PostSuggestionDTO(Set<Tag> tags, String suggestion) {
    this.tags = tags;
    this.suggestion = suggestion;
  }

  public Set<Tag> getTags() {
    return tags;
  }
  public String getSuggestion() {
    return suggestion;
  }

}
