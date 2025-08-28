package com.project.filter;

import com.project.security.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private TokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        log.info("Request URI: " + path);
        
        // JWT 토큰 검증을 건너뛸 경로들
        if (isPublicPath(path)) {
            log.info("Skipping JWT filter for public path: " + path);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String token = parseBearerToken(request);
            log.info("Filter is running...");
            
            if (token != null && !token.equalsIgnoreCase("null")) {
                String userId = tokenProvider.validateAndGetUserId(token);
                log.info("Authenticated user ID : " + userId);
                
                AbstractAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        AuthorityUtils.NO_AUTHORITIES
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                securityContext.setAuthentication(authentication);
                SecurityContextHolder.setContext(securityContext);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * 공개 경로 (JWT 토큰 없이 접근 가능한 경로) 확인
     */
    private boolean isPublicPath(String path) {
        // 로그인 경로
        if (path.equals("/gh/user/login") || 
            path.equals("/demo/user/login") || 
            path.equals("/user/login") ||
            path.endsWith("/user/login")) {
            return true;
        }
        
        // 회원가입 경로 (일반 사용자 회원가입)
        if (path.equals("/gh/user/register") ||
            path.equals("/demo/user/register") ||
            path.equals("/user/register") ||
            path.endsWith("/user/register")) {
            return true;
        }
        
        // 비밀번호 리셋 관련 경로 (공개 API - 인증 없이 접근 가능)
        // 토큰 검증 API
        if (path.contains("/validate-reset-token/")) {
            return true;
        }
        
        // 비밀번호 리셋 실행 API
        if (path.equals("/gh/user/reset-password") ||
            path.equals("/demo/user/reset-password") ||
            path.equals("/user/reset-password") ||
            path.endsWith("/user/reset-password")) {
            return true;
        }
        
        if (path.equals("/gh/user/password-reset-page") ||
        	    path.equals("/demo/user/password-reset-page") ||
        	    path.equals("/user/password-reset-page") ||
        	    path.endsWith("/user/password-reset-page")) {
        	    return true;
        	}
        
        // 기타 정적 리소스나 헬스체크 등
        if (path.startsWith("/health") || 
            path.startsWith("/actuator") ||
            path.startsWith("/static/") ||
            path.startsWith("/css/") ||
            path.startsWith("/js/") ||
            path.startsWith("/images/")) {
            return true;
        }
        
        return false;
    }

    private String parseBearerToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}