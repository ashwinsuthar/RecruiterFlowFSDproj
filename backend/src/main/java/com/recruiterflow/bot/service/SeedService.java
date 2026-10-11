package com.recruiterflow.bot.service;

import com.recruiterflow.bot.repository.RecruiterRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedService implements ApplicationRunner {
    private final RecruiterRepository repository;
    public SeedService(RecruiterRepository repository) { this.repository = repository; }
    @Override public void run(ApplicationArguments args) { repository.seedIfEmpty(); }
}
