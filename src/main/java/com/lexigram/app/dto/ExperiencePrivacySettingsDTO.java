package com.lexigram.app.dto;

import com.lexigram.app.model.experience.ExperiencePrivacySettings;

public class ExperiencePrivacySettingsDTO {

  private boolean allowComments;
  private boolean allowForks;
  private boolean allowResonates;
  private boolean allowSaves;

  public ExperiencePrivacySettingsDTO() {}

  public ExperiencePrivacySettingsDTO(ExperiencePrivacySettings experiencePrivacySettings) {
    this.allowComments = experiencePrivacySettings.areCommentsAllowed();
    this.allowForks = experiencePrivacySettings.areForksAllowed();
    this.allowResonates = experiencePrivacySettings.areResonatesAllowed();
    this.allowSaves = experiencePrivacySettings.areSavesAllowed();
  }

  public boolean getAllowComments(){
    return allowComments;
  }

  public boolean getAllowForks(){
    return allowForks;
  }

  public boolean getAllowResonates(){
    return allowResonates;
  }

  public boolean getAllowSaves() { return allowSaves; }

}
