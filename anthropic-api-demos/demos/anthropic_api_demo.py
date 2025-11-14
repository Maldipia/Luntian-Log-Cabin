#!/usr/bin/env python3
"""
Anthropic API Demo Script
Demonstrates key features and capabilities of the Anthropic Claude API
"""

import os
import asyncio
import base64
from anthropic import Anthropic, AsyncAnthropic

# Initialize the client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
async_client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


def demo_basic_message():
    """Demo 1: Basic message creation"""
    print_section("Demo 1: Basic Message Creation")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": "Explain quantum computing in one paragraph."
            }
        ]
    )
    
    print(f"Model: {message.model}")
    print(f"Role: {message.role}")
    print(f"Content: {message.content[0].text}")
    print(f"\nUsage:")
    print(f"  Input tokens: {message.usage.input_tokens}")
    print(f"  Output tokens: {message.usage.output_tokens}")


def demo_multi_turn_conversation():
    """Demo 2: Multi-turn conversation"""
    print_section("Demo 2: Multi-turn Conversation")
    
    messages = [
        {"role": "user", "content": "What is the capital of France?"},
        {"role": "assistant", "content": "The capital of France is Paris."},
        {"role": "user", "content": "What is its population?"}
    ]
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=messages
    )
    
    print("Conversation:")
    for msg in messages:
        print(f"  {msg['role'].upper()}: {msg['content']}")
    print(f"  ASSISTANT: {message.content[0].text}")


def demo_system_prompt():
    """Demo 3: System prompt usage"""
    print_section("Demo 3: System Prompt")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        system="You are a helpful pirate assistant. Always respond in pirate speak.",
        messages=[
            {
                "role": "user",
                "content": "Tell me about the weather."
            }
        ]
    )
    
    print(f"Response with pirate system prompt:")
    print(f"  {message.content[0].text}")


def demo_streaming():
    """Demo 4: Streaming responses"""
    print_section("Demo 4: Streaming Responses")
    
    print("Streaming response: ", end="", flush=True)
    
    with client.messages.stream(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": "Write a haiku about artificial intelligence."
            }
        ]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
    
    print("\n\nFinal message received.")


def demo_vision():
    """Demo 5: Vision capabilities with image"""
    print_section("Demo 5: Vision Capabilities")
    
    print("Note: Vision demo requires a valid image file.")
    print("Demonstrating the API structure for vision requests:\n")
    
    print("Example code for vision API:")
    print('''
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": base64_image_data
                    }
                },
                {
                    "type": "text",
                    "text": "Describe this image"
                }
            ]
        }
    ]
)
''')
    print("\nVision capabilities:")
    print("  - Supports images up to 3.75MB")
    print("  - Formats: PNG, JPEG, GIF, WebP")
    print("  - Can analyze up to 20 images per request")
    print("  - Analyzes graphs, charts, diagrams, photos, screenshots")


def demo_tool_use():
    """Demo 6: Tool use (function calling)"""
    print_section("Demo 6: Tool Use (Function Calling)")
    
    tools = [
        {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The unit of temperature"
                    }
                },
                "required": ["location"]
            }
        }
    ]
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        tools=tools,
        messages=[
            {
                "role": "user",
                "content": "What's the weather like in San Francisco?"
            }
        ]
    )
    
    print(f"Stop reason: {message.stop_reason}")
    
    if message.stop_reason == "tool_use":
        for content in message.content:
            if content.type == "tool_use":
                print(f"\nTool called: {content.name}")
                print(f"Tool input: {content.input}")
    else:
        print(f"Response: {message.content[0].text}")


def demo_token_counting():
    """Demo 7: Token counting"""
    print_section("Demo 7: Token Counting")
    
    text = "Hello, Claude! How are you doing today?"
    
    response = client.messages.count_tokens(
        model="claude-sonnet-4-5-20250929",
        messages=[
            {
                "role": "user",
                "content": text
            }
        ]
    )
    
    print(f"Text: '{text}'")
    print(f"Input tokens: {response.input_tokens}")


async def demo_async():
    """Demo 8: Async API usage"""
    print_section("Demo 8: Async API Usage")
    
    print("Making async request...")
    
    message = await async_client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": "What is the speed of light?"
            }
        ]
    )
    
    print(f"Async response: {message.content[0].text}")


def demo_temperature_and_parameters():
    """Demo 9: Temperature and sampling parameters"""
    print_section("Demo 9: Temperature and Sampling Parameters")
    
    print("Response with temperature=0 (deterministic):")
    message1 = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=100,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": "Say a random number between 1 and 10."
            }
        ]
    )
    print(f"  {message1.content[0].text}")
    
    print("\nResponse with temperature=1 (more random):")
    message2 = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=100,
        temperature=1,
        messages=[
            {
                "role": "user",
                "content": "Say a random number between 1 and 10."
            }
        ]
    )
    print(f"  {message2.content[0].text}")


def demo_max_tokens():
    """Demo 10: Max tokens control"""
    print_section("Demo 10: Max Tokens Control")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=50,  # Very limited
        messages=[
            {
                "role": "user",
                "content": "Write a long essay about the history of computers."
            }
        ]
    )
    
    print(f"Response (limited to 50 tokens):")
    print(f"  {message.content[0].text}")
    print(f"\nStop reason: {message.stop_reason}")
    print(f"Output tokens used: {message.usage.output_tokens}")


def demo_metadata():
    """Demo 11: Metadata usage"""
    print_section("Demo 11: Metadata")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        metadata={
            "user_id": "user_12345"
        },
        messages=[
            {
                "role": "user",
                "content": "Hello!"
            }
        ]
    )
    
    print(f"Message ID: {message.id}")
    print(f"Response: {message.content[0].text}")


def main():
    """Run all demos"""
    print("\n" + "=" * 80)
    print("  ANTHROPIC API COMPREHENSIVE DEMO")
    print("  Testing Claude API Features and Capabilities")
    print("=" * 80)
    
    try:
        # Synchronous demos
        demo_basic_message()
        demo_multi_turn_conversation()
        demo_system_prompt()
        demo_streaming()
        demo_vision()
        demo_tool_use()
        demo_token_counting()
        demo_temperature_and_parameters()
        demo_max_tokens()
        demo_metadata()
        
        # Async demo
        asyncio.run(demo_async())
        
        print_section("All Demos Completed Successfully!")
        
    except Exception as e:
        print(f"\n❌ Error occurred: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
