package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class UpdateExperienceMentionsDTO {

  @NotNull
  private Set<String> mentions;

  public UpdateExperienceMentionsDTO() {}

  public UpdateExperienceMentionsDTO(Set<String> mentions) {
    this.mentions = mentions;
  }

  public Set<String> getMentions() {
    return mentions;
  }

}