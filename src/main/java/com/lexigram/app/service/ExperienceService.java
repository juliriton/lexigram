package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.*;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.experience.ExperiencePrivacySettings;
import com.lexigram.app.model.experience.ExperienceStyle;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.*;
import jakarta.transaction.Transactional;
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
  private final ResonateRepository resonateRepository;
  private final CommentRepository commentRepository;
  private final SaveRepository saveRepository;

  @Autowired
  public ExperienceService(ExperienceRepository experienceRepository,
                           UserRepository userRepository,
                           TagRepository tagRepository,
                           ExperienceStyleRepository experienceStyleRepository,
                           ExperiencePrivacySettingsRepository experiencePrivacySettingsRepository,
                           ResonateRepository resonateRepository,
                           CommentRepository commentRepository,
                           SaveRepository saveRepository) {
    this.experienceRepository = experienceRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.experienceStyleRepository = experienceStyleRepository;
    this.experiencePrivacySettingsRepository = experiencePrivacySettingsRepository;
    this.resonateRepository = resonateRepository;
    this.commentRepository = commentRepository;
    this.saveRepository = saveRepository;
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
    Boolean isOrigin = true;
    Boolean isReply = postExperienceDTO.getIsReply();

    experience = new Experience(user, mentions, tags, quote, reflection, isOrigin, isReply);

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

      if (!experience.isOrigin()) {
        throw new UnsupportedOperationException();
      }

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

  @Transactional
  public Optional<ExperienceDTO> resonateExperience(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);

    if (experienceOptional.isEmpty()) {
      return Optional.empty();
    }

    Experience experience = experienceOptional.get();

    ExperiencePrivacySettings expPrivacySettings = experiencePrivacySettingsRepository.findById(experience.getId()).get();

    if (!expPrivacySettings.areResonatesAllowed()) {
      throw new UnsupportedOperationException();
    }

    Optional<Resonate> resonateOptional = resonateRepository.findByExperienceUuidAndUserId(uuid, id);

    if (resonateOptional.isPresent()) {
      throw new UnsupportedOperationException();
    }

    Resonate resonate = new Resonate(user, experience);

    resonateRepository.save(resonate);
    experience.addResonate(resonate);
    experienceRepository.save(experience);
    userRepository.save(user);

    return Optional.of(new ExperienceDTO(experience));
  }

  @Transactional
  public Optional<ExperienceDTO> unResonateExperience(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);
    Optional<Resonate> resonateOptional = resonateRepository.findByExperienceUuidAndUserId(uuid, id);

    if (experienceOptional.isEmpty() || resonateOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Experience experience = experienceOptional.get();
    Resonate resonate = resonateOptional.get();

    experience.removeResonate(resonate);
    resonateRepository.deleteByExperienceUuidAndUserId(uuid, id);
    experienceRepository.save(experience);
    userRepository.save(user);
    return Optional.of(new ExperienceDTO(experience));

  }

  public Optional<ExperienceDTO> commentExperience(Long id, UUID uuid, PostCommentDTO commentDTO) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);

    if (experienceOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Experience experience = experienceOptional.get();

    ExperiencePrivacySettings expPrivacySettings = experiencePrivacySettingsRepository.findById(experience.getId()).get();

    if (!expPrivacySettings.areCommentsAllowed()) {
      throw new UnsupportedOperationException();
    }


    Comment comment = new Comment(user, experience, commentDTO.getContent());

    commentRepository.save(comment);
    experience.addComment(comment);
    experienceRepository.save(experience);
    userRepository.save(user);

    return Optional.of(new ExperienceDTO(experience));
  }

  @Transactional
  public Optional<ExperienceDTO> deleteExperienceCommentByUuid(Long id, UUID expUuid, UUID comUuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(expUuid);
    Optional<Comment> commentOptional = commentRepository.findByUuid(comUuid);

    if (experienceOptional.isEmpty() || commentOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Experience experience = experienceOptional.get();
    Comment comment = commentOptional.get();

    experience.removeComment(comment);
    commentRepository.deleteByUuid(comUuid);
    experienceRepository.save(experience);
    userRepository.save(user);
    return Optional.of(new ExperienceDTO(experience));

  }

  public Optional<ExperienceDTO> saveExperience(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);

    if (experienceOptional.isEmpty()) {
      return Optional.empty();
    }

    Experience experience = experienceOptional.get();

    ExperiencePrivacySettings expPrivacySettings = experiencePrivacySettingsRepository.findById(experience.getId()).get();

    if (!expPrivacySettings.areSavesAllowed()) {
      throw new UnsupportedOperationException();
    }

    Optional<Save> saveOptional = saveRepository.findByExperienceUuidAndUserId(uuid, id);

    if (saveOptional.isPresent()) {
      throw new UnsupportedOperationException();
    }

    Save save = new Save(user, experience);
    saveRepository.save(save);
    experience.addSave(save);
    experienceRepository.save(experience);
    userRepository.save(user);

    return Optional.of(new ExperienceDTO(experience));
  }

  @Transactional
  public Optional<ExperienceDTO> unSaveExperience(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);

    if (experienceOptional.isEmpty()) {
      return Optional.empty();
    }

    Experience experience = experienceOptional.get();

    Optional<Save> saveOptional = saveRepository.findByExperienceUuidAndUserId(uuid, id);

    if (saveOptional.isEmpty()) {
      return Optional.empty();
    }

    Save save = saveOptional.get();

    if (experience.getSaves().contains(save)) {
      experience.removeSave(save);
      saveRepository.deleteByExperienceUuidAndUserId(uuid, id);
      experienceRepository.save(experience);
      userRepository.save(user);

      return Optional.of(new ExperienceDTO(experience));
    }

    throw new UnsupportedOperationException();

  }

  public Optional<ExperienceDTO> forkExperience(Long id, UUID uuid, ForkExperienceDTO forkExperienceDTO, MultipartFile file) throws IOException {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);

    if (experienceOptional.isEmpty()) {
      return Optional.empty();
    }

    Experience experience = experienceOptional.get();
    ExperiencePrivacySettings expPrivacySettings = experiencePrivacySettingsRepository.findById(experience.getId()).get();

    if (!expPrivacySettings.areForksAllowed()) {
      throw new UnsupportedOperationException();
    }

    Set<User> mentions = new HashSet<>();
    Set<Tag> tags = new HashSet<>();

    if (forkExperienceDTO.getMentions() != null) {
      for (String username : forkExperienceDTO.getMentions()) {
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

    for (String t : forkExperienceDTO.getTags()) {
      Optional<Tag> tagOptional = tagRepository.findByName(t);
      if (tagOptional.isPresent()) {
        tags.add(tagOptional.get());
      } else {
        Tag tag = new Tag(t);
        tagRepository.save(tag);
        tags.add(tag);
      }
    }

    String quote = experience.getQuote();
    String reflection = forkExperienceDTO.getReflection();
    Boolean isOrigin = false;
    Boolean isReply = false;
    PostExperiencePrivacySettingsDTO forkPrivacySettings = forkExperienceDTO.getPostExperiencePrivacySettingsDTO();
    PostExperienceStyleDTO forkStyle = forkExperienceDTO.getPostExperienceStyleDTO();

    Experience fork = new Experience(user, mentions, tags, quote, reflection, isOrigin, isReply);
    fork.setOrigin(experience);

    if (file != null && !file.isEmpty()) {
      String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
      File destination = new File(uploadDir + File.separator + fileName);
      destination.getParentFile().mkdirs();
      file.transferTo(destination);

      String relativePath = "/images/" + fileName;

      ExperienceStyle style = new ExperienceStyle(
          fork,
          forkStyle.getFontFamily(),
          forkStyle.getFontSize(),
          forkStyle.getFontColor(),
          forkStyle.getTextPositionX(),
          forkStyle.getTextPositionY(),
          relativePath
      );
      experienceStyleRepository.save(style);
      fork.setStyle(style);
    }

    ExperiencePrivacySettings privacy = new ExperiencePrivacySettings(
        fork,
        forkPrivacySettings.getAllowComments(),
        forkPrivacySettings.getAllowForks(),
        forkPrivacySettings.getAllowResonates(),
        forkPrivacySettings.getAllowSaves()
    );
    experiencePrivacySettingsRepository.save(privacy);
    fork.setPrivacySettings(privacy);

    fork = experienceRepository.save(fork);
    experience.addBranch(fork);
    experienceRepository.save(experience);

    return Optional.of(new ExperienceDTO(fork));
  }


  public String getExperienceLink(UUID uuid) {
    return "https://lexigram.app/experience/" + uuid.toString();
  }

  public Set<ExperienceDTO> getSavedExperiences(Long id) {
    Set<ExperienceDTO> publicSavedExperiences = new HashSet<>();

    Set<Save> saved = saveRepository.findAllByUserIdAndExperienceIsNotNull(id);

    for (Save save : saved) {
      Experience experience = save.getExperience();
      if (experience.getUser().getUserPrivacySettings().getVisibility()){
        publicSavedExperiences.add(new ExperienceDTO(experience));
      }
    }
    return publicSavedExperiences;
  }

}