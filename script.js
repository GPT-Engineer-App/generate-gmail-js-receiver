const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

let authorizeButton = document.getElementById("authorize_button");
let signoutButton = document.getElementById("signout_button");
let content = document.getElementById("content");

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      () => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      (error) => {
        appendPre(JSON.stringify(error, null, 2));
      },
    );
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    listMessages();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function appendPre(message) {
  let textContent = document.createTextNode(message + "\n");
  content.appendChild(textContent);
}

function listMessages() {
  gapi.client.gmail.users.messages
    .list({
      userId: "me",
      maxResults: 10,
    })
    .then((response) => {
      let messages = response.result.messages;
      if (messages && messages.length > 0) {
        for (let i = 0; i < messages.length; i++) {
          let message = messages[i];
          getMessage(message.id);
        }
      } else {
        appendPre("No messages found.");
      }
    });
}

function getMessage(messageId) {
  gapi.client.gmail.users.messages
    .get({
      userId: "me",
      id: messageId,
    })
    .then((response) => {
      appendPre(`Message ID: ${response.result.id}`);
      appendPre(`Snippet: ${response.result.snippet}`);
    });
}

handleClientLoad();
