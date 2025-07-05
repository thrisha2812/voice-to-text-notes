from flask import Flask, render_template, request, jsonify
from datetime import datetime
# Only run this once to alter the table (or do it via DB browser)
import sqlite3
conn = sqlite3.connect("notes.db")
c = conn.cursor()
#c.execute("ALTER TABLE notes ADD COLUMN title TEXT")#
conn.commit()
conn.close()


app = Flask(__name__)

def get_notes():
    conn = sqlite3.connect("notes.db")
    c = conn.cursor()
    c.execute("SELECT content, timestamp, id, title FROM notes ORDER BY id DESC")
    notes = c.fetchall()
    conn.close()
    return notes


@app.route('/')
def index():
    notes = get_notes()
    return render_template('index.html', notes=notes)

from datetime import datetime

@app.route("/save", methods=["POST"])
def save_note():
    data = request.get_json()
    note = data.get("note", "")
    title = data.get("title", "")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect("notes.db")
    c = conn.cursor()
    c.execute("INSERT INTO notes (content, timestamp, title) VALUES (?, ?, ?)", (note, timestamp, title))
    conn.commit()
    conn.close()

    return jsonify(success=True, note=note, timestamp=timestamp, title=title)



@app.route('/clear', methods=['POST'])
def clear_notes():
    try:
        conn = sqlite3.connect('notes.db')
        c = conn.cursor()
        c.execute("DELETE FROM notes")
        conn.commit()
        conn.close()
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))

@app.route("/update", methods=["POST"])
def update_note():
    data = request.get_json()
    note_id = data.get("id")
    new_content = data.get("content")
    if note_id is None or not new_content:
        return jsonify(success=False)

    conn = sqlite3.connect("notes.db")
    c = conn.cursor()
    c.execute("UPDATE notes SET content = ? WHERE id = ?", (new_content, note_id))
    conn.commit()
    conn.close()
    return jsonify(success=True)

@app.route('/edit', methods=['POST'])
def edit_note():
    data = request.get_json()
    note_id = data['id']
    content = data['content']
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    conn = sqlite3.connect('notes.db')
    c = conn.cursor()
    c.execute("UPDATE notes SET content = ?, timestamp = ? WHERE id = ?", (content, timestamp, note_id))
    conn.commit()
    conn.close()

    return jsonify(success=True, timestamp=timestamp)
@app.route('/delete', methods=['POST'])
def delete_note():
    data = request.get_json()
    note_content = data.get("note")

    conn = sqlite3.connect("notes.db")
    c = conn.cursor()
    c.execute("DELETE FROM notes WHERE content = ?", (note_content,))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)
