package com.saket.cnbank.Services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.saket.cnbank.Models.Notes;
import com.saket.cnbank.Repositories.NotesRepository;

@Service
public class NotesService {
    @Autowired
    private NotesRepository notesRepository;

    @Value("${openai.api.key}")
    private String openAiApiKey;
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    public Notes createNote(Notes note) {
        note.setCreatedAt(java.time.LocalDateTime.now().toString());
        note.setUpdatedAt(java.time.LocalDateTime.now().toString());
        return notesRepository.save(note);
    }

    public List<Notes> getNotesByUserId(String userId) {
        return notesRepository.findByUserId(userId);
    }

    public Notes getNoteByTitle(String title) {
        return notesRepository.findByTitle(title);
    }

    public List<Notes> searchNotes(String query, String userId) {
        List<Notes> notes = notesRepository.findByUserId(userId);
        return notes.stream()
                .filter(note -> note.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                               note.getContent().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }

    public void deleteNote(String id) {
        notesRepository.deleteById(new ObjectId(id));
    }

    public Notes updateNote(String id, Notes note) {
        note.setUpdatedAt(java.time.LocalDateTime.now().toString());
        return notesRepository.save(note);
    }

    public Notes getNoteById(String id) {
        return notesRepository.findById(id);
    }

    public String getChatCompletion(String userInput, String prompt) {
        RestTemplate restTemplate = new RestTemplate();

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", "Bearer " + openAiApiKey);

        // Build the request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini");
        requestBody.put("messages", new Object[]{
                Map.of("role", "system", "content", prompt),
                Map.of("role", "user", "content", userInput)
        });

        // Create the request
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // Send the request
        ResponseEntity<Map> responseEntity = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                requestEntity,
                Map.class
        );

        // Extract the completion from the response
        Map responseBody = responseEntity.getBody();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
        Map<String, Object> firstChoice = choices.get(0);
        Map<String, String> message = (Map<String, String>) firstChoice.get("message");
        return message.get("content");
    }
}
