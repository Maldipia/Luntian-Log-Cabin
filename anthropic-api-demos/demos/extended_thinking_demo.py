#!/usr/bin/env python3
"""
Anthropic Extended Thinking Demo
Demonstrates how to use Extended Thinking for transparent reasoning in multi-step tasks
"""

import os
import json
from anthropic import Anthropic

# Initialize the client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


def print_thinking_block(thinking_content):
    """Print thinking content in a formatted way"""
    print("🧠 CLAUDE'S THINKING PROCESS:")
    print("-" * 80)
    print(thinking_content)
    print("-" * 80)


def print_response(text_content):
    """Print final response in a formatted way"""
    print("\n💬 FINAL RESPONSE:")
    print("-" * 80)
    print(text_content)
    print("-" * 80)


def demo_basic_extended_thinking():
    """Demo 1: Basic extended thinking with a math problem"""
    print_section("Demo 1: Basic Extended Thinking - Complex Math Problem")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=16000,
        thinking={
            "type": "enabled",
            "budget_tokens": 5000
        },
        messages=[
            {
                "role": "user",
                "content": "If a train travels at 80 km/h for 2.5 hours, then at 100 km/h for 1.5 hours, what is the average speed for the entire journey?"
            }
        ]
    )
    
    # Extract thinking and text blocks
    for content_block in message.content:
        if content_block.type == "thinking":
            print_thinking_block(content_block.thinking)
        elif content_block.type == "text":
            print_response(content_block.text)
    
    print(f"\n📊 Token Usage:")
    print(f"   Input tokens: {message.usage.input_tokens}")
    print(f"   Output tokens: {message.usage.output_tokens}")


def demo_logic_puzzle():
    """Demo 2: Extended thinking for logic puzzles"""
    print_section("Demo 2: Logic Puzzle with Step-by-Step Reasoning")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=16000,
        thinking={
            "type": "enabled",
            "budget_tokens": 8000
        },
        messages=[
            {
                "role": "user",
                "content": """There are three boxes: one contains only apples, one contains only oranges, 
and one contains both apples and oranges. All boxes are labeled incorrectly. 
You can pick one fruit from one box without looking inside. 
How can you correctly label all three boxes?"""
            }
        ]
    )
    
    for content_block in message.content:
        if content_block.type == "thinking":
            print_thinking_block(content_block.thinking)
        elif content_block.type == "text":
            print_response(content_block.text)
    
    print(f"\n📊 Token Usage:")
    print(f"   Input tokens: {message.usage.input_tokens}")
    print(f"   Output tokens: {message.usage.output_tokens}")


def demo_code_generation_with_verification():
    """Demo 3: Code generation with self-verification"""
    print_section("Demo 3: Code Generation with Self-Verification")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=16000,
        thinking={
            "type": "enabled",
            "budget_tokens": 10000
        },
        messages=[
            {
                "role": "user",
                "content": """Write a Python function to find all prime numbers up to n using the Sieve of Eratosthenes.
Before you finish, verify your solution with test cases for n=10, n=20, and n=50.
Fix any issues you find."""
            }
        ]
    )
    
    for content_block in message.content:
        if content_block.type == "thinking":
            print_thinking_block(content_block.thinking)
        elif content_block.type == "text":
            print_response(content_block.text)
    
    print(f"\n📊 Token Usage:")
    print(f"   Input tokens: {message.usage.input_tokens}")
    print(f"   Output tokens: {message.usage.output_tokens}")


def demo_strategic_planning():
    """Demo 4: Strategic planning with multiple constraints"""
    print_section("Demo 4: Strategic Planning with Multiple Constraints")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=16000,
        thinking={
            "type": "enabled",
            "budget_tokens": 12000
        },
        messages=[
            {
                "role": "user",
                "content": """Plan a 5-day trip to Tokyo with the following constraints:
- Budget: $2000 (excluding flights)
- Must visit at least 3 cultural sites
- Must include 2 food experiences
- Must have 1 day trip outside Tokyo
- Prefer public transportation
- Staying in Shibuya area

Think through this carefully and provide a detailed day-by-day itinerary."""
            }
        ]
    )
    
    for content_block in message.content:
        if content_block.type == "thinking":
            print_thinking_block(content_block.thinking)
        elif content_block.type == "text":
            print_response(content_block.text)
    
    print(f"\n📊 Token Usage:")
    print(f"   Input tokens: {message.usage.input_tokens}")
    print(f"   Output tokens: {message.usage.output_tokens}")


def demo_multishot_prompting():
    """Demo 5: Multishot prompting with extended thinking"""
    print_section("Demo 5: Multishot Prompting with Extended Thinking")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=16000,
        thinking={
            "type": "enabled",
            "budget_tokens": 8000
        },
        messages=[
            {
                "role": "user",
                "content": """I'll show you how to solve a problem, then you solve a similar one.

Problem 1: A rectangular garden is 12 meters long and 8 meters wide. What is its area and perimeter?

<thinking>
To solve this:
1. Area = length × width = 12 × 8 = 96 square meters
2. Perimeter = 2(length + width) = 2(12 + 8) = 2(20) = 40 meters
</thinking>

Answer: The garden has an area of 96 square meters and a perimeter of 40 meters.

Now solve this:
Problem 2: A circular pool has a diameter of 10 meters. What is its area and circumference? (Use π ≈ 3.14159)"""
            }
        ]
    )
    
    for content_block in message.content:
        if content_block.type == "thinking":
            print_thinking_block(content_block.thinking)
        elif content_block.type == "text":
            print_response(content_block.text)
    
    print(f"\n📊 Token Usage:")
    print(f"   Input tokens: {message.usage.input_tokens}")
    print(f"   Output tokens: {message.usage.output_tokens}")


def demo_comparison_with_without_thinking():
    """Demo 6: Compare responses with and without extended thinking"""
    print_section("Demo 6: Comparison - With vs Without Extended Thinking")
    
    question = "What are the ethical implications of using AI in hiring decisions?"
    
    print("🔹 WITHOUT Extended Thinking:")
    print("-" * 80)
    
    message_without = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=8000,
        messages=[
            {
                "role": "user",
                "content": question
            }
        ]
    )
    
    print(message_without.content[0].text)
    print(f"\nTokens used: {message_without.usage.output_tokens}")
    
    print("\n\n🔹 WITH Extended Thinking:")
    print("-" * 80)
    
    message_with = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=8000,
        thinking={
            "type": "enabled",
            "budget_tokens": 5000
        },
        messages=[
            {
                "role": "user",
                "content": question
            }
        ]
    )
    
    for content_block in message_with.content:
        if content_block.type == "thinking":
            print_thinking_block(content_block.thinking)
        elif content_block.type == "text":
            print_response(content_block.text)
    
    print(f"\nTokens used: {message_with.usage.output_tokens}")


def demo_streaming_extended_thinking():
    """Demo 7: Streaming with extended thinking"""
    print_section("Demo 7: Streaming Extended Thinking")
    
    print("Question: What is 127 * 843?")
    print("\n🧠 STREAMING THINKING PROCESS:")
    print("-" * 80)
    
    thinking_content = ""
    text_content = ""
    
    with client.messages.stream(
        model="claude-sonnet-4-5-20250929",
        max_tokens=8000,
        thinking={
            "type": "enabled",
            "budget_tokens": 3000
        },
        messages=[
            {
                "role": "user",
                "content": "What is 127 * 843? Show your calculation step by step."
            }
        ]
    ) as stream:
        current_block_type = None
        
        for event in stream:
            if hasattr(event, 'type'):
                if event.type == 'content_block_start':
                    if hasattr(event, 'content_block'):
                        current_block_type = event.content_block.type
                        if current_block_type == 'text':
                            print("\n\n💬 STREAMING FINAL RESPONSE:")
                            print("-" * 80)
                
                elif event.type == 'content_block_delta':
                    if hasattr(event, 'delta'):
                        if event.delta.type == 'thinking_delta':
                            print(event.delta.thinking, end='', flush=True)
                            thinking_content += event.delta.thinking
                        elif event.delta.type == 'text_delta':
                            print(event.delta.text, end='', flush=True)
                            text_content += event.delta.text
    
    print("\n" + "-" * 80)
    print("\n✅ Streaming complete!")


def demo_different_thinking_budgets():
    """Demo 8: Impact of different thinking budgets"""
    print_section("Demo 8: Impact of Different Thinking Budgets")
    
    question = "Explain the concept of quantum entanglement and its implications for quantum computing."
    
    budgets = [1024, 5000, 10000]
    
    for budget in budgets:
        print(f"\n{'='*80}")
        print(f"  THINKING BUDGET: {budget} tokens")
        print(f"{'='*80}\n")
        
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=8000,
            thinking={
                "type": "enabled",
                "budget_tokens": budget
            },
            messages=[
                {
                    "role": "user",
                    "content": question
                }
            ]
        )
        
        thinking_length = 0
        for content_block in message.content:
            if content_block.type == "thinking":
                thinking_length = len(content_block.thinking)
                print(f"🧠 Thinking length: {thinking_length} characters")
                print(f"   First 200 chars: {content_block.thinking[:200]}...")
            elif content_block.type == "text":
                print(f"\n💬 Response length: {len(content_block.text)} characters")
                print(f"   First 200 chars: {content_block.text[:200]}...")
        
        print(f"\n📊 Tokens: Input={message.usage.input_tokens}, Output={message.usage.output_tokens}")


def demo_multi_step_problem_solving():
    """Demo 9: Complex multi-step problem solving"""
    print_section("Demo 9: Complex Multi-Step Problem Solving")
    
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=16000,
        thinking={
            "type": "enabled",
            "budget_tokens": 15000
        },
        messages=[
            {
                "role": "user",
                "content": """A company has 3 factories (A, B, C) and 4 warehouses (W1, W2, W3, W4).

Factory capacities (units/day):
- A: 100
- B: 150
- C: 200

Warehouse demands (units/day):
- W1: 80
- W2: 120
- W3: 100
- W4: 90

Shipping costs ($/unit):
- A to W1: 8, W2: 6, W3: 10, W4: 9
- B to W1: 9, W2: 12, W3: 13, W4: 7
- C to W1: 14, W2: 9, W3: 16, W4: 5

Find an optimal distribution plan that minimizes total shipping costs while meeting all demands.
Show your reasoning process step by step."""
            }
        ]
    )
    
    for content_block in message.content:
        if content_block.type == "thinking":
            print_thinking_block(content_block.thinking)
        elif content_block.type == "text":
            print_response(content_block.text)
    
    print(f"\n📊 Token Usage:")
    print(f"   Input tokens: {message.usage.input_tokens}")
    print(f"   Output tokens: {message.usage.output_tokens}")


def main():
    """Run all demos"""
    print("\n" + "=" * 80)
    print("  ANTHROPIC EXTENDED THINKING COMPREHENSIVE DEMO")
    print("  Transparent Reasoning for Multi-Step Tasks")
    print("=" * 80)
    
    try:
        # Run demos
        demo_basic_extended_thinking()
        demo_logic_puzzle()
        demo_code_generation_with_verification()
        demo_strategic_planning()
        demo_multishot_prompting()
        demo_comparison_with_without_thinking()
        demo_streaming_extended_thinking()
        demo_different_thinking_budgets()
        demo_multi_step_problem_solving()
        
        print_section("All Extended Thinking Demos Completed Successfully!")
        
        print("\n📚 KEY TAKEAWAYS:")
        print("-" * 80)
        print("1. Extended thinking provides transparency into Claude's reasoning process")
        print("2. Minimum thinking budget is 1024 tokens, adjust based on task complexity")
        print("3. Thinking blocks appear before final responses in the API response")
        print("4. Works great for: logic puzzles, code verification, strategic planning")
        print("5. Can be combined with streaming for real-time reasoning visibility")
        print("6. Higher thinking budgets allow for more thorough analysis")
        print("7. Use verification prompts to have Claude check its own work")
        print("-" * 80)
        
    except Exception as e:
        print(f"\n❌ Error occurred: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
