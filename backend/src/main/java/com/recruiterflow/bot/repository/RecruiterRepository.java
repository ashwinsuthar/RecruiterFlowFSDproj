package com.recruiterflow.bot.repository;

import com.recruiterflow.bot.dto.CandidateInput;
import com.recruiterflow.bot.dto.JobInput;
import com.recruiterflow.bot.model.Candidate;
import com.recruiterflow.bot.model.Job;
import com.recruiterflow.bot.model.MatchResult;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class RecruiterRepository {
    private final JdbcTemplate jdbc;
    public RecruiterRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final RowMapper<Candidate> CANDIDATE = (rs, n) -> new Candidate(
            rs.getLong("id"), rs.getString("name"), List.of(), rs.getInt("experience_years"),
            rs.getString("availability"), rs.getString("traits"), rs.getString("quirk"));
    private static final RowMapper<Job> JOB = (rs, n) -> new Job(rs.getLong("id"), rs.getString("title"),
            List.of(), rs.getInt("min_experience"), rs.getString("culture_keywords"), rs.getString("tagline"));

    @Transactional
    public long createCandidate(CandidateInput input) {
        jdbc.update("INSERT INTO candidates(name, experience_years, availability, traits, quirk) VALUES(?,?,?,?,?)",
                input.name(), input.experienceYears(), input.availability(), input.traits(), input.quirk());
        long id = jdbc.queryForObject("SELECT id FROM candidates WHERE name = ?", Long.class, input.name());
        input.skills().stream().map(String::trim).map(String::toLowerCase).distinct()
                .forEach(skill -> jdbc.update("INSERT INTO candidate_skills(candidate_id, skill) VALUES(?,?)", id, skill));
        return id;
    }

    @Transactional
    public long createJob(JobInput input) {
        jdbc.update("INSERT INTO jobs(title, min_experience, culture_keywords, tagline) VALUES(?,?,?,?)",
                input.title(), input.minExperience(), input.cultureKeywords(), input.tagline());
        long id = jdbc.queryForObject("SELECT id FROM jobs WHERE title = ?", Long.class, input.title());
        input.requiredSkills().stream().map(String::trim).map(String::toLowerCase).distinct()
                .forEach(skill -> jdbc.update("INSERT INTO job_skills(job_id, skill) VALUES(?,?)", id, skill));
        return id;
    }

    public List<Candidate> candidates() {
        return jdbc.query("SELECT * FROM candidates ORDER BY id", CANDIDATE).stream().map(c -> withCandidateSkills(c)).toList();
    }
    public List<Job> jobs() { return jdbc.query("SELECT * FROM jobs ORDER BY id", JOB).stream().map(j -> withJobSkills(j)).toList(); }
    public Optional<Candidate> candidate(long id) { return jdbc.query("SELECT * FROM candidates WHERE id=?", CANDIDATE, id).stream().findFirst().map(this::withCandidateSkills); }
    public Optional<Job> job(long id) { return jdbc.query("SELECT * FROM jobs WHERE id=?", JOB, id).stream().findFirst().map(this::withJobSkills); }

    private Candidate withCandidateSkills(Candidate c) {
        List<String> skills = jdbc.queryForList("SELECT skill FROM candidate_skills WHERE candidate_id=? ORDER BY skill", String.class, c.id());
        return new Candidate(c.id(), c.name(), skills, c.experienceYears(), c.availability(), c.traits(), c.quirk());
    }
    private Job withJobSkills(Job j) {
        List<String> skills = jdbc.queryForList("SELECT skill FROM job_skills WHERE job_id=? ORDER BY skill", String.class, j.id());
        return new Job(j.id(), j.title(), skills, j.minExperience(), j.cultureKeywords(), j.tagline());
    }

    public List<MatchResult> candidatesForJob(long jobId) {
        String sql = "SELECT c.id, c.name, c.experience_years, j.min_experience, " +
                "COUNT(DISTINCT js.skill) AS required_count, COUNT(DISTINCT cs.skill) AS overlap_count " +
                "FROM jobs j CROSS JOIN candidates c LEFT JOIN job_skills js ON js.job_id=j.id " +
                "LEFT JOIN candidate_skills cs ON cs.candidate_id=c.id AND cs.skill=js.skill " +
                "WHERE j.id=? GROUP BY c.id,c.name,c.experience_years,j.min_experience ORDER BY c.id";
        return jdbc.query(sql, (rs, n) -> {
            int required = rs.getInt("required_count"), overlap = rs.getInt("overlap_count");
            int exp = rs.getInt("experience_years"), min = rs.getInt("min_experience");
            double skills = required == 0 ? 0 : (double) overlap / required;
            double expFit = min == 0 || exp >= min ? 1 : (double) exp / min;
            String reason = overlap + " of " + required + " required skills match; " + exp +
                    " years experience against " + min + " required.";
            return new MatchResult(rs.getLong("id"), rs.getString("name"), round((skills * .7 + expFit * .3) * 100), reason);
        }, jobId).stream().sorted((a, b) -> { int score = Double.compare(b.score(), a.score()); return score == 0 ? Long.compare(a.id(), b.id()) : score; }).toList();
    }

    public List<MatchResult> jobsForCandidate(long candidateId) {
        String sql = "SELECT j.id, j.title, c.experience_years, j.min_experience, " +
                "COUNT(DISTINCT js.skill) AS required_count, COUNT(DISTINCT cs.skill) AS overlap_count " +
                "FROM candidates c CROSS JOIN jobs j LEFT JOIN job_skills js ON js.job_id=j.id " +
                "LEFT JOIN candidate_skills cs ON cs.candidate_id=c.id AND cs.skill=js.skill " +
                "WHERE c.id=? GROUP BY j.id,j.title,c.experience_years,j.min_experience ORDER BY j.id";
        return jdbc.query(sql, (rs, n) -> {
            int required = rs.getInt("required_count"), overlap = rs.getInt("overlap_count");
            int exp = rs.getInt("experience_years"), min = rs.getInt("min_experience");
            double skills = required == 0 ? 0 : (double) overlap / required;
            double expFit = min == 0 || exp >= min ? 1 : (double) exp / min;
            String reason = overlap + " of " + required + " required skills match; " + exp +
                    " years experience against " + min + " required.";
            return new MatchResult(rs.getLong("id"), rs.getString("title"), round((skills * .7 + expFit * .3) * 100), reason);
        }, candidateId).stream().sorted((a, b) -> { int score = Double.compare(b.score(), a.score()); return score == 0 ? Long.compare(a.id(), b.id()) : score; }).toList();
    }
    private static double round(double n) { return Math.round(n * 100.0) / 100.0; }

    @Transactional
    public void seedIfEmpty() {
        if (jdbc.queryForObject("SELECT COUNT(*) FROM candidates", Integer.class) > 0) return;
        List<CandidateInput> people = List.of(
            new CandidateInput("Sherlock H.", List.of("deduction","pattern-recognition","forensics"), 8,"Immediate","analytical, blunt","Solves problems by eliminating the impossible; occasionally insufferable in standups."),
            new CandidateInput("Hermione G.", List.of("research","time-management","public-speaking"),4,"2 weeks","detail-oriented, overachiever","Reads the entire documentation before writing a single line of code."),
            new CandidateInput("Tony S.", List.of("systems-design","rapid-prototyping","leadership"),12,"Not looking","confident, innovative","Ships an MVP overnight, refuses to write tests."),
            new CandidateInput("Leslie K.", List.of("project-management","stakeholder-management","public-speaking"),6,"Immediate","tenacious, organized","Has a binder for everything, including the binder."),
            new CandidateInput("Ron S.", List.of("woodworking","minimalism","negotiation"),15,"Not looking","stubborn, principled","Refuses to use more than one monitor."),
            new CandidateInput("Rick S.", List.of("systems-design","rapid-prototyping","chemistry"),20,"Immediate","genius, reckless","Solution works, mechanism deeply concerning."),
            new CandidateInput("Elle W.", List.of("persuasion","research","public-speaking"),3,"Immediate","optimistic, sharp","Underestimated in every standup, correct in every retro."),
            new CandidateInput("MacGyver", List.of("rapid-prototyping","resourcefulness","chemistry","systems-design"),10,"2 weeks","calm, improviser","Fixes production outages with duct tape and a paperclip metaphor."),
            new CandidateInput("Sheldon C.", List.of("theoretical-analysis","pattern-recognition","research"),9,"Immediate","rigid, brilliant","Correct 95% of the time, insufferable 100% of the time."),
            new CandidateInput("Katniss E.", List.of("precision","strategy","crisis-management"),5,"Immediate","resilient, decisive","Excellent under pressure, terrible with public speaking."),
            new CandidateInput("Michael S.", List.of("sales","public-speaking","team-building"),11,"Not looking","enthusiastic, chaotic","World's best boss, according to a mug he bought himself."),
            new CandidateInput("Olivia P.", List.of("crisis-management","negotiation","strategy","leadership"),13,"2 weeks","decisive, intense","Handles it. Whatever it is."),
            new CandidateInput("Ted L.", List.of("team-building","optimism","mentorship","public-speaking"),7,"Immediate","empathetic, persistent","Turns every technical setback into a folksy metaphor."),
            new CandidateInput("Miranda P.", List.of("leadership","negotiation","stakeholder-management","precision"),18,"Not looking","demanding, decisive","Reviews every PR personally. Says nothing. Everyone panics."),
            new CandidateInput("Dwight S.", List.of("sales","negotiation","security","loyalty"),9,"Immediate","intense, loyal","Assistant to the regional backend engineer.")
        );
        people.forEach(this::createCandidate);
        List<JobInput> openings = List.of(
            new JobInput("Backend Detective",List.of("deduction","pattern-recognition","forensics"),3,"analytical, autonomous","We have a bug. We have no leads. We have you."),
            new JobInput("Rapid Prototyping Engineer",List.of("rapid-prototyping","systems-design"),2,"innovative, fast-paced","Ship first, document never (kidding — please document)."),
            new JobInput("Developer Relations Lead",List.of("public-speaking","research"),2,"energetic, curious","Explain complex things to confused humans, cheerfully."),
            new JobInput("Engineering Manager, Chaos Team",List.of("team-building","stakeholder-management","leadership"),5,"empathetic, organized","Herd cats. The cats are senior engineers."),
            new JobInput("Incident Commander",List.of("crisis-management","strategy","negotiation"),4,"decisive, calm-under-pressure","3am page. You're the one who picks up."),
            new JobInput("Sales Engineer",List.of("sales","public-speaking","negotiation"),3,"enthusiastic, persistent","Sell the vision, then go build it.")
        );
        openings.forEach(this::createJob);
    }
}
