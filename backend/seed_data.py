import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Equipment, CustomUser

def seed_database():
    print("Clearing old catalog...")
    Equipment.objects.all().delete()

    catalog = [
        {
            "name": "NVIDIA DGX A100 GPU Node",
            "description": "High-performance computing node reserved for advanced MLOps and deep learning research models. Requires staff approval.",
            "is_available": True,
        },
        {
            "name": "Hadoop Cluster Edge Server",
            "description": "Pre-configured rack server for Big Data infrastructure testing and HDFS deployment practice.",
            "is_available": True,
        },
        {
            "name": "Arduino Mega IoT Starter Kit",
            "description": "Complete micro-controller kit including breadboard, jumper wires, RFID sensors, and LCD modules.",
            "is_available": True,
        },
        {
            "name": "Sony Alpha A7 IV Camera",
            "description": "Full-frame mirrorless camera for digital media projects. Includes 24-70mm G-Master lens and 128GB SD card.",
            "is_available": True,
        },
        {
            "name": "Fluke 117 Digital Multimeter",
            "description": "True RMS digital multimeter for electrical engineering lab assignments. Calibrated for 2026.",
            "is_available": True,
        },
        {
            "name": "Oculus Quest 3 VR Headset",
            "description": "Standalone virtual reality headset for immersive software development, Unity prototyping, and testing.",
            "is_available": True,
        }
    ]

    print("Injecting new equipment catalog...")
    for item in catalog:
        Equipment.objects.create(**item)
        print(f"✅ Added: {item['name']}")

    print("\nDatabase Seeding Complete! Your Nexus Hub is fully stocked.")

if __name__ == '__main__':
    seed_database()