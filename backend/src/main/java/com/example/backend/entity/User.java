package com.example.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "user")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String mobile;
    private String username;
    private String password;
    private Set<String> roles;

    

}

