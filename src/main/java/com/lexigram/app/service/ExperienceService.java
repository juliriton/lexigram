package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.*;
import com.lexigram.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InvalidObjectException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class ExperienceService {

  private final SuggestionRepository suggestionRepository;
  @Value("${lexigram.upload.dir}")
  private String uploadDir;

  private final UserRepository userRepository;
  private final ExperienceRepository experienceRepository;
  private final TagRepository tagRepository;
  private final ExperienceStyleRepository experienceStyleRepository;
  private final ExperiencePrivacySettingsRepository experiencePrivacySettingsRepository;

  @Autowired
  public ExperienceService(ExperienceRepository experienceRepository,
                           UserRepository userRepository,
                           TagRepository tagRepository,
                           ExperienceStyleRepository experienceStyleRepository,
                           ExperiencePrivacySettingsRepository experiencePrivacySettingsRepository, SuggestionRepository suggestionRepository) {
    this.experienceRepository = experienceRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.experienceStyleRepository = experienceStyleRepository;
    this.experiencePrivacySettingsRepository = experiencePrivacySettingsRepository;
    this.suggestionRepository = suggestionRepository;
  }

  public ExperienceDTO createExperience(Long id, PostExperienceDTO postExperienceDTO, MultipartFile file) throws IOException {
    User user = userRepository.findById(id).get();
    Set<User> mentions = new HashSet<>();
    Set<Tag> tags = new HashSet<>();

    if (postExperienceDTO.getMentions() != null) {
      for (String username : postExperienceDTO.getMentions()) {
        if (username.equals(user.getUsername())) {
          throw new InvalidObjectException("Cannot mention yourself in a post!");
        }
        Optional<User> mention = userRepository.findByUsername(username);
        if (mention.isPresent()) {
          mentions.add(mention.get());
        } else {
          throw new UserNotFoundException();
        }
      }
    }

    for (String t : postExperienceDTO.getTags()) {
      Optional<Tag> tagOptional = tagRepository.findByName(t);
      if (tagOptional.isPresent()) {
        tags.add(tagOptional.get());
      } else {
        Tag tag = new Tag(t);
        tagRepository.save(tag);
        tags.add(tag);
      }
    }

    Experience experience;
    String quote = postExperienceDTO.getQuote();
    String reflection = postExperienceDTO.getReflection();

    experience = new Experience(user, mentions, tags, quote, reflection);

    experience = experienceRepository.save(experience);

    experience.setOrigin(experience);
    experience = experienceRepository.save(experience);

    PostExperienceStyleDTO styleDTO = postExperienceDTO.getStyle();
    PostExperiencePrivacySettingsDTO privacySettingsDTO = postExperienceDTO.getPrivacySettings();

    if (file != null && !file.isEmpty()) {
      String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
      File destination = new File(uploadDir + File.separator + fileName);
      destination.getParentFile().mkdirs();
      file.transferTo(destination);

      String relativePath = "/images/" + fileName;

      ExperienceStyle style = new ExperienceStyle(
          experience,
          styleDTO.getFontFamily(),
          styleDTO.getFontSize(),
          styleDTO.getFontColor(),
          styleDTO.getTextPositionX(),
          styleDTO.getTextPositionY(),
          relativePath
      );
      experienceStyleRepository.save(style);
      experience.setStyle(style);
    }

    ExperiencePrivacySettings privacy = new ExperiencePrivacySettings(
        experience,
        privacySettingsDTO.getAllowComments(),
        privacySettingsDTO.getAllowForks(),
        privacySettingsDTO.getAllowResonates()
    );
    experiencePrivacySettingsRepository.save(privacy);
    experience.setPrivacySettings(privacy);

    experience = experienceRepository.save(experience);

    return new ExperienceDTO(experience);
  }

  public Set<ExperienceDTO> getAllExperiencesExcludingUser(Long id){
    Set<User> publicUsers = userRepository.findByUserPrivacySettingsVisibilityTrue();
    Set<ExperienceDTO> publicExperiences = new HashSet<>();

    for (User user : publicUsers) {
      Long userId = user.getId();
      if (userId.equals(id)) {
        continue;
      }
      Set<Experience> userExperiences = experienceRepository.getExperiencesByUserId(userId);
      for (Experience experience : userExperiences) {
        publicExperiences.add(new ExperienceDTO(experience));
      }
    }

    return publicExperiences;
  }

  public Set<ExperienceDTO> getAllPublicExperiences(){
    Set<User> publicUsers = userRepository.findByUserPrivacySettingsVisibilityTrue();
    Set<ExperienceDTO> publicExperiences = new HashSet<>();

    for (User user : publicUsers) {
      Long userId = user.getId();
      Set<Experience> userExperiences = experienceRepository.getExperiencesByUserId(userId);
      for (Experience experience : userExperiences) {
        publicExperiences.add(new ExperienceDTO(experience));
      }
    }

    return publicExperiences;
  }

  public Set<ExperienceDTO> getAllFollowingExperiences(Long id) {
    User user = userRepository.findById(id).get();

    Set<ExperienceDTO> followingExperiences = new HashSet<>();
    for (User u : user.getFollowing()) {
      Long userId = u.getId();
      Set<Experience> userExperiences = experienceRepository.getExperiencesByUserId(userId);
      for (Experience experience : userExperiences) {
        followingExperiences.add(new ExperienceDTO(experience));
      }
    }
    return followingExperiences;
  }

  public boolean deleteExperience(UUID experienceUuid, Long userId) {
    Optional<Experience> experience = experienceRepository.findByUuid(experienceUuid);
    if (experience.isEmpty()){
      return false;
    }
    experienceRepository.deleteById(experience.get().getId());
    User user = userRepository.findById(userId).get();
    userRepository.save(user);
    return true;
  }

  public Optional<ExperienceDTO> updateExperienceQuote(UUID uuid, UpdateExperienceQuoteDTO experienceDTO) {
    Optional<Experience> experienceOptional = experienceRepository.findExperienceByUuid(uuid);
    if (experienceOptional.isPresent()) {
      Experience experience = experienceOptional.get();
      experience.setQuote(experienceDTO.getQuote());
      experienceRepository.save(experience);
      return Optional.of(new ExperienceDTO(experience));
    }
    return Optional.empty();
  }

  public Optional<ExperienceDTO> updateExperienceReflection(UUID uuid, UpdateExperienceReflectionDTO experienceDTO) {
    Optional<Experience> experienceOptional = experienceRepository.findExperienceByUuid(uuid);
    if (experienceOptional.isPresent()) {
      Experience experience = experienceOptional.get();
      experience.setReflection(experienceDTO.getReflection());
      experienceRepository.save(experience);
      return Optional.of(new ExperienceDTO(experience));
    }
    return Optional.empty();
  }

  public Optional<ExperienceDTO> updateExperienceTag(UUID uuid, UpdateExperienceTagDTO updateTagDTO) {
    Set<Tag> tags = new HashSet<>();
    Optional<Experience> experienceOptional = experienceRepository.findExperienceByUuid(uuid);
    if (experienceOptional.isPresent()) {
      Experience experience = experienceOptional.get();

      for (String t : updateTagDTO.getTags()) {
        Optional<Tag> tagOptional = tagRepository.findByName(t);
        if (tagOptional.isPresent()) {
          tags.add(tagOptional.get());
        } else {
          Tag tag = new Tag(t);
          tagRepository.save(tag);
          tags.add(tag);
        }
      }
      experience.setTags(tags);
      experienceRepository.save(experience);
      return Optional.of(new ExperienceDTO(experience));
    }
    return Optional.empty();
  }

  public Optional<ExperienceDTO> updateExperienceMentions(UUID uuid, UpdateExperienceMentionsDTO updateMentionDTO) {
    Set<User> mentions = new HashSet<>();
    Optional<Experience> experienceOptional = experienceRepository.findExperienceByUuid(uuid);
    if (experienceOptional.isPresent()) {
      Experience experience = experienceOptional.get();

      if (updateMentionDTO.getMentions() != null) {
        for (String username : updateMentionDTO.getMentions()) {
          Optional<User> mention = userRepository.findByUsername(username);
          if (mention.isPresent()) {
            mentions.add(mention.get());
          } else {
            throw new UserNotFoundException();
          }
        }
      }

      experience.setMentions(mentions);
      experienceRepository.save(experience);
      return Optional.of(new ExperienceDTO(experience));
    }
    return Optional.empty();
  }

}