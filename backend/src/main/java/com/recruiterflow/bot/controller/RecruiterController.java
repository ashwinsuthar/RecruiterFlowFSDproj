package com.recruiterflow.bot.controller;

import com.recruiterflow.bot.dto.CandidateInput;
import com.recruiterflow.bot.dto.JobInput;
import com.recruiterflow.bot.model.Candidate;
import com.recruiterflow.bot.model.Job;
import com.recruiterflow.bot.model.MatchResult;
import com.recruiterflow.bot.repository.RecruiterRepository;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RecruiterController {
    private final RecruiterRepository repository;
    public RecruiterController(RecruiterRepository repository) { this.repository = repository; }

    @GetMapping("/candidates") public List<Candidate> candidates() { return repository.candidates(); }
    @GetMapping("/jobs") public List<Job> jobs() { return repository.jobs(); }
    @PostMapping("/candidates") public ResponseEntity<Candidate> createCandidate(@Valid @RequestBody CandidateInput input) {
        long id = repository.createCandidate(input);
        return ResponseEntity.created(URI.create("/api/candidates/" + id)).body(repository.candidate(id).orElseThrow());
    }
    @PostMapping("/jobs") public ResponseEntity<Job> createJob(@Valid @RequestBody JobInput input) {
        long id = repository.createJob(input);
        return ResponseEntity.created(URI.create("/api/jobs/" + id)).body(repository.job(id).orElseThrow());
    }
    @GetMapping("/jobs/{id}/matches") public ResponseEntity<List<MatchResult>> jobMatches(@PathVariable long id) {
        if (repository.job(id).isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(repository.candidatesForJob(id));
    }
    @GetMapping("/candidates/{id}/matches") public ResponseEntity<List<MatchResult>> candidateMatches(@PathVariable long id) {
        if (repository.candidate(id).isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(repository.jobsForCandidate(id));
    }
}
