package com.lexigram.app.dto;

import com.lexigram.app.model.suggestion.SuggestionPrivacySettings;
import jakarta.validation.constraints.NotNull;

public class SuggestionPrivacySettingsDTO {

  @NotNull
  private boolean allowResonates;

  @NotNull
  private boolean allowSaves;

  public SuggestionPrivacySettingsDTO() {}

  public SuggestionPrivacySettingsDTO(SuggestionPrivacySettings suggestionPrivacySettings) {
    this.allowResonates = suggestionPrivacySettings.areResonatesAllowed();
    this.allowSaves = suggestionPrivacySettings.areSavesAllowed();
  }

  public boolean getAllowResonates(){
    return allowResonates;
  }

  public boolean getAllowSaves() { return allowSaves; }

}
