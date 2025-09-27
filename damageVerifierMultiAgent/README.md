# Tenant Security Deposit Refund System

A working decentralized multi-agent system for processing tenant security deposit refunds using the uAgents framework.

## System Overview

This system consists of three agents working together to process tenant security deposit refunds:

1. **DamageVerifier**: Compares before/after images to assess property damage
2. **PaymentProcessor**: Processes security deposit refunds based on damage assessment
3. **TestClient**: Coordinates the refund processing workflow

## ✅ Working Solution

After carefully reading the uAgents documentation, this system now properly implements:
- Correct agent message handling with `@agent.on_message` decorators
- Proper response sending with `await ctx.send(sender, response)`
- Agent-to-agent communication using the uAgents message passing protocol

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 2. Required Configuration

#### Agent Seed (`AGENT_SEED`)
- This is a random string used to generate unique agent identities
- Generate one using: `python -c "import secrets; print(secrets.token_hex(32))"`
- Keep this seed secure - losing it means you can't recreate the same agent identity

### 3. Installation
```bash
pip install -r requirements.txt
```

### 4. Running the System

#### Option 1: Run All Agents (Recommended)
```bash
python run_system.py
```

#### Option 2: Run Agents Individually
```bash
# Terminal 1
python damage_verifier.py

# Terminal 2  
python payment_processor.py

# Terminal 3
python client.py
```

## Usage

### Process a Security Deposit Refund
```python
import asyncio
from client import process_deposit_refund

async def main():
    result = await process_deposit_refund(
        before_image="https://example.com/before.jpg",
        after_image="https://example.com/after.jpg",
        deposit_amount=1000.0,
        tenant_id="TENANT-12345"
    )
    print(result)

asyncio.run(main())
```

### Run Client
```bash
python client.py
```

### Test System
```bash
python test_system.py
```

## Agent Communication

- **Property Damage Verification**: Analyzes before/after images and determines refund amount
  - Uses proper uAgents message passing protocol with `@agent.on_message`
- **Deposit Refund Processing**: Executes refund based on damage assessment  
  - Uses proper uAgents message passing protocol with `await ctx.send()`
- **Client Coordination**: Orchestrates the entire refund workflow

## Architecture

```
TestClient
    ↓ (DamageRequest)
DamageVerifier
    ↓ (DamageResponse)
TestClient  
    ↓ (PaymentRequest)
PaymentProcessor
    ↓ (PaymentResponse)
TestClient
```

## Features

- ✅ Decentralized agent communication
- ✅ Image-based property damage assessment
- ✅ Automated security deposit refund processing
- ✅ Error handling and logging
- ✅ Easy-to-use client interface
- ✅ Multi-agent coordination
- ✅ Fair and transparent deposit refund decisions
