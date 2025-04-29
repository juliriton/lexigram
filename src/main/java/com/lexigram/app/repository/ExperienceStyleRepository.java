package com.lexigram.app.repository;

import com.lexigram.app.model.ExperienceStyle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExperienceStyleRepository extends JpaRepository<ExperienceStyle, Long> {
}
