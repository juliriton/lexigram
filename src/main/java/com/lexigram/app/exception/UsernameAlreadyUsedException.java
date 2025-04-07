package com.lexigram.app.exception;

public class UsernameAlreadyUsedException extends RuntimeException {
  public UsernameAlreadyUsedException() {
    super("Username is already used");
  }
}
