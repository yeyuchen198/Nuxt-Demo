<script setup lang="ts">
const input = ref('')
const output = ref('')
const error = ref('')
const loading = ref(false)

async function handleDecode() {
  error.value = ''
  output.value = ''
  loading.value = true

  try {
    const res = await fetch('/api/decode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: input.value })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.statusMessage || data.error || '未知错误'
      return
    }

    output.value = data.decoded
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="container">
    <h1>Base64 Decoder</h1>
    <p class="subtitle">输入 Base64 字符串，解码结果会同时打印到服务端控制台</p>

    <textarea
      v-model="input"
      placeholder="粘贴 Base64 字符串，例如：SGVsbG8gV29ybGQ="
      rows="5"
      spellcheck="false"
    />

    <button :disabled="loading || !input.trim()" @click="handleDecode">
      {{ loading ? '解码中...' : '解码' }}
    </button>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="output" class="result">
      <label>解码结果</label>
      <pre>{{ output }}</pre>
    </div>
  </main>
</template>

<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    background: #0e0e11;
    color: #d4d4d8;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .container {
    width: 100%;
    max-width: 640px;
    padding: 2rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #f4f4f5;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    font-size: 0.8rem;
    color: #71717a;
    margin-bottom: 1.5rem;
  }

  textarea {
    width: 100%;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 8px;
    color: #e4e4e7;
    font-family: inherit;
    font-size: 0.85rem;
    padding: 0.75rem 1rem;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    margin-bottom: 1rem;
  }

  textarea:focus {
    border-color: #22c55e;
  }

  button {
    width: 100%;
    padding: 0.7rem;
    background: #22c55e;
    color: #0e0e11;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
  }

  button:hover:not(:disabled) {
    background: #16a34a;
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .error {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: #2a0a0a;
    border: 1px solid #7f1d1d;
    border-radius: 8px;
    color: #fca5a5;
    font-size: 0.8rem;
    word-break: break-all;
  }

  .result {
    margin-top: 1rem;
  }

  .result label {
    display: block;
    font-size: 0.75rem;
    color: #71717a;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .result pre {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    white-space: pre-wrap;
    word-break: break-all;
    color: #4ade80;
  }
</style>
