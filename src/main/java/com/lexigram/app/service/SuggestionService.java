package com.lexigram.app.service;

import com.lexigram.app.dto.PostSuggestionDTO;
import com.lexigram.app.dto.SuggestionDTO;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.User;
import com.lexigram.app.repository.SuggestionRepository;
import com.lexigram.app.repository.TagRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class SuggestionService {

  private final UserRepository userRepository;
  private SuggestionRepository suggestionRepository;
  private TagRepository tagRepository;

  @Autowired
  public SuggestionService(SuggestionRepository suggestionRepository,
                           UserRepository userRepository,
                           TagRepository tagRepository) {
    this.suggestionRepository = suggestionRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
  }

  public SuggestionDTO createSuggestion(Long id, PostSuggestionDTO postSuggestionDTO) {
    Set<Tag> tags = new HashSet<>();

    for (String t : postSuggestionDTO.getTags()) {
      Optional<Tag> tagOptional = tagRepository.findByName(t);
      if (tagOptional.isPresent()) {
        tags.add(tagOptional.get());
      } else {
        Tag tag = new Tag(t);
        tagRepository.save(tag);
        tags.add(tag);
      }
    }

    String body = postSuggestionDTO.getBody();
    User user = userRepository.findById(id).get();

    Suggestion suggestion = new Suggestion(user, tags, body);
    suggestionRepository.save(suggestion);

    return new SuggestionDTO(suggestion);
  }

  public Set<SuggestionDTO> getAllSuggestions(Long id){
    Set<User> publicUsers = userRepository.findByUserPrivacySettingsVisibilityTrue();
    Set<SuggestionDTO> publicSuggestions = new HashSet<>();

    for (User user : publicUsers) {
      Long userId = user.getId();

      if (userId.equals(id)) {
        continue;
      }

      Set<Suggestion> userSuggestions = suggestionRepository.getSuggestionsByUserId(userId);
      for (Suggestion suggestion : userSuggestions) {
        publicSuggestions.add(new SuggestionDTO(suggestion));
      }
    }

    return publicSuggestions;
  }

}
