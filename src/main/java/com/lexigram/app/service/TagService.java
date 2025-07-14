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


  public Optional<List<TagDTO>> getAllTags(Long id) {
    Optional<User> user = userRepository.findById(id);
    if (user.isEmpty()) {
      return Optional.empty();
    }

    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);
    Set<Tag> feedTags = profileOpt.map(UserProfile::getFeedTags).orElse(Collections.emptySet());

    List<Tag> tags = tagRepository.findAll();
    List<TagDTO> result = new ArrayList<>();

    for (Tag tag : tags) {
      TagDTO dto = new TagDTO(tag.getUuid(), tag.getName(), feedTags.contains(tag));
      result.add(dto);
    }

    return Optional.of(result);
  }


  public Optional<TagDTO> getTagByUuid(Long id, UUID uuid) {
    Optional<User> user = userRepository.findById(id);
    if (user.isEmpty()) {
      return Optional.empty();
    }

    Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(id);
    Set<Tag> feedTags = profileOpt.map(UserProfile::getFeedTags).orElse(Collections.emptySet());

    Optional<Tag> tagOpt = tagRepository.findByUuid(uuid);
    if (tagOpt.isPresent()) {
      Tag tag = tagOpt.get();
      return Optional.of(new TagDTO(tag.getUuid(), tag.getName(), feedTags.contains(tag)));
    }

    return Optional.empty();
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


