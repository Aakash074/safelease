#!/usr/bin/env python3
"""
Run the working uAgents system
"""

import subprocess
import time
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def check_env_vars():
    """Check if required environment variables are set"""
    required_vars = ["AGENT_SEED"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them in your .env file")
        return False
    
    print("✅ Environment variables are set")
    return True

def run_agent(script_name, agent_name):
    """Run an agent in a subprocess"""
    print(f"🚀 Starting {agent_name}...")
    try:
        process = subprocess.Popen(
            [sys.executable, script_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print(f"✅ {agent_name} started with PID {process.pid}")
        return process
    except Exception as e:
        print(f"❌ Failed to start {agent_name}: {e}")
        return None

def main():
    """Main function to run the working multi-agent system"""
    
    print("🏠 Working Security Deposit Refund System")
    print("=" * 45)
    
    # Check environment variables
    if not check_env_vars():
        sys.exit(1)
    
    # Start agents
    processes = []
    
    try:
        # Start damage verification agent
        damage_process = run_agent("damage_verifier.py", "DamageVerifier")
        if damage_process:
            processes.append(("DamageVerifier", damage_process))
        
        time.sleep(2)  # Give agents time to start
        
        # Start payment processing agent
        payment_process = run_agent("payment_processor.py", "PaymentProcessor")
        if payment_process:
            processes.append(("PaymentProcessor", payment_process))
        
        time.sleep(2)
        
        print("\n🎯 All agents are running!")
        print("📋 Available agents:")
        for name, _ in processes:
            print(f"  - {name}")
        
        print("\n💡 To test the system:")
        print("   python client.py")
        
        print("\n⏹️  Press Ctrl+C to stop all agents")
        
        # Keep running until interrupted
        while True:
            time.sleep(1)
            
            # Check if any process has died
            for name, process in processes:
                if process.poll() is not None:
                    print(f"⚠️  {name} has stopped unexpectedly")
    
    except KeyboardInterrupt:
        print("\n🛑 Shutting down agents...")
        
        # Terminate all processes
        for name, process in processes:
            print(f"🛑 Stopping {name}...")
            process.terminate()
            try:
                process.wait(timeout=5)
                print(f"✅ {name} stopped")
            except subprocess.TimeoutExpired:
                print(f"⚠️  Force killing {name}...")
                process.kill()
                process.wait()
        
        print("👋 All agents stopped")

if __name__ == "__main__":
    main()
