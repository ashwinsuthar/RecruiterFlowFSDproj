package com.recruiterflow.bot.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CandidateInput(@NotBlank String name, @NotEmpty List<@NotBlank String> skills,
                             @Min(0) int experienceYears, @NotBlank String availability,
                             @NotBlank String traits, @NotBlank String quirk) {}
