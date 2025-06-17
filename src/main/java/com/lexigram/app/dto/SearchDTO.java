package com.lexigram.app.dto;

import java.util.Set;

public class SearchDTO {

  private Set<ConnectionDTO> connections;
  private Set<ExperienceDTO> experiences;
  private Set<SuggestionDTO> suggestions;
  private Set<TagDTO> tags;

  public SearchDTO(Set<ExperienceDTO> experiences,
                   Set<ConnectionDTO> connections,
                   Set<SuggestionDTO> suggestions,
                   Set<TagDTO> tags) {
    this.experiences = experiences;
    this.connections = connections;
    this.suggestions = suggestions;
    this.tags = tags;
  }

  public Set<ConnectionDTO> getConnections() {
    return connections;
  }

  public Set<ExperienceDTO> getExperiences() {
    return experiences;
  }

  public Set<SuggestionDTO> getSuggestions() {
    return suggestions;
  }

  public Set<TagDTO> getTags() {
    return tags;
  }

}
