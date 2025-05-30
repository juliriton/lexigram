package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
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
  private List<Suggestion> suggestions = new ArrayList<>();

  @ManyToMany(mappedBy = "tags")
  private List<Experience> experiences = new ArrayList<>();

  public Tag(){}

  public Tag(String name){
    this.name = name;
  }

  public String getName(){
    return name;
  }

  public boolean isInFeed(){
    return isInFeed;
  }

}
