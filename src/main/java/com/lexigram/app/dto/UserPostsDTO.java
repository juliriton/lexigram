package com.lexigram.app.dto;

import java.util.Set;

public class UserPostsDTO {
  private UserDTO user;
  private Set<ExperienceDTO> experiences;
  private Set<SuggestionDTO> suggestions;

  public UserPostsDTO() {}

  public UserPostsDTO(UserDTO user, Set<ExperienceDTO> experiences, Set<SuggestionDTO> suggestions) {
    this.user = user;
    this.experiences = experiences;
    this.suggestions = suggestions;
  }

  public Set<ExperienceDTO> getExperiences() {
    return experiences;
  }

  public Set<SuggestionDTO> getSuggestions() {
    return suggestions;
  }

  public UserDTO getUser() {
    return user;
  }

}
