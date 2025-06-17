from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

notes = []  # temporary in-memory list

@app.route("/")
def index():
    return render_template("index.html", notes=notes)

@app.route("/save", methods=["POST"])
def save_note():
    data = request.get_json()
    note = data.get("note", "")
    if note:
        notes.append(note)
        return jsonify({"success": True, "note": note}), 200
    return jsonify({"success": False}), 400

if __name__ == "__main__":
    app.run(debug=True)
