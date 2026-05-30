import os
import requests
import json


GROQ_API_KEYS = [
    os.getenv('GROQ_API_KEY1'),
    os.getenv('GROQ_API_KEY2'),
    os.getenv('GROQ_API_KEY3'),
]

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')


def get_ai_build_recommendation(prompt: str, budget: float = None) -> dict:
    budget_text = f"Budget: ${budget}" if budget else "No specific budget"

    system_prompt = """You are a PC building expert. When given a user's requirements, 
you recommend specific PC components. Always respond in JSON format with this exact structure:
{
    "build_name": "Name for this build",
    "description": "Brief description",
    "components": {
        "CPU": "specific CPU model name",
        "GPU": "specific GPU model name",
        "RAM": "specific RAM model name",
        "MOTHERBOARD": "specific motherboard model",
        "STORAGE": "specific storage model",
        "PSU": "specific PSU model",
        "CASE": "specific case model",
        "COOLING": "specific cooling model"
    },
    "estimated_price": 1000,
    "notes": "Any additional notes about this build"
}
Respond ONLY with JSON, no extra text."""

    user_message = f"Build request: {prompt}\n{budget_text}"

    messages = [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_message}
    ]

    response_text = _try_groq(messages, 0)

    try:
        clean = response_text.strip()
        if clean.startswith('```'):
            clean = clean.split('```')[1]
            if clean.startswith('json'):
                clean = clean[4:]
        return json.loads(clean)
    except Exception:
        return {
            'build_name': 'Custom Build',
            'description': prompt,
            'components': {
                'CPU': 'Intel Core i5-13600K',
                'GPU': 'NVIDIA RTX 4060',
                'RAM': 'Corsair Vengeance 16GB DDR5',
                'MOTHERBOARD': 'ASUS PRIME Z790-P',
                'STORAGE': 'Samsung 970 EVO 1TB NVMe',
                'PSU': 'Corsair RM750x 750W',
                'CASE': 'NZXT H510',
                'COOLING': 'Noctua NH-D15'
            },
            'estimated_price': budget or 1000,
            'notes': response_text
        }


def _try_groq(messages: list, key_index: int) -> str:
    if key_index >= len(GROQ_API_KEYS):
        return _try_openrouter(messages)

    api_key = GROQ_API_KEYS[key_index]
    if not api_key:
        return _try_groq(messages, key_index + 1)

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'llama3-8b-8192',
                'messages': messages,
                'max_tokens': 1024,
                'temperature': 0.3,
            },
            timeout=30
        )

        if response.status_code == 429:
            return _try_groq(messages, key_index + 1)

        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']

        return _try_groq(messages, key_index + 1)

    except Exception:
        return _try_groq(messages, key_index + 1)


def _try_openrouter(messages: list) -> str:
    if not OPENROUTER_API_KEY:
        return '{}'
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://apexhub.softclub.win',
            },
            json={
                'model': 'deepseek/deepseek-chat',
                'messages': messages,
                'max_tokens': 1024,
            },
            timeout=30
        )
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        return '{}'
    except Exception:
        return '{}'