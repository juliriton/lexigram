package com.lexigram.app.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity(name = "experiences")
public class Experience {

  @PrePersist
  protected void onCreate() {
    this.creationDate = System.currentTimeMillis();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, columnDefinition = "Text")
  private String quote;

  @Column(nullable = false, columnDefinition = "Text")
  private String reflection;

  @Column(nullable = false)
  private long creationDate;

  @Column(nullable = false)
  private long resonatesAmount = 0;

  @Column(nullable = false)
  private long commentAmount = 0;

  @Column(nullable = false)
  private long saveAmount = 0;

  @Column(nullable = false)
  private long branchAmount = 0;

  @Column(nullable = false)
  private boolean isOrigin = true;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Comment> comments = new ArrayList<>();

  @ManyToMany(mappedBy = "experiences")
  @JoinColumn(name = "experience_id", nullable = false)
  private Set<Tag> tags = new HashSet<>();

  @ManyToOne
  @JoinColumn(name = "origin_id", nullable = false)
  private Experience origin;

  @OneToMany(mappedBy = "origin", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Experience> forks = new ArrayList<>();

  @OneToOne(cascade = CascadeType.ALL)
  @JoinColumn(name = "style_id", referencedColumnName = "id")
  private ExperienceStyle style;

  @OneToOne(mappedBy = "experience", cascade = CascadeType.ALL)
  private ExperiencePrivacySettings experiencePrivacySettings;

  @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<User> mentions = new HashSet<>();

}
