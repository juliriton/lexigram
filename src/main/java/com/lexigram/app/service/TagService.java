package com.lexigram.app.service;

import com.lexigram.app.dto.TagDTO;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.repository.TagRepository;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TagService {

  private final TagRepository tagRepository;
  private final UserRepository userRepository;
  private final UserProfileRepository userProfileRepository;

  @Autowired
  public TagService(TagRepository tagRepository, UserRepository userRepository, UserProfileRepository userProfileRepository) {
    this.tagRepository = tagRepository;
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
  }

  public boolean addTagToFeedByUuid(Long id, UUID tagUuid) {
    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);
    Optional<Tag> tagOpt = tagRepository.findByUuid(tagUuid);

    if (profileOpt.isPresent() && tagOpt.isPresent()) {
      UserProfile profile = profileOpt.get();
      Tag tag = tagOpt.get();

      if (!profile.getFeedTags().contains(tag)) {
        profile.getFeedTags().add(tag);
        userProfileRepository.save(profile);
      }

      return true;
    }

    return false;
  }

  public boolean removeTagFromFeedByUuid(Long id, UUID tagUuid) {
    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);
    Optional<Tag> tagOpt = tagRepository.findByUuid(tagUuid);

    if (profileOpt.isPresent() && tagOpt.isPresent()) {
      UserProfile profile = profileOpt.get();
      Tag tag = tagOpt.get();

      if (profile.getFeedTags().contains(tag)) {
        profile.getFeedTags().remove(tag);
        userProfileRepository.save(profile);
      }

      return true;
    }

    return false;
  }

  public Optional<TagDTO> getTagByUuid(Long userId, UUID uuid) {
    Optional<Tag> tagOptional = tagRepository.findByUuid(uuid);
    if (tagOptional.isEmpty()) {
      return Optional.empty();
    }

    Tag tag = tagOptional.get();

    // Check if this tag is in the user's feed
    Optional<UserProfile> userProfileOptional = userProfileRepository.findByUserId(userId);
    boolean isInFeed = false;

    if (userProfileOptional.isPresent()) {
      UserProfile userProfile = userProfileOptional.get();
      isInFeed = userProfile.getFeedTags().contains(tag);
    }

    return Optional.of(new TagDTO(tag.getUuid(), tag.getName(), isInFeed));
  }

  public Optional<List<TagDTO>> getAllTags(Long userId) {
    Optional<UserProfile> userProfileOptional = userProfileRepository.findByUserId(userId);

    if (userProfileOptional.isEmpty()) {
      return Optional.empty();
    }

    UserProfile userProfile = userProfileOptional.get();
    Set<Tag> feedTags = userProfile.getFeedTags();

    List<Tag> allTags = tagRepository.findAll();
    List<TagDTO> tagDTOs = new ArrayList<>();

    for (Tag tag : allTags) {
      boolean isInFeed = feedTags.contains(tag);
      tagDTOs.add(new TagDTO(tag.getUuid(), tag.getName(), isInFeed));
    }

    return Optional.of(tagDTOs);
  }

  public Optional<Set<TagDTO>> getAllFeedTags(Long id) {
    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);
    if (profileOpt.isEmpty()) {
      return Optional.empty();
    }

    UserProfile profile = profileOpt.get();
    Set<TagDTO> result = new HashSet<>();

    for (Tag tag : profile.getFeedTags()) {
      result.add(new TagDTO(tag.getUuid(), tag.getName(), true));
    }

    return Optional.of(result);
  }

  public boolean addAllTagsToFeed(Long id) {
    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);

    if (profileOpt.isEmpty()) {
      return false;
    }

    UserProfile profile = profileOpt.get();
    List<Tag> allTags = tagRepository.findAll();

    for (Tag tag : allTags) {
      if (!profile.getFeedTags().contains(tag)) {
        profile.getFeedTags().add(tag);
      }
    }

    userProfileRepository.save(profile);
    return true;
  }

  public boolean removeAllTagsFromFeed(Long id) {
    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);

    if (profileOpt.isEmpty()) {
      return false;
    }

    UserProfile profile = profileOpt.get();
    profile.getFeedTags().clear();
    userProfileRepository.save(profile);
    return true;
  }



}




