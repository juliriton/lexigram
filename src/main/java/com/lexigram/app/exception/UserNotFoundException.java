package com.lexigram.app.exception;

import java.util.List;

public class UserNotFoundException extends RuntimeException {
  public UserNotFoundException() {
    super("User does not exist");
  }

  public UserNotFoundException(String message) {
    super(message);
  }
}
