// ==UserScript==
// @name         Edge Ghost
// @namespace    https://github.com/jason9294
// @version      0.1.0
// @description  A simple userscript that allows you to chat with ChatGPT using OpenAI's API
// @match        *://*/*
// @connect     api.openai.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  // ChatGPT API Key
  const apiKey = "<your api key>";

  function createChatButton() {
    const chatButton = document.createElement("div");
    chatButton.style.position = "fixed";
    chatButton.style.right = "20px";
    chatButton.style.bottom = "20px";
    chatButton.style.width = "50px";
    chatButton.style.height = "50px";
    chatButton.style.background = "#007bff";
    chatButton.style.borderRadius = "50%";
    chatButton.style.color = "#fff";
    chatButton.style.display = "flex";
    chatButton.style.justifyContent = "center";
    chatButton.style.alignItems = "center";
    chatButton.style.cursor = "pointer";
    chatButton.style.zIndex = "9999";
    chatButton.style.opacity = "0";
    chatButton.innerText = "💬";
    return chatButton;
  }

  function createChatBox() {
    const chatBox = document.createElement("div");
    chatBox.style.position = "fixed";
    chatBox.style.right = "20px";
    chatBox.style.bottom = "20px";
    chatBox.style.width = "300px";
    chatBox.style.padding = "10px";
    chatBox.style.background = "#f1f1f1";
    chatBox.style.borderRadius = "5px";
    chatBox.style.display = "none";
    chatBox.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.1)";
    chatBox.style.zIndex = "10000";
    return chatBox;
  }

  function createChatInput() {
    const chatInput = document.createElement("textarea");
    chatInput.style.width = "100%";
    chatInput.style.height = "60px";
    chatInput.style.marginBottom = "10px";
    chatInput.style.resize = "none"; // Disable resizing
    return chatInput;
  }

  function createSendButton() {
    const sendButton = document.createElement("button");
    sendButton.innerText = "Send";
    sendButton.style.width = "100%";
    return sendButton;
  }

  const chatButton = createChatButton();
  document.body.appendChild(chatButton);

  const chatBox = createChatBox();
  document.body.appendChild(chatBox);

  const chatInput = createChatInput();
  chatBox.appendChild(chatInput);

  const sendButton = createSendButton();
  chatBox.appendChild(sendButton);

  const responseContainer = document.createElement("div");
  responseContainer.style.marginTop = "10px";
  responseContainer.style.color = "#333";
  chatBox.appendChild(responseContainer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "c" || event.key === "C") {
      if (chatBox.style.display === "none") {
        chatBox.style.display = "block";
      } else {
        chatBox.style.display = "none";
      }
    }
  });

  // 當滑鼠移動到按鈕上方時，顯示聊天對話框
  chatButton.addEventListener("mouseenter", () => {
    chatBox.style.display = "block";
  });

  // 當滑鼠移出聊天區域時，隱藏聊天對話框
  chatBox.addEventListener("mouseleave", () => {
    chatBox.style.display = "none";
  });

  // 發送請求到 ChatGPT API
  function sendMessageToChatGPT(message) {
    GM_xmlhttpRequest({
      method: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "請你扮演一名資料科學專家來回答以下的問題，不需多餘的解釋，直接告訴我答案代號，或是答案內容即可。",
          },
          { role: "user", content: message },
        ],
      }),
      onload: function (response) {
        const data = JSON.parse(response.responseText);
        responseContainer.innerText = data.choices[0].message.content;
      },
      onerror: function () {
        responseContainer.innerText = "Error: Unable to connect to ChatGPT API";
      },
    });
  }

  // 點擊送出按鈕時，將輸入的訊息發送到 ChatGPT
  sendButton.addEventListener("click", () => {
    const message = chatInput.value;
    if (message.trim()) {
      responseContainer.innerText = "Loading...";
      sendMessageToChatGPT(message);
      chatInput.value = "";
    }
  });

  // * select text and click the button to chat
  const askButton = document.createElement("button");
  askButton.innerText = "Ask";
  askButton.style.position = "absolute";
  askButton.style.display = "none"; // Hide initially
  askButton.style.zIndex = "1000";
  askButton.style.padding = "5px";
  askButton.style.fontSize = "14px";

  // Append button to the document
  document.body.appendChild(askButton);

  let selectionText = ""; // Temporary variable to store selected text
  let selectionTimeout;

  // Event listener for text selection with delay
  document.addEventListener("mouseup", (e) => {
    // Clear previous timeout if any
    clearTimeout(selectionTimeout);

    // Set a delay before checking the selection
    selectionTimeout = setTimeout(() => {
      const selection = window.getSelection().toString().trim();
      if (selection) {
        // Store selected text
        selectionText = selection;

        // Position the button above the selected text
        askButton.style.top = `${e.pageY - 30}px`;
        askButton.style.left = `${e.pageX}px`;
        askButton.style.display = "block";

        // Set up the button click event to log the selection
        askButton.onclick = () => {
          chatInput.value = selectionText;
          responseContainer.innerText = "Loading...";
          sendMessageToChatGPT(selectionText);
          chatBox.style.display = "block";
          askButton.style.display = "none"; // Hide the button after logging
        };
      } else {
        askButton.style.display = "none"; // Hide if no text is selected
      }
    }, 200); // 200ms delay
  });

  // Hide the button if clicking elsewhere, but keep it if clicking on the button itself
  document.addEventListener("mousedown", (e) => {
    clearTimeout(selectionTimeout);
    if (e.target !== askButton) {
      // Check if the click is outside the button
      askButton.style.display = "none";
    }
  });
})();
