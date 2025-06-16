package com.lexigram.app.service;

import com.lexigram.app.dto.CommentDTO;
import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.PostCommentDTO;
import com.lexigram.app.dto.ReplyCommentDTO;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.Comment;
import com.lexigram.app.model.Notification;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.CommentRepository;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.ResonateRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {

  private final UserRepository userRepository;
  private final ExperienceRepository experienceRepository;
  private final ResonateRepository resonateRepository;
  private final CommentRepository commentRepository;
  private final NotificationService notificationService;

  @Autowired
  public CommentService(CommentRepository commentRepository,
                        UserRepository userRepository,
                        ExperienceRepository experienceRepository,
                        ResonateRepository resonateRepository, NotificationService notificationService) {
    this.commentRepository = commentRepository;
    this.userRepository = userRepository;
    this.experienceRepository = experienceRepository;
    this.resonateRepository = resonateRepository;
    this.notificationService = notificationService;
  }

  public Optional<CommentDTO> replyToComment(Long id, UUID uuid, ReplyCommentDTO dto) {
    try {
      System.out.println("User " + id + " attempting to reply to comment " + uuid);

      Optional<User> userOptional = userRepository.findById(id);
      if (userOptional.isEmpty()) {
        throw new UserNotFoundException("User not found");
      }

      User user = userOptional.get();
      Optional<Comment> commentOptional = commentRepository.findByUuid(uuid);

      if (commentOptional.isEmpty()) {
        throw new UnsupportedOperationException("Comment not found");
      }

      Comment comment = commentOptional.get();

      if (comment.getUser().equals(user)) {
        throw new UnsupportedOperationException("Cannot reply to your own comment");
      }

      Optional<Experience> experienceOptional = experienceRepository.findByUuid(dto.getExperienceUuid());

      if (experienceOptional.isEmpty()) {
        throw new UnsupportedOperationException("Experience not found");
      }

      Comment reply = new Comment(user, experienceOptional.get(), dto.getContent());
      reply.setParentComment(comment);

      comment.addReply(reply);
      commentRepository.save(reply);
      commentRepository.save(comment);

      System.out.println("Reply saved successfully");
      return Optional.of(new CommentDTO(reply));  // ✅ DEVOLVER EL REPLY
    } catch (Exception e) {
      System.err.println("Error in replyToComment: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  public Optional<CommentDTO> resonateComment(Long userId, UUID commentUuid) {
    try {
      System.out.println("User " + userId + " attempting to resonate comment " + commentUuid);

      Optional<User> userOptional = userRepository.findById(userId);
      if (userOptional.isEmpty()) {
        throw new UserNotFoundException("User not found");
      }

      User user = userOptional.get();
      Optional<Comment> commentOptional = commentRepository.findByUuid(commentUuid);

      if (commentOptional.isEmpty()) {
        throw new UnsupportedOperationException("Comment not found");
      }

      Comment comment = commentOptional.get();

      if (comment.getUser().equals(user)) {
        throw new UnsupportedOperationException("Cannot resonate your own comment");
      }

      Optional<Resonate> existingResonate = resonateRepository.findByUserAndComment(user, comment);

      if (existingResonate.isPresent()) {
        Resonate resonate = existingResonate.get();
        comment.removeResonate(resonate);
        resonateRepository.delete(resonate);
        System.out.println("Resonate removed");
      } else {
        Resonate resonate = new Resonate(user, comment);
        resonateRepository.save(resonate);
        comment.addResonate(resonate);
        System.out.println("Resonate added");
      }

      commentRepository.save(comment);
      return Optional.of(new CommentDTO(comment));
    } catch (Exception e) {
      System.err.println("Error in resonateComment: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }


  public CommentDTO commentOnExperience(Long userId, UUID experienceUuid, PostCommentDTO dto) {
    try {
      System.out.println("User " + userId + " commenting on experience " + experienceUuid);
      System.out.println("Comment content: " + dto.getContent());

      Optional<User> userOptional = userRepository.findById(userId);
      if (userOptional.isEmpty()) {
        throw new UserNotFoundException("User not found");
      }

      User user = userOptional.get();
      Optional<Experience> experienceOptional = experienceRepository.findByUuid(experienceUuid);

      if (experienceOptional.isEmpty()) {
        throw new UnsupportedOperationException("Experience not found");
      }

      Experience experience = experienceOptional.get();

      if (experience.getPrivacySettings() != null &&
          !experience.getPrivacySettings().areCommentsAllowed()) {
        throw new UnsupportedOperationException("Comments are not allowed on this experience");
      }

      Comment comment = new Comment(user, experience, dto.getContent());
      Comment savedComment = commentRepository.save(comment);

      experience.addComment(savedComment);
      experienceRepository.save(experience);

      System.out.println("Comment saved with UUID: " + savedComment.getUuid());
      return new CommentDTO(savedComment);
    } catch (Exception e) {
      System.err.println("Error in commentOnExperience: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  @Transactional(readOnly = true)
  public List<CommentDTO> getExperienceComments(UUID experienceUuid) {
    try {
      System.out.println("Getting all comments for experience: " + experienceUuid);

      Optional<Experience> experienceOptional = experienceRepository.findByUuid(experienceUuid);

      if (experienceOptional.isEmpty()) {
        throw new UnsupportedOperationException("Experience not found");
      }

      Experience experience = experienceOptional.get();
      System.out.println("Experience found: " + experience.getQuote());

      // Obtener solo comentarios de nivel superior (sin parent)
      List<Comment> topLevelComments = commentRepository.findByExperienceAndParentCommentIsNullOrderByCreationDateDesc(experience);

      System.out.println("Found " + topLevelComments.size() + " top-level comments");

      // Forzar la carga de las respuestas
      List<CommentDTO> result = topLevelComments.stream()
          .peek(comment -> {
            System.out.println("Processing comment: " + comment.getUuid() + " with " + comment.getReplies().size() + " replies");
            // Esto fuerza la carga lazy de las respuestas
            comment.getReplies().forEach(reply -> {
              System.out.println("  - Reply: " + reply.getUuid());
            });
          })
          .map(CommentDTO::new)
          .collect(Collectors.toList());

      System.out.println("Returning " + result.size() + " comment DTOs");
      return result;
    } catch (Exception e) {
      System.err.println("Error in getExperienceComments: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  @Transactional(readOnly = true)
  public long getExperienceCommentsCount(UUID experienceUuid) {
    try {
      System.out.println("Getting comment count for experience: " + experienceUuid);

      Optional<Experience> experienceOptional = experienceRepository.findByUuid(experienceUuid);

      if (experienceOptional.isEmpty()) {
        throw new UnsupportedOperationException("Experience not found");
      }

      Experience experience = experienceOptional.get();
      long count = commentRepository.countByExperience(experience);

      System.out.println("Comment count: " + count);
      return count;
    } catch (Exception e) {
      System.err.println("Error in getExperienceCommentsCount: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  public boolean deleteComment(Long userId, UUID commentUuid) {
    try {
      System.out.println("User " + userId + " attempting to delete comment " + commentUuid);

      Optional<User> userOptional = userRepository.findById(userId);
      if (userOptional.isEmpty()) {
        throw new UserNotFoundException("User not found");
      }

      User user = userOptional.get();
      Optional<Comment> commentOptional = commentRepository.findByUuid(commentUuid);

      if (commentOptional.isEmpty()) {
        System.out.println("Comment not found");
        return false;
      }

      Comment comment = commentOptional.get();

      if (!comment.getUser().equals(user)) {
        throw new UnsupportedOperationException("You can only delete your own comments");
      }

      commentRepository.delete(comment);
      System.out.println("Comment deleted successfully");
      return true;
    } catch (Exception e) {
      System.err.println("Error in deleteComment: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  public ExperienceDTO commentOnExperienceAndReturnExperience(Long userId, UUID experienceUuid, PostCommentDTO dto) {
    try {
      System.out.println("User " + userId + " commenting on experience " + experienceUuid + " and returning experience");

      Optional<User> userOptional = userRepository.findById(userId);
      if (userOptional.isEmpty()) {
        throw new UserNotFoundException("User not found");
      }

      User user = userOptional.get();
      Optional<Experience> experienceOptional = experienceRepository.findByUuid(experienceUuid);

      if (experienceOptional.isEmpty()) {
        throw new UnsupportedOperationException("Experience not found");
      }

      Experience experience = experienceOptional.get();

      if (experience.getPrivacySettings() != null &&
          !experience.getPrivacySettings().areCommentsAllowed()) {
        throw new UnsupportedOperationException("Comments are not allowed on this experience");
      }

      Comment comment = new Comment(user, experience, dto.getContent());
      Comment savedComment = commentRepository.save(comment);
      System.out.println("Comment saved with UUID: " + savedComment.getUuid());

      experience.addComment(savedComment);
      Experience savedExperience = experienceRepository.save(experience);
      System.out.println("Experience updated. New comment count: " + savedExperience.getCommentAmount());

      Notification notification = notificationService.commentExperienceNotification(user, experience);

      // Retornar la experiencia completa actualizada
      return new ExperienceDTO(savedExperience);
    } catch (Exception e) {
      System.err.println("Error in commentOnExperienceAndReturnExperience: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  @Transactional(readOnly = true)
  public List<CommentDTO> getExperienceCommentsWithPagination(UUID experienceUuid, int page, int size) {
    try {
      System.out.println("Getting paginated comments for experience: " + experienceUuid + " (page: " + page + ", size: " + size + ")");

      Optional<Experience> experienceOptional = experienceRepository.findByUuid(experienceUuid);

      if (experienceOptional.isEmpty()) {
        System.err.println("Experience not found: " + experienceUuid);
        throw new UnsupportedOperationException("Experience not found");
      }

      Experience experience = experienceOptional.get();
      System.out.println("Experience found: " + experience.getQuote());

      // Crear Pageable con ordenamiento por fecha de creación descendente
      Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "creationDate"));

      // Usar el repositorio con paginación
      Page<Comment> commentPage = commentRepository.findByExperienceAndParentCommentIsNull(experience, pageable);

      System.out.println("Total elements: " + commentPage.getTotalElements());
      System.out.println("Total pages: " + commentPage.getTotalPages());
      System.out.println("Current page elements: " + commentPage.getContent().size());

      // Forzar la carga de las respuestas antes de crear DTOs
      List<CommentDTO> result = commentPage.getContent().stream()
          .peek(comment -> {
            System.out.println("Processing comment: " + comment.getUuid() + " by " + comment.getUser().getUsername());
            // Forzar carga de respuestas y resonates
            int replyCount = comment.getReplies().size();
            int resonateCount = comment.getResonates().size();
            System.out.println("  - Has " + replyCount + " replies and " + resonateCount + " resonates");

            // Forzar carga de datos de replies
            comment.getReplies().forEach(reply -> {
              System.out.println("    - Reply: " + reply.getUuid() + " by " + reply.getUser().getUsername());
              // También cargar resonates de las respuestas
              reply.getResonates().size();
            });

            // Forzar carga de resonates
            comment.getResonates().forEach(resonate -> {
              resonate.getUser().getUsername(); // Forzar carga del usuario
            });
          })
          .map(CommentDTO::new)
          .collect(Collectors.toList());

      System.out.println("Returning " + result.size() + " comment DTOs");
      return result;
    } catch (Exception e) {
      System.err.println("Error in getExperienceCommentsWithPagination: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }
}