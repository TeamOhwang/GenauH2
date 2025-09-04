package com.project.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
                
                // WebSocket 관련 경로들 허용
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/websocket/**").permitAll()  // WebSocket 테스트 API 허용
                .requestMatchers("/topic/**").permitAll()  // STOMP 토픽 허용
                .requestMatchers("/app/**").permitAll()   // STOMP 앱 접두사 허용
                
                .requestMatchers("/error").permitAll()
                .requestMatchers("/alert/**").permitAll()

                // 테스트용 엔드포인트 허용
                .requestMatchers("/test/**").permitAll()

                // 새로 추가한 수소 탱크 API 경로 허용
                .requestMatchers("/storage/**").permitAll()

                .requestMatchers("/real/**").permitAll()

                // 새로운 경로를 추가
                .requestMatchers("/comparison/**").permitAll()
                
                // 나머지는 인증 필요
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
        
        // 모든 origin 허용 (개발용 - 보안상 프로덕션에서는 특정 도메인만 허용)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // 모든 HTTP 메서드 허용
        configuration.setAllowedMethods(Arrays.asList("*"));
        
        // 모든 헤더 허용
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