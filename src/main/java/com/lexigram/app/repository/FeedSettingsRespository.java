package com.lexigram.app.repository;

import com.lexigram.app.model.FeedSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedSettingsRespository extends JpaRepository<FeedSettings, Long> {
}
