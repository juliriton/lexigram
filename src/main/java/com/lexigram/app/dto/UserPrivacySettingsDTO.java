package com.lexigram.app.dto;

public class UserPrivacySettingsDTO {

  private boolean visibility;

  public UserPrivacySettingsDTO() {}

  public UserPrivacySettingsDTO(boolean visibility) {
    this.visibility = visibility;
  }

  public boolean isPublic() {
    return visibility;
  }

}
