package com.recruiterflow.bot.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI recruiterBotOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Recruiter Bot API")
                .version("1.0.0")
                .description("Candidate and job ingestion with explainable, ranked matching. Data is persisted in MySQL using hand-written SQL.")
                .contact(new Contact().name("RecruiterFlow Internship Project")));
    }
}
