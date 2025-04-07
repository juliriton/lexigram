package com.lexigram.app.exception;

public class EmailAlreadyUsedException extends RuntimeException {
  public EmailAlreadyUsedException() {
    super("Email is already used");
  }
}
