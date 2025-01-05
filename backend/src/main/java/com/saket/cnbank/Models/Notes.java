package com.saket.cnbank.Models;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "notes")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Notes {

    @Id
    private ObjectId _id;
    private String id;
    private String userId;
    private String title;
    private String content;
    private String createdAt;
    private String updatedAt;
}
