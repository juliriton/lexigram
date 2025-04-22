package com.lexigram.app.dto;

import java.util.Set;

public class PostsDTO {

  private Set<ExperienceDTO> experiences;
  private Set<SuggestionDTO> suggestions;

  public PostsDTO() {}

  public PostsDTO(Set<ExperienceDTO> experiences, Set<SuggestionDTO> suggestions) {
    this.experiences = experiences;
    this.suggestions = suggestions;
  }

  public Set<ExperienceDTO> getExperiences() {
    return experiences;
  }

  public Set<SuggestionDTO> getSuggestions() {
    return suggestions;
  }

}
