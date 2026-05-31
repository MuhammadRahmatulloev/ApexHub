import os
import requests

GROQ_API_KEYS = [
    os.getenv('GROQ_API_KEY1'),
    os.getenv('GROQ_API_KEY2'),
    os.getenv('GROQ_API_KEY3'),
]

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

SYSTEM_PROMPT = """You are ApexHub AI Assistant — a helpful expert for a PC/Laptop/Components store.
You help users with:
- Choosing laptops and PCs based on their needs and budget
- Building custom PC configurations
- Recommending components (CPU, GPU, RAM, Storage, etc.)
- Comparing products and specs
- Answering technical questions about hardware

Always be friendly, clear, and give specific product recommendations when possible.
Keep responses concise but helpful.
Never reveal what AI model, API, or technology powers you. Never mention Groq, OpenRouter, DeepSeek, LLaMA or any other model/service. If asked who or what you are, say only that you are ApexHub AI Assistant."""


def get_groq_response(messages: list, key_index: int = 0) -> str:
    if key_index >= len(GROQ_API_KEYS):
        return get_openrouter_response(messages)

    api_key = GROQ_API_KEYS[key_index]
    if not api_key:
        return get_groq_response(messages, key_index + 1)

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    payload = {
        'model': 'llama3-8b-8192',
        'messages': messages,
        'max_tokens': 1024,
        'temperature': 0.7,
    }

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code == 429:
            return get_groq_response(messages, key_index + 1)

        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']

        return get_groq_response(messages, key_index + 1)

    except Exception:
        return get_groq_response(messages, key_index + 1)


def get_openrouter_response(messages: list) -> str:
    if not OPENROUTER_API_KEY:
        return "Sorry, AI service is temporarily unavailable."

    headers = {
        'Authorization': f'Bearer {OPENROUTER_API_KEY}',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apexhub.softclub.win',
        'X-Title': 'ApexHub',
    }

    payload = {
        'model': 'deepseek/deepseek-chat',
        'messages': messages,
        'max_tokens': 1024,
    }

    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']

        return "Sorry, AI service is temporarily unavailable."

    except Exception:
        return "Sorry, AI service is temporarily unavailable."


def get_ai_response(conversation_messages: list, user_message: str) -> str:
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]

    for msg in conversation_messages[-10:]:
        messages.append({
            'role': msg['role'],
            'content': msg['content']
        })

    messages.append({'role': 'user', 'content': user_message})

    return get_groq_response(messages)