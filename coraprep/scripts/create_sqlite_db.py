import sqlite3, json, os, re
from pathlib import Path

DB='cora_prep.db'
if os.path.exists(DB):
    os.remove(DB)
conn=sqlite3.connect(DB)
c=conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, name TEXT, email TEXT, dateOfBirth TEXT, provider TEXT, createdAt TEXT, authToken TEXT, lastLogin TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS Stats (id TEXT PRIMARY KEY, userId TEXT, flashcardsReviewed INTEGER, flashcardsMastered INTEGER, flashcardsAttempted INTEGER, streak INTEGER, accuracy INTEGER, avgTime INTEGER, mastery INTEGER, xp INTEGER, consistency TEXT, lastPractice TEXT, FOREIGN KEY(userId) REFERENCES User(id))''')
c.execute('''CREATE TABLE IF NOT EXISTS Settings (id TEXT PRIMARY KEY, userId TEXT, dailyGoal INTEGER, spacedRepetition INTEGER, darkMode INTEGER, accentColor TEXT, reminderTime TEXT, FOREIGN KEY(userId) REFERENCES User(id))''')
c.execute('''CREATE TABLE IF NOT EXISTS ContentUnit (unitId TEXT PRIMARY KEY, title TEXT, description TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS Flashcard (cardId TEXT PRIMARY KEY, unitId TEXT, question TEXT, answer TEXT, parentId TEXT, level INTEGER, FOREIGN KEY(unitId) REFERENCES ContentUnit(unitId))''')
c.execute('''CREATE TABLE IF NOT EXISTS RatingRecord (id TEXT PRIMARY KEY, userId TEXT, cardId TEXT, rating TEXT, scoreValue INTEGER, updatedAt TEXT, FOREIGN KEY(userId) REFERENCES User(id), FOREIGN KEY(cardId) REFERENCES Flashcard(cardId))''')
c.execute('''CREATE TABLE IF NOT EXISTS VocabItem (vocabId TEXT PRIMARY KEY, term TEXT, pronunciation TEXT, short TEXT, definition TEXT, context TEXT, category TEXT, mastery INTEGER, level TEXT, isAnatomy INTEGER, imagePath TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS ExamItem (examId TEXT PRIMARY KEY, question TEXT, choices TEXT, answer TEXT, topic TEXT)''')

c.execute("INSERT INTO User VALUES ('u1','Abhinav','abhinav@example.com','2006-03-18','email','2026-03-30T10:00:00Z','token123','2026-03-30T12:00:00Z')")
c.execute("INSERT INTO Stats VALUES ('s1','u1',150,80,150,5,53,12,53,420,'[20,15,25,30,40,10,20]','2026-03-30T12:00:00Z')")
c.execute("INSERT INTO Settings VALUES ('set1','u1',30,1,0,'#1E63B5','18:00')")

vocab_path = Path('data/vocab.ts')
if vocab_path.exists():
    text = vocab_path.read_text()
    obj_text = re.sub(r"export const vocab =", "", text, 1).strip()
    obj_text = obj_text.rstrip(';\n ')
    obj_text = obj_text.replace("'", '"')
    obj_text = re.sub(r'\bTrue\b', 'true', obj_text)
    obj_text = re.sub(r'\bFalse\b', 'false', obj_text)
    data = json.loads(obj_text)
    for v in data:
        c.execute('INSERT INTO VocabItem VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                  (v.get('id'), v.get('term'), v.get('pronunciation'), v.get('short'), v.get('definition'), v.get('context'), v.get('category'), v.get('mastery'), v.get('level'), 1 if v.get('isAnatomy') else 0, v.get('imagePath')))

exams_path = Path('data/exams.ts')
if exams_path.exists():
    text = exams_path.read_text()
    obj_text = re.sub(r"export const exams =", "", text, 1).strip()
    obj_text = obj_text.rstrip(';\n ')
    obj_text = obj_text.replace("'", '"')
    data = json.loads(obj_text)
    for e in data:
        c.execute('INSERT INTO ExamItem VALUES (?,?,?,?,?)', (e.get('id'), e.get('question'), json.dumps(e.get('choices')), e.get('answer'), e.get('topic')))

unitFiles = sorted(Path('app/content-files').glob('Unit*.json'))
card_counter = 1
for file in unitFiles:
    raw = json.loads(file.read_text())
    for unitTitle, content in raw.items():
        unitId = unitTitle.lower().replace(' ', '_').replace(':', '').replace('-', '_')
        c.execute('INSERT OR IGNORE INTO ContentUnit VALUES (?,?,?)', (unitId, unitTitle, content.get('description', '')))

        def rec(node, parentId=None, level=1):
            global card_counter
            if isinstance(node, dict):
                if 'Question' in node and 'Answer' in node:
                    cardId = f'f{card_counter}'
                    card_counter += 1
                    c.execute('INSERT INTO Flashcard VALUES (?,?,?,?,?,?)', (cardId, unitId, node['Question'], node['Answer'], parentId, level))
                    current_parent = cardId
                else:
                    current_parent = parentId
                for key, value in node.items():
                    if key in ('Question', 'Answer'):
                        continue
                    if isinstance(value, dict):
                        rec(value, current_parent, level + 1)
                    elif isinstance(value, list):
                        for item in value:
                            rec(item, current_parent, level + 1)
            elif isinstance(node, list):
                for item in node:
                    rec(item, parentId, level)

        rec(content, None, 1)

c.execute("INSERT INTO RatingRecord VALUES ('r1','u1','f1','easy',100,'2026-03-30T12:05:00Z')")
conn.commit()
conn.close()
print('sqlite database created at', os.path.abspath(DB))
