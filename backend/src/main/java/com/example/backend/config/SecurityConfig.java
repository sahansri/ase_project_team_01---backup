package com.example.backend.config;

//import org.mockito.cglib.core.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        http.cors(org.springframework.security.config.Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers("/api/trip/**").permitAll()

                        // Admin-only: creating or deleting users/drivers
                        /* .requestMatchers("/api/user/create-user", "/api/user/create-driver").hasAuthority("ADMIN")
                        .requestMatchers("/api/user/delete-user/**").hasAuthority("ADMIN")

                        // Admins can update anyone; Drivers can update their own info
                        .requestMatchers("/api/user/update-user/**").hasAnyAuthority("ADMIN", "DRIVER")
                        .requestMatchers("/api/user/find-user/**").hasAnyAuthority("ADMIN", "DRIVER")*/
                        .requestMatchers("/api/user/**").permitAll()
                        .requestMatchers("/api/buses/**").permitAll()
                        
                        .requestMatchers("/api/routes/**").permitAll()

                        .requestMatchers("/api/schedule/**").permitAll()

                        .requestMatchers("/api/maintenance/**").permitAll()

                        .requestMatchers("/api/dashboard/**").permitAll()

                        .requestMatchers("/api/location/**").permitAll()

                        .requestMatchers("/api/all-buses-report").permitAll()

                        .requestMatchers("/ws/**").permitAll()

                        .requestMatchers("/app/**").permitAll()

                        .requestMatchers("/api/notifications/**").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
