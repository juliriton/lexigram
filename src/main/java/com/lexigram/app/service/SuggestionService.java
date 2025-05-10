package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.SuggestionRepository;
import com.lexigram.app.repository.TagRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class SuggestionService {

  private final UserRepository userRepository;
  private final ExperienceService experienceService;
  private final ExperienceRepository experienceRepository;
  private SuggestionRepository suggestionRepository;
  private TagRepository tagRepository;

  @Autowired
  public SuggestionService(SuggestionRepository suggestionRepository,
                           UserRepository userRepository,
                           TagRepository tagRepository, ExperienceService experienceService, ExperienceRepository experienceRepository) {
    this.suggestionRepository = suggestionRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.experienceService = experienceService;
    this.experienceRepository = experienceRepository;
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

    Suggestion suggestion = new Suggestion(user, tags, body);
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
        followingSuggestions.add(new SuggestionDTO(suggestion));
      }
    }
    return followingSuggestions;
  }

  public boolean deleteSuggestion(UUID suggestionUuid, Long userId) {
    Optional<Suggestion> suggestion = suggestionRepository.findByUuid(suggestionUuid);
    if (suggestion.isEmpty()){
      return false;
    }
    suggestionRepository.deleteById(suggestion.get().getId());
    User user = userRepository.findById(userId).get();
    userRepository.save(user);
    return true;
  }

  public Optional<SuggestionDTO> resonateSuggestion(Long id, UUID uuid) {
    return null;
  }

  public Optional<SuggestionDTO> unResonateSuggestion(Long id, UUID uuid) {
    return null;
  }

  public Optional<SuggestionDTO> saveSuggestion(Long id, UUID uuid) {
    return null;
  }

  public Optional<SuggestionDTO> unSaveSuggestion(Long id, UUID uuid) {
    return null;
  }

  public Optional<SuggestionDTO> replySuggestion(Long id, UUID uuid, PostExperienceDTO postExperienceDTO, MultipartFile file) throws IOException {
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
    suggestionRepository.save(suggestion);
    userRepository.save(user);

    return Optional.of(new SuggestionDTO(suggestion));

  }

  public String getSuggestionLink(UUID uuid) {
    return "https://lexigram.app/suggestion/" + uuid.toString();
  }

}
