package com.lexigram.app.service;

import com.lexigram.app.dto.UserPrivacySettingsDTO;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserPrivacySettings;
import com.lexigram.app.repository.UserPrivacySettingsRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserPrivacySettingsService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private UserPrivacySettingsRepository userPrivacySettingsRepository;

  public Optional<UserPrivacySettingsDTO> findPrivacySettings(Long user_id) {
    Optional<User> userOptional = userRepository.findById(user_id);

    if (userOptional.isPresent()) {
      UserPrivacySettings userPrivacySettings = userPrivacySettingsRepository.findByUserId(user_id);
      return Optional.of(new UserPrivacySettingsDTO(userPrivacySettings.getVisibility()));
    }
    return Optional.empty();
  }

  public Optional<UserPrivacySettingsDTO> changePrivacySettings(Long user_id) {
    Optional<User> userOptional = userRepository.findById(user_id);

    if (userOptional.isPresent()) {
      UserPrivacySettings userPrivacySettings = userPrivacySettingsRepository.findByUserId(user_id);

      userPrivacySettings.switchVisibility();
      userPrivacySettingsRepository.save(userPrivacySettings);

      return Optional.of(new UserPrivacySettingsDTO(userPrivacySettings.getVisibility()));
    }
    return Optional.empty();
  }

}
