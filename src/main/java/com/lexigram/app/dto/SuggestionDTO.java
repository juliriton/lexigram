package com.lexigram.app.dto;

import com.lexigram.app.model.Save;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;

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
  private final Set<UUID> resonatedBy;
  private final long resonatesAmount;
  private final Set<UUID> savedBy;
  private final long savesAmount;
  private final Set<UUID> repliedBy;
  private final Set<UUID> replies;
  private final long replyAmount;

  public SuggestionDTO(Suggestion suggestion) {
    this.uuid = suggestion.getUuid();
    this.user = buildUser(suggestion);
    this.body = suggestion.getBody();
    this.resonatedBy = buildResonatedBy(suggestion);
    this.savedBy = buildSavedBy(suggestion);
    this.savesAmount = suggestion.getSavesAmount();
    this.repliedBy = buildRepliedBy(suggestion);
    this.replies = buildReplies(suggestion);
    Set<TagDTO> tagDTO = new HashSet<>();
    for (Tag tag : suggestion.getTags()) {
      tagDTO.add(new TagDTO(tag.getName(), tag.isInFeed()));
    }
    this.tags = tagDTO;
    this.header = suggestion.getHeader();
    this.creationDate = suggestion.getCreationDate();
    this.resonatesAmount = suggestion.getResonatesAmount();
    this.replyAmount = suggestion.getExperienceAmount();
  }

  private static UserDTO buildUser(Suggestion suggestion) {
    return new UserDTO(
        suggestion.getUser().getId(),
        suggestion.getUser().getUuid(),
        suggestion.getUser().getUsername(),
        suggestion.getUser().getEmail()
    );
  }

  private static Set<UUID> buildReplies(Suggestion suggestion) {
    Set<UUID> replies = new HashSet<>();
    for (Experience reply : suggestion.getReplies()){
      replies.add(reply.getUuid());
    }
    return replies;
  }

  private static Set<UUID> buildRepliedBy(Suggestion suggestion) {
    Set<UUID> repliedBy = new HashSet<>();
    for (Experience reply : suggestion.getReplies()){
      repliedBy.add(reply.getUser().getUuid());
    }
    return repliedBy;
  }

  private static Set<UUID> buildResonatedBy(Suggestion suggestion) {
    Set<UUID> replies = new HashSet<>();
    for (Resonate resonate : suggestion.getResonates()){
      replies.add(resonate.getUser().getUuid());
    }
    return replies;
  }

  private static Set<UUID> buildSavedBy(Suggestion suggestion) {
    Set<UUID> saves = new HashSet<>();
    for (Save save : suggestion.getSaves()){
      saves.add(save.getUser().getUuid());
    }
    return saves;
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

  public long getReplyAmount() {
    return replyAmount;
  }

  public UserDTO getUser() {
    return user;
  }

  public Set<TagDTO> getTags(){
    return tags;
  }

  public String getBody() {
    return body;
  }

  public String getType() {
    return type;
  }

  public Set<UUID> getReplies() {
    return replies;
  }

  public Set<UUID> getRepliedBy() {
    return repliedBy;
  }

  public Set<UUID> getSavedBy() {
    return savedBy;
  }

  public long getSavesAmount() {
    return savesAmount;
  }

  public Set<UUID> getResonatedBy() {
    return resonatedBy;
  }

}
