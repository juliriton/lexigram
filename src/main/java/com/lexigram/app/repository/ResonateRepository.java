package com.lexigram.app.repository;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResonateRepository extends JpaRepository<Resonate, Long> {
  void deleteByUserAndExperience(User user, Experience experience);
}
