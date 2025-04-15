package com.lexigram.app.service;

import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.PostExperienceDTO;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.*;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.TagRepository;
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
  private TagRepository tagRepository;

  @Autowired
  public ExperienceService(ExperienceRepository experienceRepository, UserRepository userRepository, TagRepository tagRepository) {
    this.experienceRepository = experienceRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
  }

  public ExperienceDTO createExperience(Long id, PostExperienceDTO postExperienceDTO) throws IOException {
    User user = userRepository.findById(id).get();
    Set<User> mentions = new HashSet<>();
    Set<Tag> tags = new HashSet<>();

    if (postExperienceDTO.getMentions() != null) {
      for (String username : postExperienceDTO.getMentions()) {
        Optional<User> mention = userRepository.findByUsername(username);
        if (mention.isPresent()) {
          mentions.add(mention.get());
        } else {
          throw new UserNotFoundException();
        }
      }
    }

    for (String t : postExperienceDTO.getTags()) {
      Optional<Tag> tagOptional = tagRepository.findByName(t);
      if (tagOptional.isPresent()) {
        tags.add(tagOptional.get());
      } else {
        Tag tag = new Tag(t);
        tagRepository.save(tag);
        tags.add(tag);
      }
    }

    Experience experience;
    String quote = postExperienceDTO.getQuote();
    String reflection = postExperienceDTO.getReflection();

    experience = new Experience(user, mentions, tags, quote, reflection);

    experience = experienceRepository.save(experience);

    experience.setOrigin(experience);
    experience = experienceRepository.save(experience);

    MultipartFile file = postExperienceDTO.getFile();
    if (file != null && !file.isEmpty()) {
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
    }

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