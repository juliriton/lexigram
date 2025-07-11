package com.lexigram.app.service;

import com.lexigram.app.model.FollowRequest;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.FollowRequestRepository;
import com.lexigram.app.repository.NotificationRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;


@Service
public class FollowRequestService {

  @Autowired
  private FollowRequestRepository followRequestRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private NotificationService notificationService;

  @Autowired
  private NotificationRepository notificationRepository;

  public boolean sendFollowRequest(Long requesterId, Long requestedId) {
    if (followRequestRepository.existsByRequesterIdAndRequestedId(requesterId, requestedId)) {
      return false;
    }

    Optional<User> requester = userRepository.findById(requesterId);
    Optional<User> requested = userRepository.findById(requestedId);

    if (requester.isEmpty() || requested.isEmpty()) {
      return false;
    }

    FollowRequest followRequest = new FollowRequest();
    followRequest.setRequester(requester.get());
    followRequest.setRequested(requested.get());

    followRequestRepository.save(followRequest);

    notificationService.createFollowRequestNotification(requester.get(), requested.get(), followRequest);

    return true;
  }

  @Transactional
  public boolean acceptFollowRequest(UUID requestUuid) {
    Optional<FollowRequest> followRequest = followRequestRepository.findByUuid(requestUuid);
    if (followRequest.isEmpty()) {
      return false;
    }

    FollowRequest request = followRequest.get();
    User requester = request.getRequester();
    User requested = request.getRequested();

    requester.addFollowing(requested);
    requested.addFollower(requester);

    userRepository.save(requester);
    userRepository.save(requested);

    notificationRepository.deleteByFollowRequest(request);

    followRequestRepository.delete(request);

    return true;
  }

  @Transactional
  public boolean rejectFollowRequest(UUID requestUuid) {
    Optional<FollowRequest> followRequest = followRequestRepository.findByUuid(requestUuid);
    if (followRequest.isEmpty()) {
      return false;
    }

    FollowRequest request = followRequest.get();

    notificationRepository.deleteByFollowRequest(request);

    followRequestRepository.delete(request);
    return true;
  }
}