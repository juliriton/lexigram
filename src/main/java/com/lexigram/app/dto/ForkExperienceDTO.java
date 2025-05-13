package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;

public class ForkExperienceDTO {

  @NotNull
  @NotBlank
  @Size(min = 100, max = 800, message = "Reflection must be between 100 and 800 characters. Share something meaningful!")
  private String reflection;

  @NotEmpty
  @NotNull
  @Size(min = 1, message = "Forks should have at least 1 tag.")
  @Size(max = 20, message = "Forks should have at least 1 tag.")
  private Set<String> tags;

  private Set<String> mentions;

  @NotNull
  private PostExperienceStyleDTO postExperienceStyleDTO;

  @NotNull
  private PostExperiencePrivacySettingsDTO postExperiencePrivacySettingsDTO;

  public ForkExperienceDTO() {}

  public ForkExperienceDTO(String reflection,
                           Set<String> tags,
                           Set<String> mentions,
                           PostExperienceStyleDTO postExperienceStyleDTO,
                           PostExperiencePrivacySettingsDTO postExperiencePrivacySettingsDTO) {
    this.reflection = reflection;
    this.tags = tags;
    this.mentions = mentions;
    this.postExperienceStyleDTO = postExperienceStyleDTO;
    this.postExperiencePrivacySettingsDTO = postExperiencePrivacySettingsDTO;
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

  public PostExperienceStyleDTO getPostExperienceStyleDTO() {
    return postExperienceStyleDTO;
  }

  public PostExperiencePrivacySettingsDTO getPostExperiencePrivacySettingsDTO() {
    return postExperiencePrivacySettingsDTO;
  }

}
