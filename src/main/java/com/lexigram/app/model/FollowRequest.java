package com.lexigram.app.model;

import com.lexigram.app.model.user.User;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "follow_requests")
public class FollowRequest {

  @PrePersist
  protected void onCreate() {
    this.uuid = UUID.randomUUID();
    this.creationDate = System.currentTimeMillis();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, updatable = false)
  private UUID uuid;

  @Column(nullable = false)
  private long creationDate;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "requester_id")
  private User requester;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "requested_id")
  private User requested;

  public UUID getUuid() { return uuid; }
  public User getRequester() { return requester; }
  public User getRequested() { return requested; }
  public long getCreationDate() { return creationDate; }

  public void setRequester(User requester) { this.requester = requester; }
  public void setRequested(User requested) { this.requested = requested; }
}