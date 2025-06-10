package com.lexigram.app.dto;

import com.lexigram.app.model.Comment;
import com.lexigram.app.model.Save;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserProfile;
import java.util.*;

public class ExperienceDTO {

  private final UUID uuid;
  private final String quote;
  private final String reflection;
  private final long creationDate;
  private final Set<UUID> resonatedBy;
  private final long resonatesAmount;
  private final Set<UUID> commentedBy;
  private final Set<CommentDTO> comments;
  private final long commentAmount;
  private final Set<UUID> savedBy;
  private final long saveAmount;
  private final Set<UUID> forkedBy;
  private final Set<UUID> branches;
  private final long branchAmount;
  private final boolean isOrigin;
  private final boolean isReply;
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
    this.user = buildUserDTO(experience);
    this.resonatedBy = buildResonatedBy(experience);
    this.commentedBy = buildCommentedBy(experience);
    this.comments = buildComments(experience);
    this.savedBy = buildSavedBy(experience);
    this.forkedBy = buildForkedBy(experience);
    this.branches = buildBranches(experience);
    this.tags = buildTagDTOs(experience);
    this.mentions = buildMentionDTOs(experience);
    this.style = new ExperienceStyleDTO(experience.getStyle());
    this.privacySettings = new ExperiencePrivacySettingsDTO(experience.getPrivacySettings());
    this.isReply = experience.isReply();
  }

  private Set<UUID> buildBranches(Experience experience) {
    Set<UUID> branches = new HashSet<>();
    for (Experience branch : experience.getBranches()) {
      branches.add(branch.getUser().getUuid());
    }
    return branches;
  }

  private Set<UUID> buildForkedBy(Experience experience) {
    Set<UUID> branchedBy = new HashSet<>();
    for (Experience branch : experience.getBranches()) {
      branchedBy.add(branch.getUser().getUuid());
    }
    return branchedBy;
  }

  private Set<UUID> buildSavedBy(Experience experience) {
    Set<UUID> savedBy = new HashSet<>();
    for (Save save : experience.getSaves()){
      savedBy.add(save.getUser().getUuid());
    }
    return savedBy;
  }

  private Set<CommentDTO> buildComments(Experience experience) {
    Set<Comment> comments = experience.getComments();
    Set<CommentDTO> commentDTOs = new HashSet<>();
    for (Comment comment : comments) {
      commentDTOs.add(new CommentDTO(comment));
    }
    return commentDTOs;
  }

  private Set<UUID> buildCommentedBy(Experience experience) {
    Set<UUID> commentedBy = new HashSet<>();
    for (Comment comment : experience.getComments()) {
      commentedBy.add(comment.getUser().getUuid());
    }
    return commentedBy;
  }

  private Set<UUID> buildResonatedBy(Experience experience) {
    Set<UUID> resonatedBy = new HashSet<>();
    for (Resonate r : experience.getResonates()){
      resonatedBy.add(r.getUser().getUuid());
    }
    return resonatedBy;
  }

  private Set<ConnectionDTO> buildMentionDTOs(Experience experience) {
    Set<ConnectionDTO> connectionDTOs = new HashSet<>();
    for (User u : experience.getMentions()){
      UserProfile p = u.getUserProfile();
      connectionDTOs.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), p.getProfilePictureUrl()));
    }
    return connectionDTOs;
  }

  private static Set<TagDTO> buildTagDTOs(Experience experience) {
    Set<TagDTO> tagDTO = new HashSet<>();
    for (Tag tag : experience.getTags()) {
      tagDTO.add(new TagDTO(tag.getName(), tag.isInFeed()));
    }
    return tagDTO;
  }

  private static UserDTO buildUserDTO(Experience experience) {
    return new UserDTO(
        experience.getUser().getId(),
        experience.getUser().getUuid(),
        experience.getUser().getUsername(),
        experience.getUser().getEmail()
    );
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
  public Set<CommentDTO> getComments() { return comments;}
  public Set<UUID> getResonatedBy() { return resonatedBy; }
  public Set<UUID> getCommentedBy() { return commentedBy; }
  public Set<UUID> getBranches() { return branches; }
  public Set<UUID> getSavedBy() { return savedBy; }
  public Set<UUID> getForkedBy() { return forkedBy; }
  public Boolean getIsReply() { return isReply; }

}


