package com.lexigram.app.dto;

import com.lexigram.app.model.ExperiencePrivacySettings;
import jakarta.validation.constraints.NotNull;

public class PostExperiencePrivacySettingsDTO {

  @NotNull
  private boolean allowComments;

  @NotNull
  private boolean allowForks;

  @NotNull
  private boolean allowResonates;

  public PostExperiencePrivacySettingsDTO() {}

  public PostExperiencePrivacySettingsDTO(ExperiencePrivacySettings experiencePrivacySettings) {
    this.allowComments = experiencePrivacySettings.areCommentsAllowed();
    this.allowForks = experiencePrivacySettings.areForksAllowed();
    this.allowResonates = experiencePrivacySettings.areResonatesAllowed();
  }

  public boolean areCommentsAllowed(){
    return allowComments;
  }

  public boolean areForksAllowed(){
    return allowForks;
  }

  public boolean areResonatesAllowed(){
    return allowResonates;
  }

}
