package com.saket.cnbank.Models;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.saket.cnbank.Models.Notes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private ObjectId _id;
    private String name;
    private String email;
    private String username;
    private String password;
    private int balance;
    private List<Notes> notes;
}
