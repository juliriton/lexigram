package com.lexigram.app.service;

import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.PostExperienceDTO;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.Experience;
import com.lexigram.app.model.ExperiencePrivacySettings;
import com.lexigram.app.model.ExperienceStyle;
import com.lexigram.app.model.User;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class ExperienceService {

  @Value("${lexigram.upload.dir}")
  private String uploadDir;

  private final UserRepository userRepository;
  private ExperienceRepository experienceRepository;

  @Autowired
  public ExperienceService(ExperienceRepository experienceRepository, UserRepository userRepository) {
    this.experienceRepository = experienceRepository;
    this.userRepository = userRepository;
  }

  public ExperienceDTO createExperience(Long id, PostExperienceDTO postExperienceDTO) throws IOException {
    User user = userRepository.findById(id).get();
    Set<User> mentions = new HashSet<>();

    for (String username : postExperienceDTO.getMentions()) {
      Optional<User> mention = userRepository.findByUsername(username);
      if (mention.isPresent()) {
        mentions.add(mention.get());
      } else {
        throw new UserNotFoundException();
      }
    }

    Experience experience = new Experience(
        user,
        null,
        null,
        null,
        mentions,
        postExperienceDTO.getTags(),
        postExperienceDTO.getQuote(),
        postExperienceDTO.getReflection(),
        true);

    experience = experienceRepository.save(experience);

    MultipartFile file = postExperienceDTO.getFile();
    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
    File destination = new File(uploadDir + File.separator + fileName);
    destination.getParentFile().mkdirs();
    file.transferTo(destination);

    String relativePath = "/images/" + fileName;

    ExperienceStyle style = new ExperienceStyle(
        experience,
        postExperienceDTO.getFontFamily(),
        postExperienceDTO.getFontSize(),
        postExperienceDTO.getFontColor(),
        postExperienceDTO.getTextPositionX(),
        postExperienceDTO.getTextPositionY(),
        relativePath
    );

    experience.setStyle(style);

    ExperiencePrivacySettings privacy = new ExperiencePrivacySettings(
        experience,
        postExperienceDTO.areCommentsAllowed(),
        postExperienceDTO.areForksAllowed(),
        postExperienceDTO.areResonatesAllowed()
    );

    experience.setPrivacySettings(privacy);

    experience = experienceRepository.save(experience);

    return new ExperienceDTO(experience);
  }

}
