package com.lexigram.app.dto;

import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.User;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class SuggestionDTO {

  private UUID uuid;
  private User user;
  private Set<Tag> tags;
  private String header;
  private long creationDate;
  private long resonatesAmount;
  private long experienceAmount;

  public SuggestionDTO() {}

  public SuggestionDTO(Suggestion suggestion) {
    this.uuid = suggestion.getUuid();
    this.user = suggestion.getUser();
    this.tags = suggestion.getTags();
    this.header = suggestion.getHeader();
    this.creationDate = suggestion.getCreationDate();
    this.resonatesAmount = suggestion.getResonatesAmount();
    this.experienceAmount = suggestion.getExperienceAmount();
  }

  public UUID getUuid() {
    return uuid;
  }

  public String getHeader() {
    return header;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public long getResonatesAmount() {
    return resonatesAmount;
  }

  public long getExperienceAmount() {
    return experienceAmount;
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
}
