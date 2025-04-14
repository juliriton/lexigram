package com.lexigram.app.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "tags")
public class Tag {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private boolean isInFeed = false;

  @Column(unique = true, nullable = false)
  private String name;

  @ManyToMany(mappedBy = "tags")
  @JoinColumn(name = "suggestion_id", nullable = false)
  private List<Suggestion> suggestions = new ArrayList<>();

  @ManyToMany(mappedBy = "tags")
  @JoinColumn(name = "experience_id")
  private List<Experience> experiences = new ArrayList<>();

  public String getName(){
    return name;
  }

  public boolean isInFeed(){
    return isInFeed;
  }

}
