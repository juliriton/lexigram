package com.lexigram.app.service;

import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.SuggestionDTO;
import com.lexigram.app.dto.UserPostsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class FeedService {

  private final ExperienceService experienceService;
  private final SuggestionService suggestionService;

  @Autowired
  public FeedService(ExperienceService experienceService,
                     SuggestionService suggestionService) {
    this.suggestionService = suggestionService;
    this.experienceService = experienceService;
  }

  public UserPostsDTO getAllPosts(Long id){
    Set<ExperienceDTO> experiences = experienceService.getAllExperiencesExcludingUser(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllSuggestions(id);
    return new UserPostsDTO(experiences, suggestions);
  }

  /*
  public Set<UserPostsDTO> getAllFollowingPosts(Long id){
    Set<Experience> experiences = experienceService.getAllFollowingExperiences(id);
    Set<Suggestion> suggestions = suggestionService.getAllFollowingSuggestions(id);
  }

  public Set<UserPostsDTO> getAllDiscoverPosts(Long id){
    Set<Experience> experiences = experienceService.getAllDiscoverExperiences(id);
    Set<Suggestion> suggestions = suggestionService.getAllDiscoverSuggestions(id);
  }
   */

}
