package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.*;
import com.lexigram.app.repository.*;
import jakarta.transaction.Transactional;
import org.apache.commons.logging.Log;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InvalidObjectException;
import java.util.*;

@Service
public class ExperienceService {

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
                           ExperiencePrivacySettingsRepository experiencePrivacySettingsRepository) {
    this.experienceRepository = experienceRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.experienceStyleRepository = experienceStyleRepository;
    this.experiencePrivacySettingsRepository = experiencePrivacySettingsRepository;
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
        privacySettingsDTO.getAllowResonates(),
        privacySettingsDTO.getAllowSaves()
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
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);
    if (experienceOptional.isPresent()) {
      Experience experience = experienceOptional.get();

      String quote = experienceDTO.getQuote();
      if (quote == null || quote.trim().isEmpty()) {
        throw new IllegalArgumentException("Quote cannot be null or empty");
      } else {
        experience.setQuote(quote);
      }

      experienceRepository.save(experience);
      return Optional.of(new ExperienceDTO(experience));
    }
    return Optional.empty();
  }

  public Optional<ExperienceDTO> updateExperienceReflection(UUID uuid, UpdateExperienceReflectionDTO experienceDTO) {
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);
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
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);
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

  @Transactional
  public Optional<ExperienceDTO> updateExperienceMentions(UUID uuid, UpdateExperienceMentionsDTO dto) {
    if (uuid == null) {
      throw new IllegalArgumentException("El UUID de la experiencia no puede ser nulo");
    }

    Optional<Experience> experienceOpt = experienceRepository.findByUuid(uuid);
    if (experienceOpt.isEmpty()) {
      return Optional.empty();
    }

    Experience experience = experienceOpt.get();
    
    if (dto.getMentions().isEmpty()) {
      experience.setMentions(new HashSet<>());
      experienceRepository.save(experience);
      return Optional.of(new ExperienceDTO(experience));
    }
    
    Set<User> mentions = new HashSet<>();
    List<String> notFoundUsers = new ArrayList<>();

    for (String username : dto.getMentions()) {

      String trimmedUsername = username.trim();

      if (username == null || trimmedUsername.isEmpty()) {
        continue;
      }

      User user = null;

      try {
        Optional<User> userOpt = userRepository.findByUsername(trimmedUsername);
        if (userOpt.isPresent()) {
          user = userOpt.get();
        }
      } catch (Exception e) {
        notFoundUsers.add(trimmedUsername);
        continue;
      }

      mentions.add(user);
    }
    
    if (!notFoundUsers.isEmpty()) {
      String errorMsg = "Los siguientes usuarios no fueron encontrados: " + String.join(", ", notFoundUsers);
      throw new UserNotFoundException(errorMsg);
    }
    
    experience.setMentions(mentions);
    experienceRepository.save(experience);
    
    return Optional.of(new ExperienceDTO(experience));
  }

  public Optional<ExperienceDTO> resonateExperience(Long id, UUID uuid) {
    return null;
  }


  public Optional<ExperienceDTO> unResonateExperience(Long id, UUID uuid) {
    return null;
  }


  public Optional<ExperienceDTO> commentExperience(Long id, UUID uuid, PostCommentDTO comment) {
    return null;
  }


  public Optional<ExperienceDTO> uncCommentExperience(Long id, UUID expUuid, UUID comUuid) {
    return null;
  }


  public Optional<ExperienceDTO> saveExperience(Long id, UUID uuid) {
    return null;
  }


  public Optional<ExperienceDTO> unSaveExperience(Long id, UUID uuid) {
    return null;
  }


  public Optional<ExperienceDTO> forkExperience(Long id, UUID uuid, ForkExperienceDTO forkExperienceDTO) {
    return null;
  }


  public String getExperienceLink(UUID uuid) {
    return null;
  }

}