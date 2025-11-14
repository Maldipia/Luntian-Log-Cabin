# Extended Thinking Guide: Transparent Reasoning for Multi-Step Tasks

## Introduction

**Extended Thinking** is a powerful feature in the Anthropic Claude API that provides enhanced reasoning capabilities for complex tasks while offering transparency into Claude's step-by-step thought process. When enabled, Claude creates explicit `thinking` content blocks where it works through problems methodically before delivering its final response. This feature is invaluable for tasks requiring deep analysis, multi-step reasoning, verification, and explainable AI outputs.

This guide demonstrates how to effectively use Extended Thinking to make Claude's reasoning transparent and improve the quality of responses for complex, multi-step tasks.

---

## What is Extended Thinking?

Extended Thinking allows Claude to engage in deliberate, visible reasoning before formulating its final answer. When this feature is enabled, the API response includes:

1. **Thinking blocks** - Internal reasoning process where Claude works through the problem
2. **Text blocks** - Final polished response based on the thinking process

This separation provides several benefits:

- **Transparency** - See exactly how Claude arrived at its conclusions
- **Debugging** - Identify logical errors or misunderstandings in reasoning
- **Quality** - More thorough analysis leads to better answers
- **Trust** - Verifiable reasoning builds confidence in AI outputs
- **Learning** - Understand problem-solving approaches and methodologies

---

## Supported Models

Extended Thinking is available in the following Claude models:

| Model | Model ID | Status |
|-------|----------|--------|
| Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` | Current |
| Claude Sonnet 4 | `claude-sonnet-4-20250514` | Current |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | Current |
| Claude Opus 4.1 | `claude-opus-4-1-20250805` | Current |
| Claude Opus 4 | `claude-opus-4-20250514` | Current |
| Claude Sonnet 3.7 | `claude-3-7-sonnet-20250219` | Deprecated |

**Note**: API behavior differs between Claude 3.7 and Claude 4 models, but the API structure remains identical for compatibility.

---

## How to Enable Extended Thinking

### Basic API Structure

To enable Extended Thinking, add a `thinking` object to your API request with two key parameters:

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
            "content": "Your question here"
        }
    ]
)
```

### Key Parameters

**`thinking.type`** (required)
- Set to `"enabled"` to activate Extended Thinking
- Omit the `thinking` object entirely to use standard mode

**`thinking.budget_tokens`** (required when enabled)
- Specifies the maximum number of tokens Claude can use for thinking
- Minimum value: **1024 tokens**
- Recommended starting point: **5000 tokens**
- Must be less than `max_tokens`
- For budgets above 32K, use batch processing to avoid timeouts

**`max_tokens`** (required)
- Total tokens for the entire response (thinking + text)
- Set high enough to accommodate both thinking and final response

---

## Understanding the Response Structure

### Response Format

When Extended Thinking is enabled, the response contains multiple content blocks:

```json
{
  "id": "msg_01...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me work through this step by step...",
      "signature": "..."
    },
    {
      "type": "text",
      "text": "Based on my analysis, the answer is..."
    }
  ],
  "model": "claude-sonnet-4-5-20250929",
  "usage": {
    "input_tokens": 48,
    "output_tokens": 563
  }
}
```

### Accessing Content Blocks

```python
for content_block in message.content:
    if content_block.type == "thinking":
        print("Thinking:", content_block.thinking)
    elif content_block.type == "text":
        print("Response:", content_block.text)
```

### Important Notes

**Claude 4 Models - Summarized Thinking**
- Returns a **summary** of the full thinking process
- You're charged for **full thinking tokens**, not summary tokens
- First few lines are more verbose for prompt engineering
- Summarization adds minimal latency

**Claude 3.7 Model**
- Returns **full thinking output** without summarization
- For full thinking in Claude 4, contact Anthropic sales

---

## Best Practices for Extended Thinking

### 1. Start with General Instructions

Claude often performs better with high-level guidance rather than prescriptive step-by-step instructions. The model's creativity may exceed human ability to prescribe optimal thinking.

**❌ Too Prescriptive:**
```python
content = """Think through this math problem step by step:
1. First, identify the variables
2. Then, set up the equation
3. Next, solve for x
4. Finally, verify your answer"""
```

**✅ Better Approach:**
```python
content = """Please think about this problem thoroughly and in great detail.
Consider multiple approaches and show your complete reasoning.
Try different methods if your first approach doesn't work."""
```

### 2. Use Verification Prompts

Ask Claude to check its own work before finishing:

```python
content = """Write a function to calculate Fibonacci numbers.
Before you finish, verify your solution with test cases for n=0, n=1, n=5, and n=10.
Fix any issues you find."""
```

### 3. Start with Minimum Budget, Then Increase

Begin with the minimum thinking budget (1024 tokens) and incrementally increase based on task complexity:

- **Simple calculations**: 1024-2000 tokens
- **Logic puzzles**: 3000-5000 tokens
- **Code generation with verification**: 5000-8000 tokens
- **Strategic planning**: 8000-12000 tokens
- **Complex optimization**: 12000-20000 tokens

### 4. Multishot Prompting with Thinking

Provide examples using XML tags to guide thinking patterns:

```python
content = """I'll show you how to solve a problem, then you solve a similar one.

Problem 1: Calculate the area of a rectangle with length 12m and width 8m.

<thinking>
Area = length × width
Area = 12 × 8 = 96 square meters
</thinking>

Answer: 96 square meters

Now solve this:
Problem 2: Calculate the area of a circle with radius 5m."""
```

### 5. Request Reflection and Analysis

For complex tasks, explicitly ask Claude to reflect on its reasoning:

```python
content = """Analyze the ethical implications of AI in hiring.
Think deeply about multiple perspectives, potential biases, and long-term consequences.
Consider counterarguments to your initial thoughts."""
```

---

## Ideal Use Cases for Extended Thinking

### Complex STEM Problems

Extended Thinking excels at problems requiring specialized knowledge and sequential logical steps:

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{
        "role": "user",
        "content": """A ball is thrown upward with initial velocity 20 m/s from a height of 2m.
Calculate: (a) maximum height reached, (b) time to reach max height, 
(c) total time in air, (d) velocity when hitting ground. Use g = 9.8 m/s²."""
    }]
)
```

### Logic Puzzles and Riddles

Problems requiring careful reasoning through constraints:

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 8000},
    messages=[{
        "role": "user",
        "content": """Five people of different nationalities live in five houses of different colors.
They drink different beverages, smoke different brands, and keep different pets.
Given these clues, who owns the fish? [provide clues]"""
    }]
)
```

### Code Generation with Verification

Writing code and testing it within the thinking process:

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{
        "role": "user",
        "content": """Write a function to detect if a string is a valid palindrome.
Test it with: 'racecar', 'hello', 'A man a plan a canal Panama', '12321'.
Fix any bugs you discover."""
    }]
)
```

### Strategic Planning and Optimization

Tasks requiring balancing multiple competing constraints:

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 15000},
    messages=[{
        "role": "user",
        "content": """Design a supply chain optimization strategy for a company with
3 factories and 5 distribution centers. Minimize costs while meeting demand constraints
and maintaining service levels. [provide detailed constraints]"""
    }]
)
```

### Multi-Step Mathematical Proofs

Problems requiring formal reasoning and proof construction:

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 12000},
    messages=[{
        "role": "user",
        "content": """Prove that there are infinitely many prime numbers of the form 4n + 3.
Show your complete reasoning and justify each step."""
    }]
)
```

---

## Streaming Extended Thinking

For real-time applications, you can stream thinking content as it's generated:

```python
with client.messages.stream(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 5000},
    messages=[{"role": "user", "content": "What is 127 * 843?"}]
) as stream:
    for event in stream:
        if hasattr(event, 'type'):
            if event.type == 'content_block_delta':
                if hasattr(event, 'delta'):
                    if event.delta.type == 'thinking_delta':
                        print(event.delta.thinking, end='', flush=True)
                    elif event.delta.type == 'text_delta':
                        print(event.delta.text, end='', flush=True)
```

**Note**: Thinking content may stream in chunks rather than token-by-token. This is expected behavior for optimal performance.

---

## Comparing With and Without Extended Thinking

### Without Extended Thinking

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=8000,
    messages=[{
        "role": "user",
        "content": "What are the trade-offs between microservices and monolithic architecture?"
    }]
)
# Returns direct answer without visible reasoning
```

### With Extended Thinking

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=8000,
    thinking={"type": "enabled", "budget_tokens": 5000},
    messages=[{
        "role": "user",
        "content": "What are the trade-offs between microservices and monolithic architecture?"
    }]
)
# Returns thinking process + final answer
# Thinking shows: consideration of multiple factors, weighing pros/cons, 
# analyzing different scenarios, arriving at nuanced conclusion
```

**Benefits of Extended Thinking:**
- More thorough analysis of trade-offs
- Consideration of edge cases and nuances
- Structured reasoning visible to developers
- Higher quality, more balanced final answer

---

## Technical Considerations

### Token Budgets and Costs

- **Minimum budget**: 1024 tokens (enforced by API)
- **Recommended starting point**: 5000 tokens
- **High complexity tasks**: 10000-20000 tokens
- **Billing**: Charged for **full thinking tokens** generated, not summary length
- **Budget above 32K**: Use batch processing to avoid timeouts

### Language Support

- **Thinking process**: Performs best in **English**
- **Final output**: Can be in any language Claude supports
- Specify output language in your prompt if needed

### When NOT to Use Extended Thinking

- **Simple queries**: "What is the capital of France?"
- **Quick factual lookups**: "When was Python created?"
- **Short creative tasks**: "Write a haiku about coffee"
- **Below 1024 token thinking needs**: Use standard mode with `<thinking>` XML tags

---

## Debugging and Troubleshooting

### Viewing Thinking to Debug Logic

Use thinking output to identify where Claude's reasoning went wrong:

```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 8000},
    messages=[{"role": "user", "content": "Your complex question"}]
)

# Examine thinking to find logical errors
thinking_content = message.content[0].thinking
print("Reasoning process:", thinking_content)
```

### Preventing Thinking Repetition in Output

Sometimes Claude repeats its thinking in the final response. To prevent this:

```python
content = """[Your question]

Important: Do not repeat your thinking process in your final answer. 
Only provide the clean, final response."""
```

### What NOT to Do

**❌ Don't pass thinking back to Claude:**
```python
# This doesn't improve performance and may degrade results
messages = [
    {"role": "user", "content": "Question 1"},
    {"role": "assistant", "content": previous_thinking + previous_response},
    {"role": "user", "content": "Question 2"}
]
```

**❌ Don't prefill thinking blocks:**
```python
# Prefilling thinking is explicitly not allowed
# It will cause errors or degrade performance
```

---

## Advanced Techniques

### Structured Thinking Frameworks

Guide Claude through specific analytical frameworks:

```python
content = """Analyze this business opportunity using the following framework:

1. Market Analysis (size, growth, competition)
2. SWOT Analysis (strengths, weaknesses, opportunities, threats)
3. Financial Projections (revenue, costs, profitability)
4. Risk Assessment (technical, market, regulatory)
5. Go/No-Go Recommendation

Think through each section carefully before providing your analysis."""
```

### Iterative Refinement

Use thinking to refine solutions iteratively:

```python
content = """Design an algorithm to solve this problem.
After your first approach, critically evaluate it for edge cases and efficiency.
If you find issues, revise your approach and explain the improvements."""
```

### Comparative Analysis

Have Claude compare multiple approaches in thinking:

```python
content = """Compare three different approaches to solving this problem:
1. Brute force approach
2. Optimized algorithmic approach  
3. Heuristic/approximation approach

Think through the trade-offs of each before recommending the best solution."""
```

---

## Complete Example: Multi-Step Problem Solving

Here's a comprehensive example demonstrating Extended Thinking for a complex optimization problem:

```python
from anthropic import Anthropic

client = Anthropic()

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
            "content": """A delivery company has 3 warehouses (W1, W2, W3) and needs to serve 
5 customers (C1, C2, C3, C4, C5) with the following daily demands:

Customer Demands (packages/day):
- C1: 100, C2: 150, C3: 80, C4: 120, C5: 90

Warehouse Capacities (packages/day):
- W1: 200, W2: 180, W3: 160

Delivery Costs ($/package):
- W1 to: C1=$2, C2=$3, C3=$5, C4=$4, C5=$6
- W2 to: C1=$4, C2=$2, C3=$3, C4=$5, C5=$3
- W3 to: C1=$5, C2=$4, C3=$2, C4=$3, C5=$2

Find the optimal delivery plan that:
1. Meets all customer demands
2. Doesn't exceed warehouse capacities
3. Minimizes total delivery costs

Show your complete reasoning process, including:
- How you approach the problem
- Alternative strategies considered
- Step-by-step solution
- Verification that constraints are satisfied
- Final cost calculation"""
        }
    ]
)

# Display thinking process
for content_block in message.content:
    if content_block.type == "thinking":
        print("=" * 80)
        print("CLAUDE'S REASONING PROCESS:")
        print("=" * 80)
        print(content_block.thinking)
        print()
    elif content_block.type == "text":
        print("=" * 80)
        print("FINAL SOLUTION:")
        print("=" * 80)
        print(content_block.text)

print(f"\nToken Usage: {message.usage.input_tokens} input, {message.usage.output_tokens} output")
```

---

## Summary and Key Takeaways

### When to Use Extended Thinking

✅ **Use Extended Thinking for:**
- Complex multi-step problems
- Tasks requiring verification
- Logic puzzles and riddles
- Strategic planning with constraints
- Code generation with testing
- Mathematical proofs
- Optimization problems
- Ethical or philosophical analysis
- Any task where reasoning transparency is valuable

❌ **Don't Use Extended Thinking for:**
- Simple factual questions
- Quick lookups
- Short creative tasks
- Casual conversation
- Tasks with thinking budget < 1024 tokens

### Configuration Guidelines

| Task Complexity | Thinking Budget | Example Use Cases |
|----------------|-----------------|-------------------|
| Simple | 1024-2000 | Basic calculations, simple logic |
| Moderate | 3000-5000 | Logic puzzles, code review |
| Complex | 5000-10000 | Algorithm design, strategic planning |
| Very Complex | 10000-20000 | Optimization, multi-constraint problems |
| Extremely Complex | 20000+ | Use batch processing |

### Best Practices Checklist

- ✅ Start with general instructions, add specifics only if needed
- ✅ Begin with minimum budget (1024) and increase as needed
- ✅ Ask Claude to verify its work with test cases
- ✅ Use multishot prompting to guide thinking patterns
- ✅ Request reflection and consideration of alternatives
- ✅ Examine thinking output to debug reasoning
- ✅ Use streaming for real-time applications
- ❌ Don't pass thinking back in subsequent messages
- ❌ Don't prefill thinking blocks
- ❌ Don't use for simple queries

---

## Conclusion

Extended Thinking transforms Claude from a black-box AI into a transparent reasoning partner. By making the thought process visible, you gain insights into how conclusions are reached, can identify and correct logical errors, and build trust in AI-generated outputs. This feature is particularly powerful for complex, multi-step tasks where understanding the reasoning is as important as the final answer.

Start experimenting with Extended Thinking today to unlock more reliable, explainable, and higher-quality AI responses for your most challenging problems.

---

## Additional Resources

- **API Documentation**: [docs.anthropic.com/en/docs/build-with-claude/extended-thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)
- **Prompting Tips**: [docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips)
- **Python SDK**: [github.com/anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python)
- **API Reference**: [docs.anthropic.com/en/api](https://docs.anthropic.com/en/api)
