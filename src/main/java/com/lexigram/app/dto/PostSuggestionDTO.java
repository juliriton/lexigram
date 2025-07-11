package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class PostSuggestionDTO {

  @NotEmpty
  @Size(min = 1, max = 20)
  private Set<String> tags;

  @NotEmpty
  @NotBlank
  @Size(min = 1, max = 100, message = "Suggestions must be between 1 and 100 characters.")
  private String body;

  @NotNull
  private PostSuggestionPrivacySettingsDTO privacySettings;

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
  public PostSuggestionPrivacySettingsDTO getPrivacySettings() {
    return privacySettings;
  }

}
