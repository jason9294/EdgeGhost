// ==UserScript==
// @name         Edge Ghost
// @namespace    https://github.com/jason9294
// @version      0.2.2
// @description  A simple userscript that allows you to chat with ChatGPT using OpenAI's API
// @match        *://*/*
// @connect     api.openai.com
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  // ChatGPT API Key
  const apiKey = getApiKey();

  let selectedText = "";

  function getApiKey() {
    let apiKey = GM_getValue("api_key", null);
    if (!apiKey) {
      apiKey = prompt("請輸入 API Key：");
      if (apiKey) {
        GM_setValue("api_key", apiKey);
        alert("API Key 已儲存！");
      } else {
        alert("未輸入 API Key。請重新載入頁面並輸入 API Key。");
      }
    }
    return apiKey;
  }

  function setApiKey() {
    const newApiKey = prompt("請輸入 API Key：");
    if (newApiKey) {
      GM_setValue("api_key", newApiKey);
      alert("API Key 已更新！");
    } else {
      alert("未輸入新的 API Key，維持現有設定。");
    }
  }

  GM_registerMenuCommand("設定 API Key", setApiKey);

  /**
   * 隱藏在右下角中的按鈕，滑鼠移動到上方時，顯示聊天對話框
   * @returns {HTMLDivElement} A button element to chat with ChatGPT
   */
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

    // 當滑鼠移動到按鈕上方時，顯示聊天對話框
    chatButton.addEventListener("mouseenter", () => {
      chatBox.style.display = "block";
    });

    return chatButton;
  }

  /**
   * 在右下角顯示的聊天對話框
   * @returns {HTMLDivElement} A chat box element to chat with ChatGPT
   */
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

    // 當滑鼠移出聊天區域時，隱藏聊天對話框
    chatBox.addEventListener("mouseleave", () => {
      chatBox.style.display = "none";
    });

    return chatBox;
  }

  /**
   * 聊天對話框中的文字輸入框
   * @returns {HTMLTextAreaElement} A text area element to input chat messages
   */
  function createChatInput() {
    const chatInput = document.createElement("textarea");
    chatInput.style.width = "100%";
    chatInput.style.height = "60px";
    chatInput.style.marginBottom = "10px";
    chatInput.style.resize = "none"; // Disable resizing
    return chatInput;
  }

  /**
   * 聊天對話框中的發送按鈕
   * @returns {HTMLButtonElement} A button element to send chat messages
   */
  function createSendButton() {
    const sendButton = document.createElement("button");
    sendButton.innerText = "Send";
    sendButton.style.width = "100%";
    return sendButton;
  }

  /**
   * 聊天對話框中顯示回應的容器
   * @returns {HTMLDivElement} A div element to display responses from ChatGPT
   */
  function createResponseContainer() {
    const responseContainer = document.createElement("div");
    responseContainer.style.marginTop = "10px";
    responseContainer.style.color = "#333";
    return responseContainer;
  }

  function createAskButton() {
    const askButton = document.createElement("button");
    askButton.innerText = "Ask";
    askButton.style.position = "absolute";
    askButton.style.display = "none"; // Hide initially
    askButton.style.zIndex = "1000";
    askButton.style.padding = "5px";
    askButton.style.fontSize = "14px";
    return askButton;
  }


  // 創建 UI 元素
  const chatButton = createChatButton();
  document.body.appendChild(chatButton);

  const chatBox = createChatBox();
  document.body.appendChild(chatBox);

  const chatInput = createChatInput();
  chatBox.appendChild(chatInput);

  const sendButton = createSendButton();
  chatBox.appendChild(sendButton);

  const responseContainer = createResponseContainer();
  chatBox.appendChild(responseContainer);

  // alt + c to toggle chat box visibility
  document.addEventListener("keydown", (event) => {
    if (event.altKey && event.key === "c") {
      chatBox.style.display = chatBox.style.display === "block" ? "none" : "block";
    }
  });

  // 發送請求到 ChatGPT API
  function sendToGPT(message) {
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
  sendButton.onclick = () => {
    const message = chatInput.value;
    console.log(`Sending message: ${message}`);
    if (message.trim()) {
      responseContainer.innerText = "Loading...";
      sendToGPT(message);
      chatInput.value = ""; // Clear the input after sending
    }
  }

  // * select text and click the button to chat
  const askButton = createAskButton();
  document.body.appendChild(askButton);

  askButton.onclick = () => {
    console.log(`asking: ${selectedText}`);
    chatBox.style.display = "block";
    chatInput.value = selectedText;
    askButton.style.display = "none";
    sendButton.onclick();
  };


  document.addEventListener("mouseup", (e) => {
    if (e.target !== askButton) {
      selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        askButton.style.top = `${e.pageY + 10}px`;
        askButton.style.left = `${e.pageX + 10}px`;
        askButton.style.display = "block";
      } else {
        askButton.style.display = "none"; // Hide if no text is selected
      }
    }
  });

  // 攔截 request
  let subjects = [];

  // 儲存原始的 XMLHttpRequest 的 open 和 send 方法
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  // 覆寫 XMLHttpRequest 的 open 方法
  XMLHttpRequest.prototype.open = function (method, url) {
    // 檢查是否為目標API的請求
    if (url.includes('/api/exams') && url.includes('/distribute')) {
      this.isTargetRequest = true;
    }
    if (this.isTargetRequest) console.log('目標請求:', this.targetType, url); // 在控制台中顯示目標請求
    return originalXhrOpen.apply(this, arguments); // 呼叫原始的 open 方法
  };

  // 覆寫 XMLHttpRequest 的 send 方法
  XMLHttpRequest.prototype.send = function () {
    if (this.isTargetRequest) { // 若是目標API請求
      this.addEventListener('readystatechange', function () {
        if (this.readyState === 4 && this.status === 200) {
          try {
            let response = JSON.parse(this.responseText);
            subjects = response.subjects;
          } catch (error) {
            console.error('Error parsing response:', error);
          }
        }
      });
    }
    return originalXhrSend.apply(this, arguments);
  };

  // alt + a
  document.addEventListener("keydown", (event) => {
    if (event.altKey && event.key === "a") {
      if (subjects.length === 0) return;
      alert('start');

      const subjectsElement = document.querySelectorAll(".subject");

      subjects.forEach((subject, index) => {
        // TODO
      });
    }
  });

  // const subjects = document.querySelectorAll(".subject")
  // alert(subjects.length);
})();