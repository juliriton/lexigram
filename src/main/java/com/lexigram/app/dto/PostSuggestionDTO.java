package com.lexigram.app.dto;

import com.lexigram.app.model.Tag;

import java.util.Set;

public class PostSuggestionDTO {

  private Set<Tag> tags;
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
