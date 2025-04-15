package com.lexigram.app.dto;

import com.lexigram.app.model.Experience;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.User;

import java.util.*;

public class ExperienceDTO {

  private UUID uuid;
  private String quote;
  private String reflection;
  private long creationDate;
  private long resonatesAmount;
  private long commentAmount;
  private long saveAmount;
  private long branchAmount;
  private boolean isOrigin;
  private User user;
  private Set<Tag> tags;
  private ExperienceStyleDTO style;

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
    this.user = experience.getUser();
    this.tags = experience.getTags();
  }

  public UUID getUuid() {
    return uuid;
  }

  public String getQuote() {
    return quote;
  }

  public String getReflection() {
    return reflection;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public long getResonatesAmount() {
    return resonatesAmount;
  }

  public long getCommentAmount() {
    return commentAmount;
  }

  public long getSaveAmount() {
    return saveAmount;
  }

  public long getBranchAmount() {
    return branchAmount;
  }

  public boolean isOrigin() {
    return isOrigin;
  }

  public UserDTO getUser() {
    Long id = user.getId();
    String username = user.getUsername();
    String email = user.getEmail();
    return new UserDTO(id, username, email);
  }

  public Set<TagDTO> getTags(){
    Set<TagDTO> tagsDTO = new HashSet<>();
    for (Tag t : tags){
      tagsDTO.add(new TagDTO(t.getName(), t.isInFeed()));
    }
    return tagsDTO;
  }

  public ExperienceStyleDTO getStyle() {
    return style;
  }

}
