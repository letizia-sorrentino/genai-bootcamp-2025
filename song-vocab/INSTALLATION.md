# Installation Guide

## Ollama Installation

### 1. Install Ollama using Homebrew
```bash
brew install ollama
```

### 2. Start Ollama Service
You can start Ollama in two ways:

#### Option 1: Start as a background service (recommended)
```bash
brew services start ollama
```
This will start Ollama now and automatically restart it at login.

#### Option 2: Run directly without background service
```bash
/opt/homebrew/opt/ollama/bin/ollama serve
```

### 3. Installation Details
- Version: 0.6.2
- Location: `/opt/homebrew/Cellar/ollama/0.6.2`
- Size: 26.2MB

### 4. Next Steps
1. Pull the required Mistral 7B model:
```bash
ollama pull mistral:7b
```

2. Verify installation:
```bash
ollama --version
```

### Notes
- The installation includes automatic cleanup of old versions
- To disable automatic cleanup, set `HOMEBREW_NO_INSTALL_CLEANUP`
- The service runs on the default port (11434) 