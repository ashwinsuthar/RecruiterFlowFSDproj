package com.recruiterflow.bot.service;

import com.recruiterflow.bot.model.MatchFacts;
import com.recruiterflow.bot.model.MatchResult;
import com.recruiterflow.bot.repository.RecruiterRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MatchingService {
    private final RecruiterRepository repository;
    public MatchingService(RecruiterRepository repository) { this.repository = repository; }

    public List<MatchResult> candidatesForJob(long jobId) {
        return rank(repository.candidateFactsForJob(jobId));
    }
    public List<MatchResult> jobsForCandidate(long candidateId) {
        return rank(repository.jobFactsForCandidate(candidateId));
    }
    private List<MatchResult> rank(List<MatchFacts> facts) {
        return facts.stream().map(fact -> {
            double skillFit = fact.requiredSkills() == 0 ? 0 : (double) fact.overlappingSkills() / fact.requiredSkills();
            double experienceFit = fact.minExperience() == 0 || fact.experienceYears() >= fact.minExperience()
                    ? 1 : (double) fact.experienceYears() / fact.minExperience();
            double score = Math.round((skillFit * .7 + experienceFit * .3) * 10000.0) / 100.0;
            String reason = fact.overlappingSkills() + " of " + fact.requiredSkills() + " required skills match; "
                    + fact.experienceYears() + " years experience against " + fact.minExperience() + " required.";
            return new MatchResult(fact.id(), fact.name(), score, reason);
        }).sorted(Comparator.comparingDouble(MatchResult::score).reversed().thenComparing(MatchResult::id)).toList();
    }
}
