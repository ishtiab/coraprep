Drop your JSON content files here for manual editing and backup.

Accepted content structures (for the upload page /content-upload):

## Unit files (unit*.json)
- **Nested structure** (like Unit1.json):
  ```json
  {
    "Unit Title": {
      "Topic": {
        "Question": "What is it?",
        "Answer": "Answer here",
        "Subtopic": {
          "Question": "Sub Q?",
          "Answer": "Sub A."
        }
      }
    }
  }
  ```
- **Array structure**:
  ```json
  [
    {
      "id": "unit1",
      "title": "Unit 1",
      "children": [
        { "id": "f1", "question": "Q?", "answer": "A." }
      ]
    }
  ]
  ```

## Vocab files (vocab*.json)
```json
[
  {
    "id": "v1",
    "term": "Neuron",
    "short": "Nerve cell",
    "definition": "A cell that transmits nerve impulses.",
    "category": "Cell Biology",
    "mastery": 80,
    "level": "mastered"
  }
]
```

## Exam files (exam*.json)
```json
[
  {
    "id": "q1",
    "question": "Which cell?",
    "choices": ["A", "B", "C", "D"],
    "answer": "B",
    "topic": "glia"
  }
]
```

When ready, upload through the UI at /content-upload to apply this data in-app.
