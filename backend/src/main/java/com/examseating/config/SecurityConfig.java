package com.examseating.config; // Package declaration: Defines the package this class belongs to (com.examseating.config)

import org.springframework.context.annotation.Bean; // Import statement: Imports @Bean annotation for Spring bean definition
import org.springframework.context.annotation.Configuration; // Import statement: Imports @Configuration annotation for Spring configuration class
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Import statement: Imports HttpSecurity builder for security configuration
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Import statement: Imports @EnableWebSecurity annotation to enable Spring Security
import org.springframework.security.web.SecurityFilterChain; // Import statement: Imports SecurityFilterChain for security filter chain configuration
import org.springframework.web.cors.CorsConfiguration; // Import statement: Imports CorsConfiguration for CORS settings
import org.springframework.web.cors.CorsConfigurationSource; // Import statement: Imports CorsConfigurationSource interface for CORS configuration source
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Import statement: Imports UrlBasedCorsConfigurationSource for URL-based CORS configuration

import java.util.Arrays; // Import statement: Imports Arrays class for array operations

/**
 * Security configuration for the Exam Seating System
 * Disables security for development and enables CORS
 */
@Configuration // Spring annotation: Marks this class as a configuration class for Spring context
@EnableWebSecurity // Spring annotation: Enables Spring Security web security support
public class SecurityConfig { // Class declaration: Public class named SecurityConfig for security configuration

    @Bean // Spring annotation: Defines a bean for Spring context (SecurityFilterChain)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception { // Method declaration: Public method that configures and returns SecurityFilterChain
        http // Method chaining: Begins building HTTP security configuration
            .cors().and() // Security builder: Enables CORS support and chains to next configuration
            .csrf().disable() // Security builder: Disables CSRF protection (for development)
            .authorizeRequests() // Security builder: Begins authorization configuration
                .anyRequest().permitAll() // Security builder: Permits all requests without authentication (for development)
            .and() // Security builder: Chains to next configuration
            .headers().frameOptions().disable(); // Security builder: Disables frame options for H2 console access
        
        return http.build(); // Return statement: Builds and returns the SecurityFilterChain
    }

    @Bean // Spring annotation: Defines a bean for Spring context (CorsConfigurationSource)
    public CorsConfigurationSource corsConfigurationSource() { // Method declaration: Public method that configures and returns CORS settings
        CorsConfiguration configuration = new CorsConfiguration(); // Object instantiation: Creates new CorsConfiguration object
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // Method call: Sets allowed origin patterns to all (wildcard)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Method call: Sets allowed HTTP methods
        configuration.setAllowedHeaders(Arrays.asList("*")); // Method call: Sets allowed headers to all (wildcard)
        configuration.setAllowCredentials(true); // Method call: Enables sending of credentials (cookies, authorization headers)
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); // Object instantiation: Creates URL-based CORS configuration source
        source.registerCorsConfiguration("/**", configuration); // Method call: Registers CORS configuration for all URL paths
        return source; // Return statement: Returns the CORS configuration source
    }
} // Class closing brace: End of SecurityConfig class
