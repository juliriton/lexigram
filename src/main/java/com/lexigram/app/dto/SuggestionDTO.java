package com.lexigram.app.dto;

import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.Tag;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class SuggestionDTO {

  private final UUID uuid;
  private final UserDTO user;
  private final Set<TagDTO> tags;
  private final String header;
  private final String body;
  private final String type = "Suggestion";
  private final long creationDate;
  private final long resonatesAmount;
  private final long experienceAmount;

  public SuggestionDTO(Suggestion suggestion) {
    this.uuid = suggestion.getUuid();
    this.user = new UserDTO(
        suggestion.getUser().getId(),
        suggestion.getUser().getUsername(),
        suggestion.getUser().getEmail()
    );
    this.body = suggestion.getBody();
    Set<TagDTO> tagDTO = new HashSet<>();
    for (Tag tag : suggestion.getTags()) {
      tagDTO.add(new TagDTO(tag.getName(), tag.isInFeed()));
    }
    this.tags = tagDTO;
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
    return tags;
  }

  public String getBody() {
    return body;
  }

}
