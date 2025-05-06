package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;

public class PostExperiencePrivacySettingsDTO {

  @NotNull
  private boolean allowComments;

  @NotNull
  private boolean allowForks;

  @NotNull
  private boolean allowResonates;

  @NotNull
  private boolean allowSaves;

  public PostExperiencePrivacySettingsDTO() {}

  public PostExperiencePrivacySettingsDTO(boolean allowComments,
                                          boolean allowForks,
                                          boolean allowResonates,
                                          boolean allowSaves) {
    this.allowComments = allowComments;
    this.allowForks = allowForks;
    this.allowResonates = allowResonates;
    this.allowSaves = allowSaves;
  }

  public boolean getAllowComments(){ return allowComments; }

  public boolean getAllowForks(){
    return allowForks;
  }

  public boolean getAllowResonates(){
    return allowResonates;
  }

  public boolean getAllowSaves() { return allowSaves; }

}
