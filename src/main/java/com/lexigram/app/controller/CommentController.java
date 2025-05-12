package com.lexigram.app.controller;

import com.lexigram.app.dto.CommentDTO;
import com.lexigram.app.dto.PostCommentDTO;
import com.lexigram.app.dto.ReplyCommentDTO;
import com.lexigram.app.repository.CommentRepository;
import com.lexigram.app.service.CommentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/comment")
public class CommentController {

  private CommentService commentService;

  @Autowired
  public CommentController(
      CommentService commentService) {
    this.commentService = commentService;
  }

  @PutMapping("/{uuid}/reply")
  public ResponseEntity<CommentDTO> replyToComment(HttpSession session,
                                                   @PathVariable UUID uuid,
                                                   @RequestBody ReplyCommentDTO comment) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<CommentDTO> commentOptional = commentService.replyToComment(id, uuid, comment);

    return null;
  }

  @PutMapping("/{uuid}/resonate")
  public ResponseEntity<CommentDTO> resonateComment(HttpSession session,
                                                   @PathVariable UUID uuid) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<CommentDTO> commentOptional = commentService.resonateComment(id, uuid);

    return null;
  }

}
