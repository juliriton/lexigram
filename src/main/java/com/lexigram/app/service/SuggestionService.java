package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.Notification;
import com.lexigram.app.model.Save;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.suggestion.SuggestionPrivacySettings;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class SuggestionService {

  @Value("${lexigram.frontend.url}")
  private String URL;

  private final UserRepository userRepository;
  private final ExperienceService experienceService;
  private final ExperienceRepository experienceRepository;
  private final SuggestionPrivacySettingsRepository suggestionPrivacySettingsRepository;
  private final NotificationService notificationService;
  private final NotificationRepository notificationRepository;
  private SuggestionRepository suggestionRepository;
  private TagRepository tagRepository;
  private SaveRepository saveRepository;
  private ResonateRepository resonateRepository;
  private final UserProfileRepository userProfileRepository;

  @Autowired
  public SuggestionService(SuggestionRepository suggestionRepository,
                           UserRepository userRepository,
                           TagRepository tagRepository,
                           ExperienceService experienceService,
                           ExperienceRepository experienceRepository,
                           SaveRepository saveRepository,
                           ResonateRepository resonateRepository,
                           SuggestionPrivacySettingsRepository suggestionPrivacySettingsRepository,
                           NotificationService notificationService,
                           NotificationRepository notificationRepository,
                           UserProfileRepository userProfileRepository) {
    this.suggestionRepository = suggestionRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.experienceService = experienceService;
    this.experienceRepository = experienceRepository;
    this.saveRepository = saveRepository;
    this.resonateRepository = resonateRepository;
    this.suggestionPrivacySettingsRepository = suggestionPrivacySettingsRepository;
    this.notificationService = notificationService;
    this.notificationRepository = notificationRepository;
    this.userProfileRepository = userProfileRepository;
  }

  public SuggestionDTO createSuggestion(Long id, PostSuggestionDTO postSuggestionDTO) {
    Set<Tag> tags = new HashSet<>();

    for (String t : postSuggestionDTO.getTags()) {
      Optional<Tag> tagOptional = tagRepository.findByName(t);
      if (tagOptional.isPresent()) {
        tags.add(tagOptional.get());
      } else {
        Tag tag = new Tag(t);
        tagRepository.save(tag);
        tags.add(tag);
      }
    }

    String body = postSuggestionDTO.getBody();
    User user = userRepository.findById(id).get();
    PostSuggestionPrivacySettingsDTO privacySettings = postSuggestionDTO.getPrivacySettings();

    Suggestion suggestion = new Suggestion(user, tags, body);
    suggestionRepository.save(suggestion);
    SuggestionPrivacySettings suggestionPrivacySettings = new SuggestionPrivacySettings(suggestion,
                                                                                        privacySettings.getAllowResonates(),
                                                                                        privacySettings.getAllowSaves());
    suggestionPrivacySettingsRepository.save(suggestionPrivacySettings);

    suggestion.setPrivacySettings(suggestionPrivacySettings);
    suggestionRepository.save(suggestion);

    return new SuggestionDTO(suggestion);
  }

  public Set<SuggestionDTO> getAllSuggestionsExcludingUser(Long id){
    Set<User> publicUsers = userRepository.findByUserPrivacySettingsVisibilityTrue();
    Set<SuggestionDTO> publicSuggestions = new HashSet<>();

    for (User user : publicUsers) {
      Long userId = user.getId();

      if (userId.equals(id)) {
        continue;
      }

      Set<Suggestion> userSuggestions = suggestionRepository.getSuggestionsByUserId(userId);
      for (Suggestion suggestion : userSuggestions) {
        // Cargar explícitamente las privacySettings si es necesario
        if (suggestion.getPrivacySettings() == null) {
          SuggestionPrivacySettings settings = suggestionPrivacySettingsRepository
              .findBySuggestionId(suggestion.getId()).orElse(null);
          suggestion.setPrivacySettings(settings);
        }
        publicSuggestions.add(new SuggestionDTO(suggestion));
      }
    }

    return publicSuggestions;
  }

  public Set<SuggestionDTO> getAllPublicSuggestions(){
    Set<User> publicUsers = userRepository.findByUserPrivacySettingsVisibilityTrue();
    Set<SuggestionDTO> publicSuggestions = new HashSet<>();

    for (User user : publicUsers) {
      Long userId = user.getId();

      Set<Suggestion> userSuggestions = suggestionRepository.getSuggestionsByUserId(userId);
      for (Suggestion suggestion : userSuggestions) {
        // Cargar explícitamente las privacySettings si es necesario
        if (suggestion.getPrivacySettings() == null) {
          SuggestionPrivacySettings settings = suggestionPrivacySettingsRepository
              .findBySuggestionId(suggestion.getId()).orElse(null);
          suggestion.setPrivacySettings(settings);
        }
        publicSuggestions.add(new SuggestionDTO(suggestion));
      }
    }

    return publicSuggestions;
  }

  public Set<SuggestionDTO> getAllFollowingSuggestions(Long id) {
    User user = userRepository.findById(id).get();

    Set<SuggestionDTO> followingSuggestions = new HashSet<>();
    for (User u : user.getFollowing()) {
      Long userId = u.getId();
      Set<Suggestion> userSuggestions = suggestionRepository.getSuggestionsByUserId(userId);
      for (Suggestion suggestion : userSuggestions) {
        // Cargar explícitamente las privacySettings si es necesario
        if (suggestion.getPrivacySettings() == null) {
          SuggestionPrivacySettings settings = suggestionPrivacySettingsRepository
              .findBySuggestionId(suggestion.getId()).orElse(null);
          suggestion.setPrivacySettings(settings);
        }
        followingSuggestions.add(new SuggestionDTO(suggestion));
      }
    }
    return followingSuggestions;
  }

  @Transactional
  public boolean deleteSuggestion(UUID suggestionUuid, Long userId) {
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(suggestionUuid);
    if (suggestionOptional.isEmpty()){
      return false;
    }

    Suggestion suggestion = suggestionOptional.get();

    if (!suggestion.getUser().getId().equals(userId)) {
      throw new SecurityException("User does not have permission to delete this suggestion");
    }
    notificationRepository.deleteBySuggestionId(suggestion.getId());

    if (suggestion.getReplies() != null && !suggestion.getReplies().isEmpty()) {
      for (Experience reply : suggestion.getReplies()) {
        reply.setSuggestion(null);
        experienceRepository.save(reply);
      }
    }

    suggestionRepository.deleteById(suggestion.getId());

    return true;
  }

  public Optional<SuggestionDTO> updateSuggestionTag(UUID uuid, UpdateSuggestionTagDTO updateTagDTO, Long userId) {
    Set<Tag> tags = new HashSet<>();
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);

    if (suggestionOptional.isPresent()) {
      Suggestion suggestion = suggestionOptional.get();

      for (String t : updateTagDTO.getTags()) {
        Optional<Tag> tagOptional = tagRepository.findByName(t);
        if (tagOptional.isPresent()) {
          tags.add(tagOptional.get());
        } else {
          Tag tag = new Tag(t);
          // Save the tag first to ensure it gets a UUID and is properly persisted
          tag = tagRepository.save(tag);
          tags.add(tag);
        }
      }

      suggestion.setTags(tags);
      suggestion = suggestionRepository.save(suggestion);

      // Refresh the suggestion from database to ensure all relationships are loaded
      suggestion = suggestionRepository.findByUuid(uuid).orElse(suggestion);

      // Ensure privacy settings are loaded
      if (suggestion.getPrivacySettings() == null) {
        SuggestionPrivacySettings settings = suggestionPrivacySettingsRepository
            .findBySuggestionId(suggestion.getId()).orElse(null);
        suggestion.setPrivacySettings(settings);
      }

      // Create SuggestionDTO with correct inFeed status for each tag
      return Optional.of(createSuggestionDTOWithCorrectTagStatus(suggestion, userId));
    }

    return Optional.empty();
  }

  // Add this helper method to create SuggestionDTO with correct tag status
  private SuggestionDTO createSuggestionDTOWithCorrectTagStatus(Suggestion suggestion, Long userId) {
    // Get user's feed tags
    Set<Tag> userFeedTags = new HashSet<>();
    Optional<UserProfile> userProfileOptional = userProfileRepository.findByUserId(userId);
    if (userProfileOptional.isPresent()) {
      userFeedTags = userProfileOptional.get().getFeedTags();
    }

    // Create a temporary suggestion with tags that have correct inFeed status
    for (Tag tag : suggestion.getTags()) {
      tag.setInFeed(userFeedTags.contains(tag));
    }

    return new SuggestionDTO(suggestion);
  }

  public Optional<SuggestionDTO> resonateSuggestion(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);

    if (suggestionOptional.isEmpty()) {
      return Optional.empty();
    }

    Suggestion suggestion = suggestionOptional.get();
    Optional<Resonate> resonateOptional = resonateRepository.findBySuggestionUuidAndUserId(uuid, id);

    if (resonateOptional.isPresent()) {
      throw new UnsupportedOperationException();
    }

    Resonate resonate = new Resonate(user, suggestion);

    // Only create notification if it's not null (not self-resonating)
    Notification notification = notificationService.resonateSuggestionNotification(user, suggestion);
    if (notification != null) {
      notificationRepository.save(notification);
    }

    suggestion.addResonate(resonate);
    resonateRepository.save(resonate);
    suggestionRepository.save(suggestion);
    userRepository.save(user);

    return Optional.of(new SuggestionDTO(suggestion));
  }
  @Transactional
  public Optional<SuggestionDTO> unResonateSuggestion(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);
    Optional<Resonate> resonateOptional = resonateRepository.findBySuggestionUuidAndUserId(uuid, id);

    if (suggestionOptional.isEmpty() || resonateOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Suggestion suggestion = suggestionOptional.get();
    Resonate resonate = resonateOptional.get();

    suggestion.removeResonate(resonate);
    resonateRepository.deleteBySuggestionUuidAndUserId(uuid, id);
    suggestionRepository.save(suggestion);
    userRepository.save(user);
    return Optional.of(new SuggestionDTO(suggestion));
  }

  public Optional<SuggestionDTO> saveSuggestion(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);

    if (suggestionOptional.isEmpty()) {
      return Optional.empty();
    }

    Suggestion suggestion = suggestionOptional.get();

    Optional<Save> saveOptional = saveRepository.findBySuggestionUuidAndUserId(uuid, id);

    if (saveOptional.isPresent()) {
      throw new UnsupportedOperationException();
    }

    Save save = new Save(user, suggestion);
    suggestion.addSave(save);
    saveRepository.save(save);
    suggestionRepository.save(suggestion);
    userRepository.save(user);

    return Optional.of(new SuggestionDTO(suggestion));
  }

  @Transactional
  public Optional<SuggestionDTO> unSaveSuggestion(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);

    if (suggestionOptional.isEmpty()) {
      return Optional.empty();
    }

    Suggestion suggestion = suggestionOptional.get();

    Optional<Save> saveOptional = saveRepository.findBySuggestionUuidAndUserId(uuid, id);

    if (saveOptional.isEmpty()) {
      return Optional.empty();
    }

    if (suggestion.getSaves().contains(saveOptional.get())) {
      Save save = saveOptional.get();
      suggestion.removeSave(save);
      saveRepository.deleteBySuggestionUuidAndUserId(uuid, id);
      suggestionRepository.save(suggestion);
      userRepository.save(user);

      return Optional.of(new SuggestionDTO(suggestion));
    }

    throw new UnsupportedOperationException();
  }

  public Optional<SuggestionDTO> replySuggestion(Long id,
                                                 UUID uuid,
                                                 PostExperienceDTO postExperienceDTO,
                                                 MultipartFile file) throws IOException {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);

    if (suggestionOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Suggestion suggestion = suggestionOptional.get();
    ExperienceDTO replyDTO = experienceService.createExperience(id, postExperienceDTO, file);

    Experience reply = experienceRepository.findByUuid(replyDTO.getUuid()).get();

    suggestion.addReply(reply);
    reply.setSuggestion(suggestion);

    experienceRepository.save(reply);
    suggestionRepository.save(suggestion);
    userRepository.save(user);

    return Optional.of(new SuggestionDTO(suggestion));

  }

  public String getSuggestionLink(UUID uuid) {
    return URL + "/?suggestion=" + uuid.toString();
  }

  public Set<SuggestionDTO> getSavedSuggestions(Long id) {
    Set<SuggestionDTO> publicSavedSuggestions = new HashSet<>();

    Set<Save> saved = saveRepository.findAllByUserIdAndSuggestionIsNotNull(id);

    for (Save save : saved) {
      Suggestion suggestion = save.getSuggestion();
      if (suggestion.getUser().getUserPrivacySettings().getVisibility()){
        publicSavedSuggestions.add(new SuggestionDTO(suggestion));
      }
    }
    return publicSavedSuggestions;
  }

  public Set<ExperienceDTO> getAllReplies(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);
    if (suggestionOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Suggestion suggestion = suggestionOptional.get();
    Set<ExperienceDTO> replies = new HashSet<>();

    for (Experience e : suggestion.getReplies()) {
      if (e.getUser().getUserPrivacySettings().getVisibility() ||
          e.getUser().getId().equals(id) ||
          userOptional.get().getFollowing().contains(e.getUser())) {
        replies.add(new ExperienceDTO(e));
      }
    }

    return replies;
  }

  public Optional<SuggestionDTO> getSuggestionFromUuid(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);

    if (suggestionOptional.isEmpty()) {
      return Optional.empty();
    }

    Suggestion suggestion = suggestionOptional.get();

    return Optional.of(new SuggestionDTO(suggestion));
  }

  public Optional<SuggestionDTO> getPublicSuggestionByUuid(UUID uuid) {
    Optional<Suggestion> suggestionOptional = suggestionRepository.findByUuid(uuid);
    if (suggestionOptional.isPresent()) {
      Suggestion suggestion = suggestionOptional.get();
      if (suggestion.getUser().getUserPrivacySettings().getVisibility()) {
        return Optional.of(new SuggestionDTO(suggestion));
      }
    }
    return Optional.empty();
  }

}
