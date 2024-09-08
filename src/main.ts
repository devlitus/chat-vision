import { GenerateResponse, Ollama } from "ollama/browser";

const ollama = new Ollama();
const model = 'llava:13b';

async function init(pathImage: Uint8Array[], prompt: string = 'Describe esta imagen') {
  try {
    showLoadingSpinner();
    const encodedImage = await ollama.encodeImage(pathImage[0]);
    const response = await ollama.generate({
      model,
      prompt,
      images: [encodedImage],
    });
    hideLoadingSpinner();
    displayResult(response);
  } catch (error) {
    hideLoadingSpinner();
    console.error("Error generating image:", error);
  }
}

function showLoadingSpinner() {
  const chatDiv = getChatDiv();
  if (chatDiv) {
    const spinner = createSpinner();
    chatDiv.appendChild(spinner);
    scrollToBottom(chatDiv);
  }
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.remove();
  }
}

function displayResult(response: GenerateResponse) {
  const chatDiv = getChatDiv();
  if (chatDiv) {
    const messageDiv = createMessageDiv('bot', response.response);
    chatDiv.appendChild(messageDiv);
    scrollToBottom(chatDiv);
  }
}

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input && input.files && input.files[0]) {
    const file = input.files[0];
    const imageUrl = URL.createObjectURL(file);
    const chatDiv = getChatDiv();
    if (chatDiv) {
      const imgElement = createImageElement(imageUrl);
      chatDiv.appendChild(imgElement);
      scrollToBottom(chatDiv);
    }
  }
}

function handleSendButtonClick(event: Event) {
  event.preventDefault();
  const input = document.getElementById('imageInput') as HTMLInputElement;
  const chatInput = document.getElementById('chatInput') as HTMLInputElement;
  const prompt = chatInput.value;
  if (input && input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      if (e.target && e.target.result) {
        const arrayBuffer = e.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        init([uint8Array], prompt);
        chatInput.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

function getChatDiv(): HTMLElement | null {
  return document.getElementById('chatMessages');
}

function createSpinner(): HTMLElement {
  const spinner = document.createElement('div');
  spinner.id = 'loadingSpinner';
  spinner.classList.add('spinner');
  spinner.innerHTML = '<div class="loader"></div>';
  return spinner;
}

function createMessageDiv(sender: string, text: string): HTMLElement {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.innerText = text;
  return messageDiv;
}

function createImageElement(src: string): HTMLImageElement {
  const imgElement = document.createElement('img');
  imgElement.src = src;
  imgElement.style.maxWidth = '50%';
  imgElement.style.height = 'auto';
  imgElement.style.marginBottom = '15px';
  return imgElement;
}

function scrollToBottom(element: HTMLElement) {
  element.scrollTop = element.scrollHeight;
}

document.getElementById('imageInput')?.addEventListener('change', handleImageChange);
document.getElementById('sendButton')?.addEventListener('click', handleSendButtonClick);