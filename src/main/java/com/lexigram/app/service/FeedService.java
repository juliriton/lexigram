package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.repository.*;
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
  private final UserProfileRepository userProfileRepository;
  private final TagService tagService;

  @Autowired
  public FeedService(UserRepository userRepository,
                     ExperienceService experienceService,
                     SuggestionService suggestionService,
                     ExperienceRepository experienceRepository,
                     SuggestionRepository suggestionRepository,
                     TagRepository tagRepository,
                     UserProfileRepository userProfileRepository,
                     TagService tagService) {
    this.userRepository = userRepository;
    this.suggestionService = suggestionService;
    this.experienceService = experienceService;
    this.experienceRepository = experienceRepository;
    this.suggestionRepository = suggestionRepository;
    this.tagRepository = tagRepository;
    this.userProfileRepository = userProfileRepository;
    this.tagService = tagService;
  }

  public Optional<PostsDTO> getAllPostsExcludingUserWithUserTags(Long id) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      return Optional.empty();
    }

    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);
    if (profileOpt.isEmpty()) {
      return Optional.empty();
    }

    Set<ExperienceDTO> experiences = experienceService.getAllExperiencesExcludingUser(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllSuggestionsExcludingUser(id);

    Set<TagDTO> userTags = tagService.getAllFeedTags(id).orElse(new HashSet<>());

    Set<ExperienceDTO> filteredExperiences = new HashSet<>();
    for (ExperienceDTO experience : experiences) {
      Set<TagDTO> tags = experience.getTags();
      boolean hasMatchingTag = false;
      for (TagDTO tag : tags) {
        if (userTags.contains(tag)) {
          hasMatchingTag = true;
          break;
        }
      }
      if (hasMatchingTag) {
        filteredExperiences.add(experience);
      }
    }

    Set<SuggestionDTO> filteredSuggestions = new HashSet<>();
    for (SuggestionDTO suggestion : suggestions) {
      Set<TagDTO> tags = suggestion.getTags();
      boolean hasMatchingTag = false;
      for (TagDTO tag : tags) {
        if (userTags.contains(tag)) {
          hasMatchingTag = true;
          break;
        }
      }
      if (hasMatchingTag) {
        filteredSuggestions.add(suggestion);
      }
    }

    return Optional.of(new PostsDTO(filteredExperiences, filteredSuggestions));
  }

  public PostsDTO getAllFollowingPosts(Long id) {
    Set<ExperienceDTO> experiences = experienceService.getAllFollowingExperiences(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllFollowingSuggestions(id);
    Set<TagDTO> userTags = tagService.getAllFeedTags(id).orElse(new HashSet<>());

    Set<ExperienceDTO> filteredExperiences = new HashSet<>();
    for (ExperienceDTO experience : experiences) {
      Set<TagDTO> tags = experience.getTags();
      boolean hasMatchingTag = false;
      for (TagDTO tag : tags) {
        if (userTags.contains(tag)) {
          hasMatchingTag = true;
          break;
        }
      }
      if (hasMatchingTag) {
        filteredExperiences.add(experience);
      }
    }

    Set<SuggestionDTO> filteredSuggestions = new HashSet<>();
    for (SuggestionDTO suggestion : suggestions) {
      Set<TagDTO> tags = suggestion.getTags();
      boolean hasMatchingTag = false;
      for (TagDTO tag : tags) {
        if (userTags.contains(tag)) {
          hasMatchingTag = true;
          break;
        }
      }
      if (hasMatchingTag) {
        filteredSuggestions.add(suggestion);
      }
    }

    return new PostsDTO(filteredExperiences, filteredSuggestions);
  }

  public PostsDTO getAllPublicPosts() {
    Set<ExperienceDTO> experiences = experienceService.getAllPublicExperiences();
    Set<SuggestionDTO> suggestions = suggestionService.getAllPublicSuggestions();
    return new PostsDTO(experiences, suggestions);
  }

  public SearchDTO getSearchObject(String object, Long searcherId,
                                   boolean searchUsers, boolean searchExperiences,
                                   boolean searchSuggestions, boolean searchTags,
                                   boolean exactMatch) {

    Map<UUID, Experience> uniqueExperiences = new HashMap<>();
    Map<UUID, Suggestion> uniqueSuggestions = new HashMap<>();
    Set<Tag> tags = new HashSet<>();
    Set<User> users = new HashSet<>();

    if (searchExperiences) {
      Set<Experience> experiencesByQuote = exactMatch ?
          experienceRepository.findByQuoteContainingIgnoreCase(object) :
          experienceRepository.findByQuoteStartingWithIgnoreCase(object);

      Set<Experience> experiencesByTag = exactMatch ?
          experienceRepository.findByTagsNameContainingIgnoreCase(object) :
          experienceRepository.findByTagsNameStartingWithIgnoreCase(object);

      Set<Experience> experiencesByUser = exactMatch ?
          experienceRepository.findByUserUsernameContainingIgnoreCase(object) :
          experienceRepository.findByUserUsernameStartingWithIgnoreCase(object);

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
    }

    if (searchSuggestions) {
      Set<Suggestion> suggestionsByBody = exactMatch ?
          suggestionRepository.findByBodyContainingIgnoreCase(object) :
          suggestionRepository.findByBodyStartingWithIgnoreCase(object);

      Set<Suggestion> suggestionsByTag = exactMatch ?
          suggestionRepository.findByTagsNameContainingIgnoreCase(object) :
          suggestionRepository.findByTagsNameStartingWithIgnoreCase(object);

      Set<Suggestion> suggestionsByUser = exactMatch ?
          suggestionRepository.findByUserUsernameContainingIgnoreCase(object) :
          suggestionRepository.findByUserUsernameStartingWithIgnoreCase(object);

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
    }

    if (searchTags) {
      tags = exactMatch ?
          tagRepository.findByNameContainingIgnoreCase(object) :
          tagRepository.findByNameStartingWithIgnoreCase(object);
    }

    if (searchUsers) {
      users = exactMatch ?
          userRepository.findByUsernameContainingIgnoreCase(object) :
          userRepository.findByUsernameStartingWithIgnoreCase(object);
    }

    Set<ExperienceDTO> experienceDTOs = new HashSet<>();
    for (Experience e : uniqueExperiences.values()) {
      experienceDTOs.add(new ExperienceDTO(e));
    }

    Set<SuggestionDTO> suggestionDTOs = new HashSet<>();
    for (Suggestion s : uniqueSuggestions.values()) {
      suggestionDTOs.add(new SuggestionDTO(s));
    }

    Set<ConnectionDTO> connectionDTOs = new HashSet<>();
    for (User u : users) {
      connectionDTOs.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(),
          u.getUserProfile().getProfilePictureUrl()));
    }

    Set<TagDTO> tagDTOs = new HashSet<>();
    Optional<UserProfile> profileOpt = searcherId != null ?
        userProfileRepository.findByUserId(searcherId) : Optional.empty();
    Set<Tag> feedTags = profileOpt.map(UserProfile::getFeedTags).orElse(Collections.emptySet());

    for (Tag tag : tags) {
      tagDTOs.add(new TagDTO(tag.getUuid(), tag.getName(), feedTags.contains(tag)));
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

  public PostsDTO getAllDiscoverPosts(Long id) {
    Set<ExperienceDTO> experiences = experienceService.getAllExperiencesExcludingUser(id);
    Set<SuggestionDTO> suggestions = suggestionService.getAllSuggestionsExcludingUser(id);

    Set<TagDTO> userTags = tagService.getAllFeedTags(id).orElse(new HashSet<>());

    Set<ExperienceDTO> filteredExperiences = new HashSet<>();
    for (ExperienceDTO experience : experiences) {
      Set<TagDTO> tags = experience.getTags();
      boolean allTagsNotInUserTags = true;
      for (TagDTO tag : tags) {
        if (userTags.contains(tag)) {
          allTagsNotInUserTags = false;
          break;
        }
      }
      if (allTagsNotInUserTags) {
        filteredExperiences.add(experience);
      }
    }

    Set<SuggestionDTO> filteredSuggestions = new HashSet<>();
    for (SuggestionDTO suggestion : suggestions) {
      Set<TagDTO> tags = suggestion.getTags();
      boolean allTagsNotInUserTags = true;
      for (TagDTO tag : tags) {
        if (userTags.contains(tag)) {
          allTagsNotInUserTags = false;
          break;
        }
      }
      if (allTagsNotInUserTags) {
        filteredSuggestions.add(suggestion);
      }
    }

    return new PostsDTO(filteredExperiences, filteredSuggestions);
  }
}