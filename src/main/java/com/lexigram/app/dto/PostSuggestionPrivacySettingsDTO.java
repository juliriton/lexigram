package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;

public class PostSuggestionPrivacySettingsDTO {

  @NotNull
  private boolean allowResonates;

  @NotNull
  private boolean allowSaves;

  public PostSuggestionPrivacySettingsDTO() {}

  public PostSuggestionPrivacySettingsDTO(boolean allowResonates,
                                          boolean allowSaves) {
    this.allowResonates = allowResonates;
    this.allowSaves = allowSaves;
  }

  public boolean getAllowResonates(){
    return allowResonates;
  }

  public boolean getAllowSaves() { return allowSaves; }

}
