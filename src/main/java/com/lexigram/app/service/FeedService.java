package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.model.Experience;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.User;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.SuggestionRepository;
import com.lexigram.app.repository.TagRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class FeedService {

  private final UserRepository userRepository;
  private final ExperienceService experienceService;
  private final SuggestionService suggestionService;
  private final ExperienceRepository experienceRepository;
  private final SuggestionRepository suggestionRepository;

  @Autowired
  public FeedService(UserRepository userRepository,
                     ExperienceService experienceService,
                     SuggestionService suggestionService,
                     ExperienceRepository experienceRepository,
                     SuggestionRepository suggestionRepository) {
    this.userRepository = userRepository;
    this.suggestionService = suggestionService;
    this.experienceService = experienceService;
    this.experienceRepository = experienceRepository;
    this.suggestionRepository = suggestionRepository;
  }

  public Optional<PostsDTO> getAllPostsExcludingUser(Long id){
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      return Optional.empty();
    }

    Set<ExperienceDTO> experiences = experienceService.getAllExperiencesExcludingUser(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllSuggestionsExcludingUser(id);
    return Optional.of(new PostsDTO(experiences, suggestions));
  }

  public PostsDTO getAllFollowingPosts(Long id){
    Set<ExperienceDTO> experiences = experienceService.getAllFollowingExperiences(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllFollowingSuggestions(id);

    return new PostsDTO(experiences, suggestions);
  }

  public PostsDTO getAllPublicPosts() {
    Set<ExperienceDTO> experiences = experienceService.getAllPublicExperiences();
    Set<SuggestionDTO> suggestions = suggestionService.getAllPublicSuggestions();
    return new PostsDTO(experiences, suggestions);
  }

  public SearchDTO getSearchObject(String object) {
    Set<Experience> experiencesByQuote = experienceRepository.findByQuoteStartingWithIgnoreCase(object);
    Set<Experience> experiencesByTag = experienceRepository.findByTagsNameStartingWithIgnoreCase(object);
    Set<Experience> experiencesByUser = experienceRepository.findByUserUsernameStartingWithIgnoreCase(object);
    Set<ExperienceDTO> experienceDTOS = new HashSet<>();

    for (Experience e : experiencesByQuote) {
      experienceDTOS.add(new ExperienceDTO(e));
    }

    for (Experience e : experiencesByTag) {
      experienceDTOS.add(new ExperienceDTO(e));
    }

    for (Experience e : experiencesByUser) {
      experienceDTOS.add(new ExperienceDTO(e));
    }

    Set<Suggestion> suggestionsByBody = suggestionRepository.findByBodyStartingWithIgnoreCase(object);
    Set<Suggestion> suggestionsByTag = suggestionRepository.findByTagsNameStartingWithIgnoreCase(object);
    Set<Suggestion> suggestionsByUser = suggestionRepository.findByUserUsernameStartingWithIgnoreCase(object);
    Set<SuggestionDTO> suggestionDTOS = new HashSet<>();

    for (Suggestion s : suggestionsByBody) {
      suggestionDTOS.add(new SuggestionDTO(s));
    }

    for (Suggestion s : suggestionsByTag) {
      suggestionDTOS.add(new SuggestionDTO(s));
    }

    for (Suggestion s : suggestionsByUser) {
      suggestionDTOS.add(new SuggestionDTO(s));
    }

    Set<User> users = userRepository.findByUsernameStartingWith(object);
    Set<ConnectionDTO> connectionDTOs = new HashSet<>();

    for (User u : users) {
      connectionDTOs.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), u.getUserProfile().getProfilePictureUrl()));
    }

    return new SearchDTO(experienceDTOS, connectionDTOs, suggestionDTOS);
  }

  /*
  public Set<UserPostsDTO> getAllDiscoverPosts(Long id){
    Set<Experience> experiences = experienceService.getAllDiscoverExperiences(id);
    Set<Suggestion> suggestions = suggestionService.getAllDiscoverSuggestions(id);
  }
   */
}

