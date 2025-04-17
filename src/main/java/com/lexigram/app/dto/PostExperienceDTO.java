package com.lexigram.app.dto;

import jakarta.validation.constraints.*;

import java.util.Set;

public class PostExperienceDTO {

  @NotBlank
  private String quote;

  @NotBlank
  @Size(min = 10, max = 300, message = "Reflection must be between 10 and 300 characters. Share something meaningful!")
  private String reflection;

  @NotNull
  @Size(min = 1, message = "Experiences should have at least 1 tag.")
  private Set<String> tags;

  private Set<String> mentions;

  @NotNull
  private boolean isOrigin;

  @NotNull
  private PostExperienceStyleDTO style;

  @NotNull
  private PostExperiencePrivacySettingsDTO privacySettings;

  public PostExperienceDTO() {}

  public PostExperienceDTO(String quote,
                           String reflection,
                           Set<String> tags,
                           Set<String> mentions,
                           boolean isOrigin,
                           PostExperiencePrivacySettingsDTO privacySettings,
                           PostExperienceStyleDTO style) {
    this.quote = quote;
    this.reflection = reflection;
    this.tags = tags;
    this.mentions = mentions;
    this.isOrigin = isOrigin;
    this.privacySettings = privacySettings;
    this.style = style;
  }

  public String getQuote() {
    return quote;
  }

  public String getReflection() {
    return reflection;
  }

  public Set<String> getTags() {
    return tags;
  }

  public Set<String> getMentions() {
    return mentions;
  }

  public boolean isOrigin(){
    return isOrigin;
  }

  public PostExperienceStyleDTO getStyle() {
    return style;
  }

  public PostExperiencePrivacySettingsDTO getPrivacySettings() {
    return privacySettings;
  }

}

