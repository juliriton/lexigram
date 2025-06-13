package com.lexigram.app.dto;

public class SuggestionPrivacySettingsDTO {

  private final boolean allowResonates;
  private final boolean allowSaves;

  public SuggestionPrivacySettingsDTO(boolean allowResonates, boolean allowSaves) {
    this.allowResonates = allowResonates;
    this.allowSaves = allowSaves;
  }

  public boolean getAllowResonates() {
    return allowResonates;
  }

  public boolean getAllowSaves() {
    return allowSaves;
  }

}