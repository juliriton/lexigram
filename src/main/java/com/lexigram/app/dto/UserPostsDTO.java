package com.lexigram.app.dto;

import com.lexigram.app.model.Experience;
import com.lexigram.app.model.Suggestion;

import java.util.HashSet;
import java.util.Set;

public class UserPostsDTO {
  private Set<Experience> experiences;
  private Set<Suggestion> suggestions;

  public UserPostsDTO() {}

  public UserPostsDTO(Set<Experience> experiences, Set<Suggestion> suggestions) {
    this.experiences = experiences;
    this.suggestions = suggestions;
  }

  public Set<ExperienceDTO> getExperiences() {
    Set<ExperienceDTO> experienceDTOs = new HashSet<>();
    for (Experience experience : experiences) {
      experienceDTOs.add(new ExperienceDTO(experience));
    }
    return experienceDTOs;
  }

  public Set<SuggestionDTO> getSuggestions() {
    Set<SuggestionDTO> suggestionsDTO = new HashSet<>();
    for (Suggestion suggestion : suggestions) {
      suggestionsDTO.add(new SuggestionDTO(suggestion));
    }
    return suggestionsDTO;
  }

}
