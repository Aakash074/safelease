#!/usr/bin/env python3
"""
Working client agent for testing the system
"""

import asyncio
import os
from uagents import Agent, Context, Model
from dotenv import load_dotenv

from damage_verifier import DamageRequest, DamageResponse
from payment_processor import PaymentRequest, PaymentResponse

load_dotenv()

# Create client agent
client_agent = Agent(
    name="TestClient",
    seed="client_seed_phrase_abcde_unique",
    port=8003,
    endpoint=["http://localhost:8003/submit"],
)

# Create the other agents to get their addresses
# For local development, we create the agents with the same seeds to get their addresses
damage_agent = Agent(
    name="DamageVerifier",
    seed="damage_verifier_seed_12345_unique",
    port=8000,
    endpoint=["http://localhost:8000/submit"],
)

payment_agent = Agent(
    name="PaymentProcessor",
    seed="payment_processor_seed_67890_unique",
    port=8001,
    endpoint=["http://localhost:8001/submit"],
)

# Global variables to store responses
damage_response = None
payment_response = None

@client_agent.on_message(model=DamageResponse)
async def handle_damage_response(ctx: Context, sender: str, msg: DamageResponse):
    """Handle damage verification response"""
    global damage_response
    damage_response = msg
    
    ctx.logger.info(f"✅ Damage assessment received:")
    ctx.logger.info(f"   Decision: {msg.decision}")
    ctx.logger.info(f"   Approved amount: ${msg.approved_amount}")
    ctx.logger.info(f"   Deduction: ${msg.deduction}")
    
    # Now send payment request
    payment_request = PaymentRequest(
        decision=msg.decision,
        approved_amount=msg.approved_amount,
        policy_id=msg.policy_id
    )
    
    ctx.logger.info(f"📤 Sending payment request to {payment_agent.address}")
    await ctx.send(payment_agent.address, payment_request)

@client_agent.on_message(model=PaymentResponse)
async def handle_payment_response(ctx: Context, sender: str, msg: PaymentResponse):
    """Handle payment processing response"""
    global payment_response
    payment_response = msg
    
    ctx.logger.info(f"✅ Payment processing completed:")
    ctx.logger.info(f"   Status: {msg.status}")
    ctx.logger.info(f"   Paid amount: ${msg.paid_amount}")
    ctx.logger.info(f"   Transaction ID: {msg.transaction_id}")
    
    # Print final results
    print("\n🎉 Security Deposit Refund Process Complete!")
    print("=" * 50)
    print(f"Policy ID: {msg.policy_id}")
    print(f"Final Status: {msg.status}")
    print(f"Amount Refunded: ${msg.paid_amount}")
    print(f"Transaction ID: {msg.transaction_id}")

@client_agent.on_interval(period=10.0)
async def initiate_deposit_refund(ctx: Context):
    """Initiate the deposit refund process"""
    
    ctx.logger.info("🏠 Starting Security Deposit Refund Process")
    
    # Create damage verification request
    damage_request = DamageRequest(
        before_image="https://example.com/before.jpg",
        after_image="https://example.com/after.jpg",
        claim_amount=1000.0,
        policy_id="POL-12345"
    )
    
    ctx.logger.info(f"📤 Sending damage verification request to {damage_agent.address}")
    await ctx.send(damage_agent.address, damage_request)

if __name__ == "__main__":
    print("🏠 Starting Security Deposit Refund System")
    print("=" * 45)
    print(f"Client Agent: {client_agent.name}")
    print(f"Address: {client_agent.address}")
    print("\n⚠️  Make sure these agents are running:")
    print("   Terminal 1: python damage_verifier.py")
    print("   Terminal 2: python payment_processor.py")
    print("\n🚀 Client agent starting...")
    
    client_agent.run()
