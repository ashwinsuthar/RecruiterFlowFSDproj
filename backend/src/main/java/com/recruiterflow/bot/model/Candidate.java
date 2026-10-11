package com.recruiterflow.bot.model;

import java.util.List;

public record Candidate(Long id, String name, List<String> skills, int experienceYears,
                        String availability, String traits, String quirk) {}
