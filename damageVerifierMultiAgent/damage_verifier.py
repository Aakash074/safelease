#!/usr/bin/env python3
"""
Working damage verification agent based on uAgents documentation
"""

import os
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
from dotenv import load_dotenv

load_dotenv()

# Create the damage verification agent
damage_agent = Agent(
    name="DamageVerifier",
    seed="damage_verifier_seed_12345_unique",
    port=8000,
    endpoint=["http://localhost:8000/submit"],
)

# Fund the agent
fund_agent_if_low(damage_agent.wallet.address())

class DamageRequest(Model):
    before_image: str
    after_image: str
    claim_amount: float
    policy_id: str

class DamageResponse(Model):
    decision: str
    approved_amount: float
    deduction: float
    policy_id: str

@damage_agent.on_message(model=DamageRequest, replies=DamageResponse)
async def verify_damage(ctx: Context, sender: str, msg: DamageRequest):
    """Verify property damage for deposit refund"""
    
    ctx.logger.info(f"🔍 Verifying damage for policy {msg.policy_id}")
    ctx.logger.info(f"📸 Before image: {msg.before_image}")
    ctx.logger.info(f"📸 After image: {msg.after_image}")
    
    # Simple damage assessment logic
    # In a real system, this would use image comparison
    if msg.before_image == msg.after_image:
        decision = "full_payout"
        approved_amount = msg.claim_amount
        deduction = 0
    else:
        decision = "deduct_payout"
        deduction = msg.claim_amount * 0.2
        approved_amount = msg.claim_amount - deduction
    
    response = DamageResponse(
        decision=decision,
        approved_amount=approved_amount,
        deduction=deduction,
        policy_id=msg.policy_id
    )
    
    ctx.logger.info(f"✅ Damage assessment complete: {decision}")
    ctx.logger.info(f"💰 Approved amount: ${approved_amount}")
    
    await ctx.send(sender, response)

if __name__ == "__main__":
    print("🏠 Starting Damage Verification Agent")
    print("=" * 40)
    print(f"Agent: {damage_agent.name}")
    print(f"Address: {damage_agent.address}")
    print(f"Port: 8000")
    print("\n🚀 Agent is running...")
    
    damage_agent.run()
