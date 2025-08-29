package com.project.config;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import com.project.filter.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS 설정을 가장 먼저 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // HTTP Basic 인증 비활성화
            .httpBasic(AbstractHttpConfigurer::disable)
            
            // 세션 사용하지 않음 (Stateless)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // URL별 접근 권한 설정
            .authorizeHttpRequests(authz -> authz
            	    // 인증 없이 접근 가능한 경로들
            	    .requestMatchers("OPTIONS", "/**").permitAll()  // OPTIONS 요청 허용 (중요!)
            	    .requestMatchers("/demo/user/login").permitAll()
            	    .requestMatchers("/demo/user/register").permitAll()
            	    .requestMatchers("/user/login").permitAll()
            	    .requestMatchers("/user/register").permitAll()
            	    
            	    // 비밀번호 리셋 관련 경로 추가 (인증 불필요)
            	    .requestMatchers("/user/reset-password").permitAll()  // 비밀번호 리셋 실행
            	    .requestMatchers("/user/validate-reset-token/**").permitAll()  // 토큰 검증
            	    
            	    .requestMatchers("/user/password-reset-page").permitAll()  // 비밀번호 리셋 페이지 추가
            	    
            	    .requestMatchers("/api/public/**").permitAll()
            	    .requestMatchers("/ws/**").permitAll()
            	    .requestMatchers("/error").permitAll()
            	    .requestMatchers("/alert/**").permitAll()

            	    // 테스트용 엔드포인트 허용
            	    .requestMatchers("/test/**").permitAll()

                    // [수정] 새로 추가한 수소 탱크 API 경로 허용
                    .requestMatchers("/storage/**").permitAll()

                    .requestMatchers("/real/**").permitAll()


                    // 새로운 경로를 추가
                    .requestMatchers("/comparison/**").permitAll()
            	    
            	    // 나머지는 인증 필요 (비밀번호 리셋 요청은 여기에 포함됨)
            	    .anyRequest().authenticated()
            	)
            
            // JWT 필터 추가
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() { 
        return new BCryptPasswordEncoder(); 
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 Origin 설정 (정확히 일치해야 함)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:5174"
        ));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // 허용할 헤더 (모든 헤더 허용)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 인증 정보 포함 허용 (쿠키, Authorization 헤더 등)
        configuration.setAllowCredentials(true);
        
        // preflight 요청 결과를 캐시할 시간 (초)
        configuration.setMaxAge(3600L);
        
        // 모든 경로에 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}