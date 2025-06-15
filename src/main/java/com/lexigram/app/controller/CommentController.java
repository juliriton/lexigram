package com.lexigram.app.controller;

import com.lexigram.app.dto.CommentDTO;
import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.PostCommentDTO;
import com.lexigram.app.dto.ReplyCommentDTO;
import com.lexigram.app.service.CommentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/comment")
public class CommentController {

  private final CommentService commentService;

  @Autowired
  public CommentController(CommentService commentService) {
    this.commentService = commentService;
  }

  @PutMapping("/{uuid}/reply")
  public ResponseEntity<CommentDTO> replyToComment(HttpSession session,
                                                   @PathVariable UUID uuid,
                                                   @RequestBody ReplyCommentDTO comment) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) {
      System.err.println("User not authenticated for reply");
      return ResponseEntity.status(401).build();
    }

    try {
      System.out.println("User " + id + " replying to comment " + uuid + " with content: " + comment.getContent());
      Optional<CommentDTO> replyDto = commentService.replyToComment(id, uuid, comment);

      if (replyDto.isPresent()) {
        System.out.println("Reply successful");
        return ResponseEntity.ok(replyDto.get());
      } else {
        System.err.println("Comment not found for reply");
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      System.err.println("Error replying to comment: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }

  @PutMapping("/{uuid}/resonate")
  public ResponseEntity<CommentDTO> resonateComment(HttpSession session,
                                                    @PathVariable UUID uuid) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) {
      System.err.println("User not authenticated for resonate");
      return ResponseEntity.status(401).build();
    }

    try {
      System.out.println("User " + id + " resonating with comment " + uuid);
      Optional<CommentDTO> commentOptional = commentService.resonateComment(id, uuid);

      if (commentOptional.isPresent()) {
        System.out.println("Resonate successful");
        return ResponseEntity.ok(commentOptional.get());
      } else {
        System.err.println("Comment not found for resonate");
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      System.err.println("Error resonating comment: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }


  @DeleteMapping("/{uuid}")
  public ResponseEntity<Void> deleteComment(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) {
      System.err.println("User not authenticated for delete");
      return ResponseEntity.status(401).build();
    }

    try {
      System.out.println("User " + id + " deleting comment " + uuid);
      boolean deleted = commentService.deleteComment(id, uuid);
      if (deleted) {
        System.out.println("Comment deleted successfully");
        return ResponseEntity.ok().build();
      } else {
        System.err.println("Comment not found for deletion");
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      System.err.println("Error deleting comment: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }
}

// Controlador para comentarios de experiencias
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/experience")
class ExperienceCommentController {

  private final CommentService commentService;

  @Autowired
  public ExperienceCommentController(CommentService commentService) {
    this.commentService = commentService;
  }

  @PostMapping("/{uuid}/comment")
  public ResponseEntity<ExperienceDTO> commentOnExperience(HttpSession session,
                                                           @PathVariable UUID uuid,
                                                           @RequestBody PostCommentDTO commentDTO) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) {
      System.err.println("User not authenticated for commenting");
      return ResponseEntity.status(401).build();
    }

    try {
      System.out.println("Posting comment on experience: " + uuid + " by user: " + id);
      System.out.println("Comment content: " + commentDTO.getContent());

      ExperienceDTO result = commentService.commentOnExperienceAndReturnExperience(id, uuid, commentDTO);

      System.out.println("Comment posted successfully. Experience now has " + result.getCommentAmount() + " comments");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.err.println("Error commenting on experience: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }
}

// Controlador público para obtener comentarios
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/experience")
class PublicExperienceController {

  private final CommentService commentService;

  @Autowired
  public PublicExperienceController(CommentService commentService) {
    this.commentService = commentService;
  }

  @GetMapping("/{uuid}/comments")
  public ResponseEntity<List<CommentDTO>> getExperienceComments(@PathVariable UUID uuid) {
    try {
      System.out.println("Fetching all comments for experience: " + uuid);
      List<CommentDTO> comments = commentService.getExperienceComments(uuid);
      System.out.println("Found " + comments.size() + " comments");
      return ResponseEntity.ok(comments);
    } catch (Exception e) {
      System.err.println("Error fetching comments: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }

  @GetMapping("/{uuid}/comments/count")
  public ResponseEntity<Long> getExperienceCommentsCount(@PathVariable UUID uuid) {
    try {
      System.out.println("Fetching comment count for experience: " + uuid);
      long count = commentService.getExperienceCommentsCount(uuid);
      System.out.println("Comment count: " + count);
      return ResponseEntity.ok(count);
    } catch (Exception e) {
      System.err.println("Error fetching comment count: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }

  @GetMapping("/{uuid}/comments/paginated")
  public ResponseEntity<List<CommentDTO>> getExperienceCommentsPaginated(
      @PathVariable UUID uuid,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    try {
      System.out.println("Fetching paginated comments for experience: " + uuid + " (page: " + page + ", size: " + size + ")");
      List<CommentDTO> comments = commentService.getExperienceCommentsWithPagination(uuid, page, size);
      System.out.println("Returning " + comments.size() + " comments for page " + page);
      return ResponseEntity.ok(comments);
    } catch (Exception e) {
      System.err.println("Error fetching paginated comments: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).build();
    }
  }
}