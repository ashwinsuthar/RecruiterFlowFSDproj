package com.recruiterflow.bot.controller;

import com.recruiterflow.bot.dto.CandidateInput;
import com.recruiterflow.bot.dto.JobInput;
import com.recruiterflow.bot.model.Candidate;
import com.recruiterflow.bot.model.Job;
import com.recruiterflow.bot.model.MatchResult;
import com.recruiterflow.bot.repository.RecruiterRepository;
import com.recruiterflow.bot.service.MatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Recruiter Bot", description = "Candidate/job ingestion and ranked matching")
public class RecruiterController {
    private final RecruiterRepository repository;
    private final MatchingService matchingService;
    public RecruiterController(RecruiterRepository repository, MatchingService matchingService) { this.repository = repository; this.matchingService = matchingService; }

    @Operation(summary = "List candidates", description = "Returns all candidates and their skills, including the fictional seed data.")
    @GetMapping("/candidates") public List<Candidate> candidates() { return repository.candidates(); }

    @Operation(summary = "List jobs", description = "Returns all openings and required skills, including the seed data.")
    @GetMapping("/jobs") public List<Job> jobs() { return repository.jobs(); }

    @Operation(summary = "Create a candidate", description = "Stores a candidate and their skills. Experience must be zero or greater.")
    @PostMapping("/candidates") public ResponseEntity<Candidate> createCandidate(@Valid @RequestBody CandidateInput input) {
        long id = repository.createCandidate(input);
        return ResponseEntity.created(URI.create("/candidates/" + id)).body(repository.candidate(id).orElseThrow());
    }
    @Operation(summary = "Create a job", description = "Stores an opening and its required skills. Minimum experience must be zero or greater.")
    @PostMapping("/jobs") public ResponseEntity<Job> createJob(@Valid @RequestBody JobInput input) {
        long id = repository.createJob(input);
        return ResponseEntity.created(URI.create("/jobs/" + id)).body(repository.job(id).orElseThrow());
    }
    @Operation(summary = "Rank candidates for a job", description = "Scores candidates using 70% required-skill coverage and 30% experience fit. Returns 404 when the job does not exist.")
    @GetMapping("/jobs/{id}/matches") public ResponseEntity<List<MatchResult>> jobMatches(@PathVariable long id) {
        if (repository.job(id).isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(matchingService.candidatesForJob(id));
    }
    @Operation(summary = "Rank jobs for a candidate", description = "Returns jobs ranked for this candidate using skill coverage and experience fit. Returns 404 when the candidate does not exist.")
    @GetMapping("/candidates/{id}/matches") public ResponseEntity<List<MatchResult>> candidateMatches(@PathVariable long id) {
        if (repository.candidate(id).isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(matchingService.jobsForCandidate(id));
    }
}
