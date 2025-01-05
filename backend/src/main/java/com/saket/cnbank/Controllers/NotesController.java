package com.saket.cnbank.Controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saket.cnbank.Models.Notes;
import com.saket.cnbank.Services.NotesService;
import com.saket.cnbank.Services.UserService;
import com.saket.cnbank.Utils.Diff;
import com.saket.cnbank.Utils.Diff.Tuple;
import com.saket.cnbank.Utils.Prompts;

import jakarta.servlet.http.HttpServletRequest;

@RestController()
@RequestMapping("/notes")
public class NotesController {
    @Autowired
    private NotesService notesService;

    @Autowired
    private UserService userService;

    private String getAuthenticatedUserId(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        return userService.getUserByUsername(username).get_id().toString();
    }

    @CrossOrigin(origins = "*")
    @GetMapping("")
    public Map<String, Object> getAllNotes(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = getAuthenticatedUserId(request);
            response.put("notes", notesService.getNotesByUserId(userId).stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).toList());
            response.put("success", true);
        } catch (Exception e) {
            System.out.println("Errorxxx: "+e.getMessage());
            response.put("success", false);
            response.put("error", "Failed to fetch notes: " + e.getMessage());
        }
        System.out.println(response.get("notes"));
        return response;
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/search")
    public Map<String, Object> searchNotes(@RequestParam String q, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = getAuthenticatedUserId(request);
            response.put("notes", notesService.searchNotes(q, userId));
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to search notes: " + e.getMessage());
        }
        return response;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/create")
    public Map<String, Object> createNote(@RequestBody Notes note, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            note.setId(UUID.randomUUID().toString());
            note.setUserId(getAuthenticatedUserId(request));
            response.put("note", notesService.createNote(note));
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to create note: " + e.getMessage());
        }
        return response;
    }

    @CrossOrigin(origins = "*")
    @PutMapping("/update/{id}")
    public Map<String, Object> updateNote(@PathVariable String id, @RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = getAuthenticatedUserId(httpRequest);
            Notes existingNote = notesService.getNoteById(id);
            if (existingNote != null && existingNote.getUserId().equals(userId)) {
                if (request.containsKey("title")) {
                    existingNote.setTitle(request.get("title").toString());
                }
                if (request.containsKey("content")) {
                    existingNote.setContent(request.get("content").toString());
                }
                response.put("note", notesService.updateNote(id, existingNote));
                response.put("success", true);
            } else {
                response.put("success", false);
                response.put("error", "Note not found or unauthorized");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to update note: " + e.getMessage());
        }
        return response;
    }

    @CrossOrigin(origins = "*")
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteNote(@PathVariable String id, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = getAuthenticatedUserId(request);
            Notes note = notesService.getNoteById(id);
            if (note != null && note.getUserId().equals(userId)) {
                notesService.deleteNote(note.get_id().toString());
                response.put("success", true);
            } else {
                response.put("success", false);
                response.put("error", "Note not found or unauthorized");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to delete note: " + e.getMessage());
        }
        return response;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/autocomplete")
    public Map<String, Object> autoComplete(@RequestBody Map<String, Object> request) {
        Map<String, Object> responseMap = new HashMap<>();
        try {
            String userInput = request.get("input").toString();
            Boolean needTitle = (Boolean) request.get("needTitle");
            String response = notesService.getChatCompletion(userInput, Prompts.autoCompletePrompt);
            String title = "";
            if (needTitle) {
                title = notesService.getChatCompletion(userInput, Prompts.getNotesTitlePrompt);
            }
            if (title.isEmpty()) {
                title = "Untitled Note";
            }
            responseMap.put("response", response);
            responseMap.put("success", true);
            if (needTitle) {
                responseMap.put("title", title);
            }
        } catch (Exception e) {
            responseMap.put("success", false);
            responseMap.put("error", "Failed to auto-complete: " + e.getMessage());
        }
        return responseMap;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/fix-facts-and-errors")
    public Map<String, Object> fixFactsAndErrors(@RequestBody Map<String, Object> request) {
        Map<String, Object> responseMap = new HashMap<>();
        try {
            String userInput = request.get("input").toString();
            Boolean needTitle = (Boolean) request.get("needTitle");
            String response = notesService.getChatCompletion(userInput, Prompts.fixFactsAndErrorsPrompt);
            String title = "";
            if (needTitle) {
                title = notesService.getChatCompletion(userInput, Prompts.getNotesTitlePrompt);
            }
            if (title.isEmpty()) {
                title = "Untitled Note";
            }
            responseMap.put("response", response);
            responseMap.put("success", true);
            if (needTitle) {
                responseMap.put("title", title);
            }
        } catch (Exception e) {
            responseMap.put("success", false);
            responseMap.put("error", "Failed to fix facts and errors: " + e.getMessage());
        }
        return responseMap;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/generate-notes")
    public Map<String, Object> generateNotes(@RequestBody Map<String, Object> request) {
        Map<String, Object> responseMap = new HashMap<>();
        try {
            String prompt = request.get("prompt").toString();
            String previousText = request.get("input").toString();
            String userInput = "Prompt: " + prompt + "\n" + "Previous text: " + previousText;
            Boolean needTitle = (Boolean) request.get("needTitle");
            String response = notesService.getChatCompletion(userInput, Prompts.generateNotesPrompt);
            String title = "";
            if (needTitle) {
                title = notesService.getChatCompletion(userInput, Prompts.getNotesTitlePrompt);
            }
            if (title.isEmpty()) {
                title = "Untitled Note";
            }
            responseMap.put("response", response);
            responseMap.put("success", true);
            if (needTitle) {
                responseMap.put("title", title);
            }
        } catch (Exception e) {
            responseMap.put("success", false);
            responseMap.put("error", "Failed to generate notes: " + e.getMessage());
        }
        return responseMap;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/diff")
    public Map<String, Object> diffNotes(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String text1 = request.get("text1").toString();
            String text2 = request.get("text2").toString();
            List<Tuple> diffs = Diff.diff(text1, text2, null, true);
            response.put("diffs", diffs);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to generate diff: " + e.getMessage());
        }
        return response;
    }
}
