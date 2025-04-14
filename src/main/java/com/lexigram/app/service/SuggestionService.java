package com.lexigram.app.service;

import com.lexigram.app.dto.PostSuggestionDTO;
import com.lexigram.app.dto.SuggestionDTO;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.User;
import com.lexigram.app.repository.SuggestionRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class SuggestionService {

  private final UserRepository userRepository;
  private SuggestionRepository suggestionRepository;

  @Autowired
  public SuggestionService(SuggestionRepository suggestionRepository, UserRepository userRepository) {
    this.suggestionRepository = suggestionRepository;
    this.userRepository = userRepository;
  }

  public SuggestionDTO createSuggestion(Long id, PostSuggestionDTO postSuggestionDTO) {
    Set<Tag> tags = postSuggestionDTO.getTags();
    String suggestionText = postSuggestionDTO.getSuggestion();
    User user = userRepository.findById(id).get();

    Suggestion suggestion = new Suggestion(user, tags, suggestionText);
    suggestionRepository.save(suggestion);

    return new SuggestionDTO(suggestion);
  }

}
