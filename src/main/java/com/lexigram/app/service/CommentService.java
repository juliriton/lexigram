package com.lexigram.app.service;

import com.lexigram.app.dto.CommentDTO;
import com.lexigram.app.dto.ReplyCommentDTO;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.Comment;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.CommentRepository;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.ResonateRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class CommentService {

  private final UserRepository userRepository;
  private final ExperienceRepository experienceRepository;
  private final ResonateRepository resonateRepository;
  private final CommentRepository commentRepository;

  @Autowired
  public CommentService(CommentRepository commentRepository,
                        UserRepository userRepository,
                        ExperienceRepository experienceRepository,
                        ResonateRepository resonateRepository) {
    this.commentRepository = commentRepository;
    this.userRepository = userRepository;
    this.experienceRepository = experienceRepository;
    this.resonateRepository = resonateRepository;
  }

  public Optional<CommentDTO> replyToComment(Long id, UUID uuid, ReplyCommentDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException("User not found");
    }

    User user = userOptional.get();
    Optional<Comment> commentOptional = commentRepository.findByUuid(uuid);

    if (commentOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Comment comment = commentOptional.get();

    if (comment.getUser().equals(user)) {
      throw new UnsupportedOperationException();
    }

    Optional<Experience> experienceOptional = experienceRepository.findByUuid(dto.getExperienceUuid());

    if (experienceOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    comment.addReply(new Comment(user, experienceOptional.get(), dto.getContent()));
    commentRepository.save(comment);

    return Optional.of(new CommentDTO(comment));

  }

  public Optional<CommentDTO> resonateComment(Long id, UUID uuid) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException("User not found");
    }

    User user = userOptional.get();
    Optional<Comment> commentOptional = commentRepository.findByUuid(uuid);

    if (commentOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    Comment comment = commentOptional.get();

    if (comment.getUser().equals(user)) {
      throw new UnsupportedOperationException();
    }

    Resonate resonate = new Resonate(user, comment);
    resonateRepository.save(resonate);
    comment.addResonate(resonate);
    commentRepository.save(comment);

    return Optional.of(new CommentDTO(comment));
  }


}
