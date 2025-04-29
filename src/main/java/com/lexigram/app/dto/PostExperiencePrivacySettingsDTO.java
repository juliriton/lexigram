package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;

public class PostExperiencePrivacySettingsDTO {

  @NotNull
  private boolean allowComments;

  @NotNull
  private boolean allowForks;

  @NotNull
  private boolean allowResonates;

  public PostExperiencePrivacySettingsDTO() {}

  public PostExperiencePrivacySettingsDTO(boolean allowComments, boolean allowForks, boolean allowResonates) {
    this.allowComments = allowComments;
    this.allowForks = allowForks;
    this.allowResonates = allowResonates;
  }

  public boolean getAllowComments(){ return allowComments; }

  public boolean getAllowForks(){
    return allowForks;
  }

  public boolean getAllowResonates(){
    return allowResonates;
  }

}
