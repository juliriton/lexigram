package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.model.User;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class FeedService {

  private final UserRepository userRepository;
  private final ExperienceService experienceService;
  private final SuggestionService suggestionService;

  @Autowired
  public FeedService(UserRepository userRepository,
                     ExperienceService experienceService,
                     SuggestionService suggestionService) {
    this.userRepository = userRepository;
    this.suggestionService = suggestionService;
    this.experienceService = experienceService;
  }

  public Optional<PostsDTO> getAllPostsExcludingUser(Long id){
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      return Optional.empty();
    }

    Set<ExperienceDTO> experiences = experienceService.getAllExperiencesExcludingUser(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllSuggestions(id);
    return Optional.of(new PostsDTO(experiences, suggestions));
  }

  public PostsDTO getAllFollowingPosts(){
    Set<ExperienceDTO> experiences = experienceService.getAllFollowingExperiences();
    Set<SuggestionDTO> suggestions = suggestionService.getAllFollowingSuggestions();

    return new PostsDTO(experiences, suggestions);
  }

  /*
  public Set<UserPostsDTO> getAllDiscoverPosts(Long id){
    Set<Experience> experiences = experienceService.getAllDiscoverExperiences(id);
    Set<Suggestion> suggestions = suggestionService.getAllDiscoverSuggestions(id);
  }
   */

}
