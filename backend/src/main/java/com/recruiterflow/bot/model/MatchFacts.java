package com.recruiterflow.bot.model;

public record MatchFacts(Long id, String name, int experienceYears, int minExperience,
                         int requiredSkills, int overlappingSkills) {}
