from flask import Flask, render_template

app = Flask(__name__)#starts web app

@app.route('/')#when someone visits your homepage this runs
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
