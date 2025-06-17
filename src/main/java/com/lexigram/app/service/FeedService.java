package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.SuggestionRepository;
import com.lexigram.app.repository.TagRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FeedService {

  private final UserRepository userRepository;
  private final ExperienceService experienceService;
  private final SuggestionService suggestionService;
  private final ExperienceRepository experienceRepository;
  private final SuggestionRepository suggestionRepository;
  private final TagRepository tagRepository;

  @Autowired
  public FeedService(UserRepository userRepository,
                     ExperienceService experienceService,
                     SuggestionService suggestionService,
                     ExperienceRepository experienceRepository,
                     SuggestionRepository suggestionRepository,
                     TagRepository tagRepository) {
    this.userRepository = userRepository;
    this.suggestionService = suggestionService;
    this.experienceService = experienceService;
    this.experienceRepository = experienceRepository;
    this.suggestionRepository = suggestionRepository;
    this.tagRepository = tagRepository;
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

  public SearchDTO getSearchObject(String object, Long searcherId) {
    Map<UUID, Experience> uniqueExperiences = new HashMap<>();
    Map<UUID, Suggestion> uniqueSuggestions = new HashMap<>();

    Set<Experience> experiencesByQuote = experienceRepository.findByQuoteStartingWithIgnoreCase(object);
    Set<Experience> experiencesByTag = experienceRepository.findByTagsNameStartingWithIgnoreCase(object);
    Set<Experience> experiencesByUser = experienceRepository.findByUserUsernameStartingWithIgnoreCase(object);

    for (Experience e : experiencesByQuote) {
      if (isPostVisibleToUser(e.getUser(), searcherId)) {
        uniqueExperiences.put(e.getUuid(), e);
      }
    }
    for (Experience e : experiencesByTag) {
      if (isPostVisibleToUser(e.getUser(), searcherId)) {
        uniqueExperiences.put(e.getUuid(), e);
      }
    }
    for (Experience e : experiencesByUser) {
      if (isPostVisibleToUser(e.getUser(), searcherId)) {
        uniqueExperiences.put(e.getUuid(), e);
      }
    }

    Set<ExperienceDTO> experienceDTOs = new HashSet<>();
    for (Experience e : uniqueExperiences.values()) {
      experienceDTOs.add(new ExperienceDTO(e));
    }

    Set<Suggestion> suggestionsByBody = suggestionRepository.findByBodyStartingWithIgnoreCase(object);
    Set<Suggestion> suggestionsByTag = suggestionRepository.findByTagsNameStartingWithIgnoreCase(object);
    Set<Suggestion> suggestionsByUser = suggestionRepository.findByUserUsernameStartingWithIgnoreCase(object);

    for (Suggestion s : suggestionsByBody) {
      if (isPostVisibleToUser(s.getUser(), searcherId)) {
        uniqueSuggestions.put(s.getUuid(), s);
      }
    }
    for (Suggestion s : suggestionsByTag) {
      if (isPostVisibleToUser(s.getUser(), searcherId)) {
        uniqueSuggestions.put(s.getUuid(), s);
      }
    }
    for (Suggestion s : suggestionsByUser) {
      if (isPostVisibleToUser(s.getUser(), searcherId)) {
        uniqueSuggestions.put(s.getUuid(), s);
      }
    }

    Set<SuggestionDTO> suggestionDTOs = new HashSet<>();
    for (Suggestion s : uniqueSuggestions.values()) {
      suggestionDTOs.add(new SuggestionDTO(s));
    }

    Set<User> users = userRepository.findByUsernameStartingWith(object);
    Set<ConnectionDTO> connectionDTOs = new HashSet<>();

    for (User u : users) {
      connectionDTOs.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), u.getUserProfile().getProfilePictureUrl()));
    }

    Set<Tag> tags = tagRepository.findByNameStartingWith(object);
    Set<TagDTO> tagDTOs = new HashSet<>();

    for (Tag tag : tags) {
      tagDTOs.add(new TagDTO(tag.getUuid(), tag.getName()));
    }

    return new SearchDTO(experienceDTOs, connectionDTOs, suggestionDTOs, tagDTOs);
  }

  private boolean isPostVisibleToUser(User postOwner, Long searcherId) {
    if (postOwner.getUserPrivacySettings().getVisibility()) {
      return true;
    }

    if (searcherId != null) {
      Optional<User> searcherOptional = userRepository.findById(searcherId);
      if (searcherOptional.isPresent()) {
        User searcher = searcherOptional.get();
        return searcher.getFollowing().contains(postOwner);
      }
    }

    return false;
  }

  /*
  public Set<UserPostsDTO> getAllDiscoverPosts(Long id){
    Set<Experience> experiences = experienceService.getAllDiscoverExperiences(id);
    Set<Suggestion> suggestions = suggestionService.getAllDiscoverSuggestions(id);
  }
   */
}

