package com.recruiterflow.bot.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record JobInput(@NotBlank String title, @NotEmpty List<@NotBlank String> requiredSkills,
                       @Min(0) int minExperience, @NotBlank String cultureKeywords,
                       @NotBlank String tagline) {}
