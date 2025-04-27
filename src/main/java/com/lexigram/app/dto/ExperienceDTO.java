package com.lexigram.app.dto;

import com.lexigram.app.model.Experience;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.User;
import com.lexigram.app.model.UserProfile;

import java.util.*;

public class ExperienceDTO {

  private final UUID uuid;
  private final String quote;
  private final String reflection;
  private final long creationDate;
  private final long resonatesAmount;
  private final long commentAmount;
  private final long saveAmount;
  private final long branchAmount;
  private final boolean isOrigin;
  private final UserDTO user;
  private final Set<TagDTO> tags;
  private final Set<ConnectionDTO> mentions;
  private final String type = "Experience";
  private final ExperienceStyleDTO style;
  private final ExperiencePrivacySettingsDTO privacySettings;

  public ExperienceDTO(Experience experience) {
    this.uuid = experience.getUuid();
    this.quote = experience.getQuote();
    this.reflection = experience.getReflection();
    this.creationDate = experience.getCreationDate();
    this.resonatesAmount = experience.getResonatesAmount();
    this.commentAmount = experience.getCommentAmount();
    this.saveAmount = experience.getSaveAmount();
    this.branchAmount = experience.getBranchAmount();
    this.isOrigin = experience.isOrigin();
    this.user = new UserDTO(
        experience.getUser().getId(),
        experience.getUser().getUuid(),
        experience.getUser().getUsername(),
        experience.getUser().getEmail()
    );
    Set<TagDTO> tagDTO = new HashSet<>();
    for (Tag tag : experience.getTags()) {
      tagDTO.add(new TagDTO(tag.getName(), tag.isInFeed()));
    }
    this.tags = tagDTO;
    this.mentions = new HashSet<>();
    for (User u : experience.getMentions()){
      UserProfile p = u.getUserProfile();
      this.mentions.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), p.getProfilePictureUrl()));
    }
    this.style = new ExperienceStyleDTO(experience.getStyle());
    this.privacySettings = new ExperiencePrivacySettingsDTO(experience.getPrivacySettings());
  }

  public UUID getUuid() { return uuid; }
  public String getQuote() { return quote; }
  public String getReflection() { return reflection; }
  public long getCreationDate() { return creationDate; }
  public long getResonatesAmount() { return resonatesAmount; }
  public long getCommentAmount() { return commentAmount; }
  public long getSaveAmount() { return saveAmount; }
  public long getBranchAmount() { return branchAmount; }
  public boolean isOrigin() { return isOrigin; }
  public UserDTO getUser() { return user; }
  public Set<TagDTO> getTags() { return tags; }
  public ExperienceStyleDTO getStyle() { return style; }
  public ExperiencePrivacySettingsDTO getPrivacySettings() { return privacySettings; }
  public String getType() { return type; }
  public Set<ConnectionDTO> getMentions() { return mentions;}

}


