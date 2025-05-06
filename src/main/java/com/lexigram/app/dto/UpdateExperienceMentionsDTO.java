package com.lexigram.app.dto;

import java.util.Set;

public class UpdateExperienceMentionsDTO {
  private Set<String> mentions;

  public UpdateExperienceMentionsDTO() {
  }

  public UpdateExperienceMentionsDTO(Set<String> mentions) {
    this.mentions = mentions;
  }

  public Set<String> getMentions() {
    return mentions;
  }

  public void setMentions(Set<String> mentions) {
    this.mentions = mentions;
  }

  @Override
  public String toString() {
    return "UpdateExperienceMentionsDTO{" +
        "mentions=" + (mentions != null ? mentions : "null") +
        '}';
  }
}