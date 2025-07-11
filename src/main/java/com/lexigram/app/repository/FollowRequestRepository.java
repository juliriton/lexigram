package com.lexigram.app.repository;

import com.lexigram.app.model.FollowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {
  Optional<FollowRequest> findByRequesterIdAndRequestedId(Long requesterId, Long requestedId);
  Optional<FollowRequest> findByUuid(UUID uuid);
  boolean existsByRequesterIdAndRequestedId(Long requesterId, Long requestedId);
}