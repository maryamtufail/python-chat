const socket = io();
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const currentUsernameSpan = document.getElementById("current-username");
const usernameInput = document.getElementById("username-input");
const updateUsernameButton = document.getElementById("update-username-button");
const girlRadio = document.getElementById("radio1"); // Radio button for 'girl'
const boyRadio = document.getElementById("radio2");  // Radio button for 'boy'

let currentUsername = "";

socket.on("set_username", (data) => {
  currentUsername = data.username;
  currentUsernameSpan.textContent = `Your username: ${currentUsername}`;
});

socket.on("user_joined", (data) => {
  addMessage(`${data.username} joined the chat`, "system");
});

socket.on("user_left", (data) => {
  addMessage(`${data.username} left the chat`, "system");
});

socket.on("new message", (data) => {
  addMessage(data.message, "user", data.username, data.avatar);
});

socket.on("username_updated", (data) => {
  addMessage(
    `${data.old_username} changed their name to ${data.new_username}`,
    "system"
  );

  if (data.old_username === currentUsername) {
    currentUsername = data.new_username;
    currentUsernameSpan.textContent = `Your username: ${currentUsername}`;
  }
});

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.code === "Enter") sendMessage();
});

updateUsernameButton.addEventListener("click", updateUsername);

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("send_message", { message });
    messageInput.value = "";
  }
}


function updateUsername() {
  const newUsername = usernameInput.value.trim();
  let selectedAvatar = "boy"; // Default avatar

  // Check which radio button is selected
  if (girlRadio.checked) {
    selectedAvatar = "girl";
  } else if (boyRadio.checked) {
    selectedAvatar = "boy";
  }

  // Send the updated username and selected avatar if changed
  if (newUsername && newUsername !== currentUsername) {
    socket.emit("update_username", {
      username: newUsername,
      avatar: selectedAvatar  // Send the selected avatar to the server
    });
    usernameInput.value = "";
  }
}

function addMessage(message, type, username = "", avatar = "") {
  const messageElement = document.createElement("div");
  messageElement.className = "message";

  if (type === "user") {
    const isSentMessage = username === currentUsername;
    if (isSentMessage) {
      messageElement.classList.add("sent");
    }

    const avatarImg = document.createElement("img");
    avatarImg.src = avatar;
    messageElement.appendChild(avatarImg);

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const usernameDiv = document.createElement("div");
    usernameDiv.className = "message-username";
    usernameDiv.textContent = username;
    contentDiv.appendChild(usernameDiv);

    const messageText = document.createElement("div");
    messageText.textContent = message;
    contentDiv.appendChild(messageText);

    messageElement.appendChild(contentDiv);
  } else {
    messageElement.className = "system-message";
    messageElement.textContent = message;
  }
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
