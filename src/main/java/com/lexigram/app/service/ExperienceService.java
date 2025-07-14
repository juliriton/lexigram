package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.*;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.experience.ExperiencePrivacySettings;
import com.lexigram.app.model.experience.ExperienceStyle;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserProfile;
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
import java.util.stream.Collectors;

@Service
public class ExperienceService {

  private final UserProfileRepository userProfileRepository;
  @Value("${lexigram.upload.dir}")
  private String uploadDir;

  @Value("${lexigram.frontend.url}")
  private String URL;

  private final SuggestionRepository suggestionRepository;
  private final NotificationRepository notificationRepository;
  private final NotificationService notificationService;
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
                           SaveRepository saveRepository,
                           SuggestionRepository suggestionRepository,
                           NotificationRepository notificationRepository,
                           NotificationService notificationService, UserProfileRepository userProfileRepository) {
    this.experienceRepository = experienceRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.experienceStyleRepository = experienceStyleRepository;
    this.experiencePrivacySettingsRepository = experiencePrivacySettingsRepository;
    this.resonateRepository = resonateRepository;
    this.commentRepository = commentRepository;
    this.saveRepository = saveRepository;
    this.suggestionRepository = suggestionRepository;
    this.notificationRepository = notificationRepository;
    this.notificationService = notificationService;
    this.userProfileRepository = userProfileRepository;
  }

  // In ExperienceService.java - Updated createExperience method

  public ExperienceDTO createExperience(Long id, PostExperienceDTO postExperienceDTO, MultipartFile file) throws IOException {
    User user = userRepository.findById(id).get();
    Set<User> mentions = new HashSet<>();
    Set<Tag> tags = new HashSet<>();

    // Handle mentions - improved logic
    if (postExperienceDTO.getMentions() != null && !postExperienceDTO.getMentions().isEmpty()) {
      System.out.println("Processing mentions: " + postExperienceDTO.getMentions());

      for (String username : postExperienceDTO.getMentions()) {
        // Skip empty usernames
        if (username == null || username.trim().isEmpty()) {
          continue;
        }

        String cleanUsername = username.trim().replaceAll("^@", ""); // Remove @ if present
        System.out.println("Processing mention: '" + cleanUsername + "'");

        // Check if user is trying to mention themselves
        if (cleanUsername.equals(user.getUsername())) {
          throw new InvalidObjectException("Cannot mention yourself in a post!");
        }

        Optional<User> mention = userRepository.findByUsername(cleanUsername);
        if (mention.isPresent()) {
          mentions.add(mention.get());
          System.out.println("Found and added mention: " + cleanUsername);
        } else {
          System.out.println("User not found: " + cleanUsername);
          throw new UserNotFoundException("User @" + cleanUsername + " not found");
        }
      }
    }

    // Process tags
    if (postExperienceDTO.getTags() != null) {
      for (String t : postExperienceDTO.getTags()) {
        if (t != null && !t.trim().isEmpty()) {
          Optional<Tag> tagOptional = tagRepository.findByName(t.trim());
          if (tagOptional.isPresent()) {
            tags.add(tagOptional.get());
          } else {
            Tag tag = new Tag(t.trim());
            tagRepository.save(tag);
            tags.add(tag);
          }
        }
      }
    }

    Experience experience;
    String quote = postExperienceDTO.getQuote();
    String reflection = postExperienceDTO.getReflection();
    Boolean isOrigin = true;
    Boolean isReply = postExperienceDTO.getIsReply();

    System.out.println("Final mentions to be saved: " + mentions);

    experience = new Experience(user, mentions, tags, quote, reflection, isOrigin, isReply);
    experience = experienceRepository.save(experience);
    experience.setOrigin(experience);
    experience = experienceRepository.save(experience);

    // Create notifications for mentions - only if notification is not null
    for (User mention : mentions) {
      System.out.println("Creating notification for mention: " + mention.getUsername()); // Debug log
      Notification notification = notificationService.mentionExperienceNotification(user, experience, mention);
      if (notification != null) {
        notificationRepository.save(notification);
      }
    }

    PostExperienceStyleDTO styleDTO = postExperienceDTO.getStyle();
    PostExperiencePrivacySettingsDTO privacySettingsDTO = postExperienceDTO.getPrivacySettings();

    // Handle file upload
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

    // Create privacy settings
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

  @Transactional
  public boolean deleteExperience(UUID experienceUuid, Long userId) {
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(experienceUuid);
    if (experienceOptional.isEmpty()){
      return false;
    }
    Experience experience = experienceOptional.get();

    // Delete associated notifications first to avoid foreign key constraint violation
    notificationRepository.deleteByExperienceId(experience.getId());

    if (experience.isReply()) {
      Suggestion suggestion = experience.getSuggestion();
      suggestion.removeReply(experience);
      suggestionRepository.save(suggestion);
    }

    if (!experience.isOrigin()) {
      Experience origin = experience.getOrigin();
      origin.removeBranch(experience);
      experienceRepository.save(origin);
    }

    experienceRepository.deleteById(experience.getId());
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

  // Updated Experience Service Method
  public Optional<ExperienceDTO> updateExperienceTag(UUID uuid, UpdateExperienceTagDTO updateTagDTO, Long userId) {
    Set<Tag> tags = new HashSet<>();
    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);

    if (experienceOptional.isPresent()) {
      Experience experience = experienceOptional.get();

      for (String t : updateTagDTO.getTags()) {
        Optional<Tag> tagOptional = tagRepository.findByName(t);
        Tag tag;

        if (tagOptional.isPresent()) {
          tag = tagOptional.get();
        } else {
          tag = new Tag(t);
          tag = tagRepository.save(tag); // Save the tag first
        }

        // Don't set inFeed here - it will be calculated in the DTO creation
        tags.add(tag);
      }

      experience.setTags(tags);
      experience = experienceRepository.save(experience);

      // Refresh the experience to ensure all relationships are loaded
      experience = experienceRepository.findByUuid(uuid).orElse(experience);

      // Create ExperienceDTO with correct inFeed status for each tag
      return Optional.of(createExperienceDTOWithCorrectTagStatus(experience, userId));
    }

    return Optional.empty();
  }

  // Add this helper method
  private ExperienceDTO createExperienceDTOWithCorrectTagStatus(Experience experience, Long userId) {
    // Get user's feed tags
    Optional<UserProfile> userProfileOptional = userProfileRepository.findById(userId);
    Set<UUID> feedTagUuids;

    if (userProfileOptional.isPresent()) {
      UserProfile userProfile = userProfileOptional.get();
      feedTagUuids = userProfile.getFeedTags().stream()
          .map(Tag::getUuid)
          .collect(Collectors.toSet());
    } else {
      feedTagUuids = new HashSet<>();
    }

    // Create the DTO
    ExperienceDTO dto = new ExperienceDTO(experience);

    // Set correct inFeed status for each tag in the DTO
    if (dto.getTags() != null) {
      dto.getTags().forEach(tagDTO -> {
        tagDTO.setInFeed(feedTagUuids.contains(tagDTO.getUuid()));
      });
    }

    return dto;
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

    // Only create notification if it's not null (not self-resonating)
    Notification notification = notificationService.resonateExperienceNotification(user, experience);
    if (notification != null) {
      notificationRepository.save(notification);
    }

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

    fork = experienceRepository.save(fork);

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
    return URL + "/experience/" + uuid.toString();
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

  public Set<ExperienceDTO> getAllBranches(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);
    if (experienceOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Experience experience = experienceOptional.get();
    Set<ExperienceDTO> branches = new HashSet<>();

    for (Experience e : experience.getBranches()) {
      if (e.getUser().getUserPrivacySettings().getVisibility() ||
          e.getUser().getId().equals(id) ||
          userOptional.get().getFollowing().contains(e.getUser())) {
        branches.add(new ExperienceDTO(e));
      }
    }

    return branches;
  }

  public Optional<ExperienceDTO> getExperienceFromUuid(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    Optional<Experience> experienceOptional = experienceRepository.findByUuid(uuid);

    if (experienceOptional.isEmpty()) {
      return Optional.empty();
    }

    Experience experience = experienceOptional.get();

    return Optional.of(new ExperienceDTO(experience));
  }

}