package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class UpdateExperienceTagDTO {
  @NotNull
  @Size(min = 1, message = "Experiences should have at least 1 tag.")
  private Set<String> tags;

  public Set<String> getTags() {
    return tags;
  }
}
