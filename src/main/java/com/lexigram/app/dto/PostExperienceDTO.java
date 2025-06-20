package com.lexigram.app.dto;

import jakarta.validation.constraints.*;

import java.util.Set;

public class PostExperienceDTO {

  @NotEmpty
  @NotBlank
  @Size(min = 10, max = 300, message = "Quote must be between 10 and 300 characters. Share something meaningful!")
  private String quote;

  @NotBlank
  @Size(min = 100, max = 800, message = "Reflection must be between 100 and 800 characters. Share something meaningful!")
  private String reflection;

  @NotEmpty
  @NotNull
  @Size(min = 1, max = 20, message = "Experiences should have between 1 and 20 tags.")
  private Set<String> tags;

  @NotNull
  private Boolean isReply;

  private Set<String> mentions;

  @NotNull
  private PostExperienceStyleDTO style;

  @NotNull
  private PostExperiencePrivacySettingsDTO privacySettings;

  public PostExperienceDTO() {}

  public PostExperienceDTO(String quote,
                           String reflection,
                           Set<String> tags,
                           Set<String> mentions,
                           Boolean isReply,
                           PostExperiencePrivacySettingsDTO privacySettings,
                           PostExperienceStyleDTO style) {
    this.quote = quote;
    this.reflection = reflection;
    this.tags = tags;
    this.mentions = mentions;
    this.isReply = isReply;
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

  public PostExperienceStyleDTO getStyle() {
    return style;
  }

  public PostExperiencePrivacySettingsDTO getPrivacySettings() {
    return privacySettings;
  }

  public Boolean getIsReply() {
    return isReply;
  }

}

