
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
socketio = SocketIO(app)

# Store connected users. Key is socket id, value is username and avatarurl
users = {}

@app.route('/')
def index():
    return render_template('index.html')

# Handle user connection
@socketio.on("connect")
def handle_connect():
    # Assign a random default username
    username = f"User_{random.randint(1000, 9999)}"
    # Default gender (in case not selected)
    gender = "boy"
    avatar_url = f"https://avatar.iran.liara.run/public/{gender}?username={username}"

    # Store the user info in the users dictionary
    users[request.sid] = {"username": username, "avatar": avatar_url}

    # Notify all users of the new user
    emit("user_joined", {"username": username, "avatar": avatar_url}, broadcast=True)
    
    # Set the username for the connected user
    emit("set_username", {"username": username})

# Handle user disconnection
@socketio.on("disconnect")
def handle_disconnect():
    user = users.pop(request.sid, None)
    if user:
        emit("user_left", {"username": user["username"]}, broadcast=True)

# Handle new chat messages
@socketio.on("send_message")
def handle_message(data):
    user = users.get(request.sid)
    if user:
        emit("new message", {
            "username": user["username"],
            "avatar": user["avatar"],
            "message": data["message"]
        }, broadcast=True)

# Handle updating username and avatar
@socketio.on("update_username")
def handle_update_username(data):
    old_username = users[request.sid]["username"]
    new_username = data["username"]
    gender = data.get("avatar", "boy")  # Get the selected gender, default to "boy"

    # Update username and avatar URL
    avatar_url = f"https://avatar.iran.liara.run/public/{gender}?username={new_username}"
    users[request.sid] = {"username": new_username, "avatar": avatar_url}

    # Broadcast the username change
    emit("username_updated", {
        "old_username": old_username,
        "new_username": new_username
    }, broadcast=True)

if __name__ == "__main__":
    socketio.run(app)
