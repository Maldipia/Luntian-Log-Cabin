# Extended Thinking Demo Package

Complete guide and demonstration of using Anthropic's Extended Thinking feature for transparent reasoning in multi-step tasks.

## 📦 Package Contents

1. **extended_thinking_demo.py** - Comprehensive demo script with 9 different examples
2. **extended_thinking_guide.md** - Complete guide (10,000+ words) covering all aspects
3. **EXTENDED_THINKING_README.md** - This quick start guide

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Anthropic API key set as `ANTHROPIC_API_KEY` environment variable
- Anthropic Python SDK installed

### Installation

```bash
# Install the Anthropic SDK if not already installed
pip install anthropic

# Or with sudo
sudo pip install anthropic
```

### Running the Demo

```bash
# Make executable
chmod +x extended_thinking_demo.py

# Run all demos
python3 extended_thinking_demo.py
```

## 🎯 What is Extended Thinking?

Extended Thinking is a feature that makes Claude's reasoning process **visible and transparent**. When enabled, Claude creates explicit `thinking` blocks where it works through problems step-by-step before delivering its final answer.

### Key Benefits

- **Transparency** - See exactly how Claude reached its conclusions
- **Quality** - More thorough analysis leads to better answers
- **Debugging** - Identify logical errors in reasoning
- **Trust** - Verifiable reasoning builds confidence
- **Learning** - Understand problem-solving methodologies

## 📋 Demo Examples

The demo script includes 9 comprehensive examples:

### 1. Basic Extended Thinking
Simple math problem demonstrating the thinking → response flow.

### 2. Logic Puzzle
Classic logic puzzle showing step-by-step constraint reasoning.

### 3. Code Generation with Verification
Generate code and have Claude test it within the thinking process.

### 4. Strategic Planning
Multi-constraint travel planning with budget optimization.

### 5. Multishot Prompting
Using examples to guide Claude's thinking patterns.

### 6. Comparison Demo
Side-by-side comparison of responses with/without Extended Thinking.

### 7. Streaming Extended Thinking
Real-time streaming of thinking process as it's generated.

### 8. Different Thinking Budgets
Impact of varying thinking budgets (1024, 5000, 10000 tokens).

### 9. Complex Multi-Step Problem
Supply chain optimization with multiple constraints.

## 💡 Basic Usage

### Enable Extended Thinking

```python
from anthropic import Anthropic

client = Anthropic()

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
            "content": "Your complex question here"
        }
    ]
)
```

### Access Thinking and Response

```python
for content_block in message.content:
    if content_block.type == "thinking":
        print("Thinking:", content_block.thinking)
    elif content_block.type == "text":
        print("Response:", content_block.text)
```

## 🔧 Key Parameters

### `thinking.type`
- Set to `"enabled"` to activate Extended Thinking
- Omit to use standard mode

### `thinking.budget_tokens`
- Minimum: **1024 tokens**
- Recommended starting point: **5000 tokens**
- Must be less than `max_tokens`
- Higher budgets allow more thorough analysis

### Recommended Budgets by Task Complexity

| Task Type | Budget | Examples |
|-----------|--------|----------|
| Simple | 1024-2000 | Basic calculations |
| Moderate | 3000-5000 | Logic puzzles |
| Complex | 5000-10000 | Code generation |
| Very Complex | 10000-20000 | Strategic planning |

## ✅ Best Practices

### 1. Start with General Instructions

**Good:**
```python
"Think through this problem carefully and show your reasoning."
```

**Avoid:**
```python
"Step 1: Do X. Step 2: Do Y. Step 3: Do Z."
```

Claude often finds better approaches than prescribed steps.

### 2. Request Verification

```python
"Before finishing, verify your solution with test cases and fix any issues."
```

### 3. Begin with Minimum Budget

Start with 1024 tokens and increase based on task complexity.

### 4. Use Multishot Prompting

Provide examples with `<thinking>` tags to guide patterns:

```python
"""
Problem 1: Calculate 15% of 80

<thinking>
15% = 0.15
0.15 × 80 = 12
</thinking>

Answer: 12

Now solve: Calculate 25% of 120
"""
```

## 🎓 Ideal Use Cases

### ✅ Great for Extended Thinking

- Complex STEM problems
- Logic puzzles and riddles
- Code generation with testing
- Strategic planning
- Optimization problems
- Mathematical proofs
- Multi-step reasoning
- Ethical analysis

### ❌ Not Ideal for Extended Thinking

- Simple factual questions ("What is the capital of France?")
- Quick lookups
- Short creative tasks
- Casual conversation

## 📊 Understanding the Response

### Response Structure

```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "Step-by-step reasoning...",
      "signature": "..."
    },
    {
      "type": "text",
      "text": "Final answer..."
    }
  ],
  "usage": {
    "input_tokens": 48,
    "output_tokens": 563
  }
}
```

### Important Notes

- **Claude 4 models** return summarized thinking (charged for full tokens)
- **Claude 3.7** returns full thinking output
- Thinking tokens are billed but summary length may be shorter
- First few lines of thinking are more verbose for debugging

## 🔄 Streaming Example

```python
with client.messages.stream(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 5000},
    messages=[{"role": "user", "content": "Your question"}]
) as stream:
    for event in stream:
        if hasattr(event, 'type') and event.type == 'content_block_delta':
            if hasattr(event, 'delta'):
                if event.delta.type == 'thinking_delta':
                    print(event.delta.thinking, end='', flush=True)
                elif event.delta.type == 'text_delta':
                    print(event.delta.text, end='', flush=True)
```

## 🐛 Troubleshooting

### Issue: Thinking repeated in final response

**Solution:** Add to your prompt:
```
"Do not repeat your thinking process in your final answer."
```

### Issue: Not enough thinking depth

**Solution:** Increase `budget_tokens` and/or request deeper analysis:
```
"Think through this very carefully and in great detail."
```

### Issue: Timeout errors

**Solution:** For budgets above 32K tokens, use batch processing.

### Issue: Thinking below 1024 tokens needed

**Solution:** Use standard mode with traditional chain-of-thought prompting:
```python
# Standard mode with <thinking> XML tags
messages=[{
    "role": "user", 
    "content": "Think step by step using <thinking> tags."
}]
```

## 📚 Example Output

When you run the demo, you'll see output like:

```
================================================================================
  Demo 1: Basic Extended Thinking - Complex Math Problem
================================================================================

🧠 CLAUDE'S THINKING PROCESS:
--------------------------------------------------------------------------------
I need to calculate the average speed for the entire journey.

Let me break this down:
1. First segment: 80 km/h for 2.5 hours
   Distance = 80 × 2.5 = 200 km

2. Second segment: 100 km/h for 1.5 hours
   Distance = 100 × 1.5 = 150 km

3. Total distance = 200 + 150 = 350 km
4. Total time = 2.5 + 1.5 = 4 hours

5. Average speed = Total distance / Total time
   Average speed = 350 / 4 = 87.5 km/h
--------------------------------------------------------------------------------

💬 FINAL RESPONSE:
--------------------------------------------------------------------------------
The average speed for the entire journey is 87.5 km/h.

To find this, I calculated:
- Total distance: 350 km (200 km + 150 km)
- Total time: 4 hours (2.5 hours + 1.5 hours)
- Average speed: 350 km ÷ 4 hours = 87.5 km/h
--------------------------------------------------------------------------------

📊 Token Usage:
   Input tokens: 52
   Output tokens: 287
```

## 🎯 Key Takeaways

1. **Extended Thinking provides transparency** into Claude's reasoning
2. **Start with 1024 tokens** and increase based on complexity
3. **Thinking blocks appear first**, followed by final response
4. **Great for complex tasks** like logic, code, planning, optimization
5. **Use verification prompts** to have Claude check its work
6. **Streaming works** for real-time reasoning visibility
7. **Higher budgets = deeper analysis** (but diminishing returns above 32K)

## 📖 Further Reading

For comprehensive coverage of Extended Thinking, see **extended_thinking_guide.md** which includes:

- Detailed API documentation
- Advanced prompting techniques
- Complete use case examples
- Technical considerations
- Debugging strategies
- Comparison studies
- Best practices checklist

## 🔗 Resources

- **API Docs**: https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
- **Python SDK**: https://github.com/anthropics/anthropic-sdk-python
- **Prompting Tips**: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips

## 💬 Support

For questions about:
- **API usage**: See the comprehensive guide (extended_thinking_guide.md)
- **Billing/credits**: Visit https://help.manus.im
- **Technical issues**: Check Anthropic documentation or Discord

---

**Happy reasoning with Extended Thinking! 🧠✨**
