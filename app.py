from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def get_notes():
    conn = sqlite3.connect('notes.db')
    c = conn.cursor()
    c.execute("SELECT content, timestamp FROM notes ORDER BY id DESC")
    notes = c.fetchall()
    conn.close()
    return notes

@app.route('/')
def index():
    notes = get_notes()
    return render_template('index.html', notes=notes)
@app.route("/save", methods=["POST"])
def save():
    data = request.get_json()
    note = data.get("note")

    conn = sqlite3.connect("notes.db")
    c = conn.cursor()
    c.execute("INSERT INTO notes (content) VALUES (?)", (note,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "note": note})



if __name__ == '__main__':
    app.run(debug=True)
