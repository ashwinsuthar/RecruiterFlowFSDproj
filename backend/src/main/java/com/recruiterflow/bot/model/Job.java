package com.recruiterflow.bot.model;

import java.util.List;

public record Job(Long id, String title, List<String> requiredSkills, int minExperience,
                  String cultureKeywords, String tagline) {}
