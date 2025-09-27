#!/usr/bin/env python3
"""
Final test script for the working uAgents system
"""

import os
from dotenv import load_dotenv

load_dotenv()

def test_imports():
    """Test that all working modules can be imported"""
    try:
        import damage_verifier
        print("✅ Damage verifier agent imports successfully")
    except Exception as e:
        print(f"❌ Damage verifier agent import failed: {e}")
        return False
    
    try:
        import payment_processor
        print("✅ Payment processor agent imports successfully")
    except Exception as e:
        print(f"❌ Payment processor agent import failed: {e}")
        return False
    
    try:
        import client
        print("✅ Client imports successfully")
    except Exception as e:
        print(f"❌ Client import failed: {e}")
        return False
    
    try:
        import run_system
        print("✅ System runner imports successfully")
    except Exception as e:
        print(f"❌ System runner import failed: {e}")
        return False
    
    return True

def test_environment():
    """Test environment variables"""
    seed = os.getenv("AGENT_SEED")
    if seed:
        print("✅ AGENT_SEED is set")
        return True
    else:
        print("❌ AGENT_SEED is not set")
        return False

def test_agent_creation():
    """Test that agents can be created"""
    try:
        from damage_verifier import damage_agent
        print(f"✅ DamageVerifier created: {damage_agent.name}")
    except Exception as e:
        print(f"❌ DamageVerifier creation failed: {e}")
        return False
    
    try:
        from payment_processor import payment_agent
        print(f"✅ PaymentProcessor created: {payment_agent.name}")
    except Exception as e:
        print(f"❌ PaymentProcessor creation failed: {e}")
        return False
    
    try:
        from client import client_agent
        print(f"✅ TestClient created: {client_agent.name}")
    except Exception as e:
        print(f"❌ TestClient creation failed: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 Testing uAgents Security Deposit System")
    print("=" * 55)
    
    tests = [
        ("Import Tests", test_imports),
        ("Environment Tests", test_environment),
        ("Agent Creation Tests", test_agent_creation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}:")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System is ready.")
        print("\n💡 To run the system:")
        print("   1. Start agents: python run_system.py")
        print("   2. Test system: python client.py")
        print("\n🏠 This system processes tenant security deposit refunds:")
        print("   - DamageVerifier: Assesses property damage")
        print("   - PaymentProcessor: Processes deposit refunds")
        print("   - TestClient: Coordinates the workflow")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
    
    return passed == total

if __name__ == "__main__":
    main()
