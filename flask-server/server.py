from flask import Flask

app = Flask(__name__)

@app.route("/test")
def test():
    return{"test": ["Test1", "Test2"]}

if __name__ == "__main__":
    app.run(debug=True)