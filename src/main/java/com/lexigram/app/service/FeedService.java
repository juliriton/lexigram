package com.lexigram.app.service;

import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.SuggestionDTO;
import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.dto.UserPostsDTO;
import com.lexigram.app.model.User;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

  public UserPostsDTO getAllPosts(Long id){
    User user = userRepository.findById(id).get();
    UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail());

    Set<ExperienceDTO> experiences = experienceService.getAllExperiencesExcludingUser(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllSuggestions(id);
    return new UserPostsDTO(userDTO, experiences, suggestions);
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
