package com.lexigram.app.dto;

import com.lexigram.app.model.Experience;
import com.lexigram.app.model.Suggestion;

import java.util.HashSet;
import java.util.Set;

public class UserPostsDTO {
  private Set<ExperienceDTO> experiences;
  private Set<SuggestionDTO> suggestions;

  public UserPostsDTO() {}

  public UserPostsDTO(Set<ExperienceDTO> experiences, Set<SuggestionDTO> suggestions) {
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
