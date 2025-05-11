package com.lexigram.app.dto;

import jakarta.validation.constraints.Size;

import java.util.Set;

public class UpdateSuggestionTagDTO {

  @Size(min = 1, message = "Suggestions should have at least 1 tag.")
  private Set<String> tags;

  public UpdateSuggestionTagDTO() {}

  public UpdateSuggestionTagDTO(Set<String> tags) {
    this.tags = tags;
  }

  public Set<String> getTags() {
    return tags;
  }

  public void setTags(Set<String> tags) {
    this.tags = tags;
  }
}

