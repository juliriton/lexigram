package com.lexigram.app.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity(name = "suggestions")
public class Suggestion {

  @PrePersist
  protected void onCreate() {
    this.creationDate = System.currentTimeMillis();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, updatable = false)
  private UUID uuid = UUID.randomUUID();

  @Column(nullable = false, columnDefinition = "Text")
  private String header = "Tell me about";

  @Column(nullable = false)
  private long resonateAmount = 0;

  @Column(nullable = false)
  private long experienceAmount = 0;

  @Column(nullable = false)
  private long creationDate;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToMany(mappedBy = "suggestions", cascade = CascadeType.ALL)
  @JoinColumn(name = "tag_id", nullable = false)
  private Set<Tag> tags = new HashSet<>();

}
