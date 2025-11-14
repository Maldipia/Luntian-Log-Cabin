# Anthropic API Demo and Capabilities Guide

This package contains a comprehensive demonstration of the Anthropic Claude API and a detailed capabilities brief.

## Contents

1. **anthropic_api_demo.py** - Executable Python script demonstrating 11 key API features
2. **anthropic_api_capabilities_brief.md** - Comprehensive guide to Claude API capabilities
3. **README.md** - This file with usage instructions

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Anthropic API key (set as `ANTHROPIC_API_KEY` environment variable)

### Installation

```bash
# Install the Anthropic Python SDK
pip install anthropic

# Or with sudo if needed
sudo pip install anthropic
```

### Running the Demo

```bash
# Make the script executable (optional)
chmod +x anthropic_api_demo.py

# Run the demo
python3 anthropic_api_demo.py
```

## Demo Features

The demo script showcases the following capabilities:

1. **Basic Message Creation** - Simple request/response interaction
2. **Multi-turn Conversation** - Maintaining context across multiple exchanges
3. **System Prompt** - Customizing Claude's behavior and personality
4. **Streaming Responses** - Real-time response generation
5. **Vision Capabilities** - Structure for processing images (example code)
6. **Tool Use** - Function calling and external tool integration
7. **Token Counting** - Measuring token usage before sending requests
8. **Async API Usage** - Asynchronous request handling
9. **Temperature Control** - Adjusting response randomness
10. **Max Tokens Control** - Limiting response length
11. **Metadata** - Attaching custom tracking information

## Key Features Demonstrated

### Message Creation
```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Streaming
```python
with client.messages.stream(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Tool Use
```python
tools = [{
    "name": "get_weather",
    "description": "Get weather for a location",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {"type": "string"}
        }
    }
}]

message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather?"}]
)
```

## API Capabilities Overview

### Core Features
- **1M token context window** - Process large documents and maintain long conversations
- **Multimodal understanding** - Analyze images, charts, and diagrams
- **PDF support** - Process documents up to 4.5MB
- **Batch processing** - 50% cost savings for bulk requests
- **Streaming responses** - Real-time output generation
- **Tool use** - Integration with external APIs and functions

### Advanced Features
- **Extended thinking** - Transparent reasoning process
- **Prompt caching** - Reduce costs and latency
- **Citations** - Source attribution for responses
- **Agent Skills** - Pre-built and custom capabilities
- **Code execution** - Run Python in sandboxed environment
- **Computer use** - Control desktop interfaces
- **Memory** - Maintain context across conversations
- **Web search & fetch** - Access current information

### Models Available
- **Claude Sonnet 4.5** - Latest and most capable
- **Claude Opus** - Maximum capability
- **Claude Sonnet** - Balanced performance
- **Claude Haiku** - Fast and cost-effective

## Output Example

When you run the demo, you'll see output like:

```
================================================================================
  ANTHROPIC API COMPREHENSIVE DEMO
  Testing Claude API Features and Capabilities
================================================================================

================================================================================
  Demo 1: Basic Message Creation
================================================================================

Model: claude-sonnet-4-5-20250929
Role: assistant
Content: [Claude's response about quantum computing]

Usage:
  Input tokens: 15
  Output tokens: 162

[... additional demos ...]

================================================================================
  All Demos Completed Successfully!
================================================================================
```

## Customization

You can modify the demo script to:
- Test different models by changing the `model` parameter
- Adjust `max_tokens` for different response lengths
- Modify `temperature` for more or less creative responses
- Add your own custom tool definitions
- Test with your own prompts and use cases

## Troubleshooting

### API Key Not Found
Ensure your `ANTHROPIC_API_KEY` environment variable is set:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### Module Not Found
Install the anthropic package:
```bash
pip install anthropic
```

### Rate Limits
If you encounter rate limits, add delays between requests or use batch processing.

## Further Reading

For comprehensive information about Claude's capabilities, features, and best practices, see **anthropic_api_capabilities_brief.md**.

## Resources

- **Official Documentation**: https://docs.anthropic.com
- **Python SDK**: https://github.com/anthropics/anthropic-sdk-python
- **API Reference**: https://docs.anthropic.com/en/api
- **Console**: https://console.anthropic.com

## License

This demo is provided as-is for educational and testing purposes.
