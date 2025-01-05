package com.saket.cnbank.Repositories;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.saket.cnbank.Models.Notes;

@Repository
public interface NotesRepository extends MongoRepository<Notes, ObjectId> {
    Notes findByTitle(String title);
    List<Notes> findByUserId(String userId);
    Notes findById(String id);   
}
