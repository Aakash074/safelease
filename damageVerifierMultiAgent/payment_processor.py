#!/usr/bin/env python3
"""
Working payment processing agent based on uAgents documentation
"""

import os
import random
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
from dotenv import load_dotenv

load_dotenv()

# Create the payment processing agent
payment_agent = Agent(
    name="PaymentProcessor",
    seed="payment_processor_seed_67890_unique",
    port=8001,
    endpoint=["http://localhost:8001/submit"],
)

# Fund the agent
fund_agent_if_low(payment_agent.wallet.address())

class PaymentRequest(Model):
    decision: str
    approved_amount: float
    policy_id: str

class PaymentResponse(Model):
    policy_id: str
    decision: str
    paid_amount: float
    transaction_id: str
    status: str

@payment_agent.on_message(model=PaymentRequest, replies=PaymentResponse)
async def process_payment(ctx: Context, sender: str, msg: PaymentRequest):
    """Process security deposit refund based on damage assessment"""
    
    ctx.logger.info(f"💳 Processing payment for policy {msg.policy_id}")
    ctx.logger.info(f"📋 Decision: {msg.decision}")
    ctx.logger.info(f"💰 Approved amount: ${msg.approved_amount}")
    
    # Generate transaction ID
    txn_id = f"TXN_{random.randint(100000, 999999)}"
    
    # Process payment based on decision
    if msg.decision == "full_payout":
        paid_amount = msg.approved_amount
        status = "completed"
    elif msg.decision == "deduct_payout":
        paid_amount = msg.approved_amount
        status = "completed"
    elif msg.decision == "error":
        paid_amount = 0
        status = "failed"
    else:
        paid_amount = 0
        status = "rejected"
    
    response = PaymentResponse(
        policy_id=msg.policy_id,
        decision=msg.decision,
        paid_amount=paid_amount,
        transaction_id=txn_id,
        status=status
    )
    
    ctx.logger.info(f"✅ Payment processed: {status}")
    ctx.logger.info(f"💵 Paid amount: ${paid_amount}")
    ctx.logger.info(f"🔢 Transaction ID: {txn_id}")
    
    await ctx.send(sender, response)

if __name__ == "__main__":
    print("💳 Starting Payment Processing Agent")
    print("=" * 40)
    print(f"Agent: {payment_agent.name}")
    print(f"Address: {payment_agent.address}")
    print(f"Port: 8001")
    print("\n🚀 Agent is running...")
    
    payment_agent.run()