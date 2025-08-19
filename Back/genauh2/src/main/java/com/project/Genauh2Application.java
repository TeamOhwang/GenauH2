package com.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // 스케줄링 기능 활성화
public class Genauh2Application {

	public static void main(String[] args) {
		SpringApplication.run(Genauh2Application.class, args);
	}

}
