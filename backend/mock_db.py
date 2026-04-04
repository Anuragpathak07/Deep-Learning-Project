import random
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Mock Data Pools for Randomization
FIRST_NAMES = ["Amit", "Rahul", "Priya", "Sneha", "Vikram", "Neha", "Sachin", "Kavita", "Rohan", "Anjali", "Suresh", "Pooja", "Gaurav", "Simran", "Deepak", "Riya", "Karan", "Aarti", "Manish", "Divya"]
LAST_NAMES = ["Sharma", "Verma", "Singh", "Gupta", "Kumar", "Patel", "Joshi", "Mishra", "Chauhan", "Yadav", "Tiwari", "Reddy", "Nair", "Rao", "Das"]
VEHICLE_BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Kia", "Toyota", "Honda", "Volkswagen", "Skoda", "Renault"]
VEHICLE_MODELS = {
    "Maruti Suzuki": ["Swift", "Baleno", "Alto", "WagonR", "Dzire", "Brezza", "Ertiga"],
    "Hyundai": ["i20", "Creta", "Venue", "Grand i10", "Verna", "Tucson"],
    "Tata": ["Nexon", "Punch", "Harrier", "Altroz", "Tiago", "Safari"],
    "Mahindra": ["Thar", "XUV700", "Scorpio", "Bolero", "XUV300"],
    "Kia": ["Seltos", "Sonet", "Carens", "EV6"],
    "Toyota": ["Innova Crysta", "Fortuner", "Glanza", "Urban Cruiser", "Camry"],
    "Honda": ["City", "Amaze", "Elevate", "Jazz"],
    "Volkswagen": ["Polo", "Taigun", "Virtus", "Vento"],
    "Skoda": ["Slavia", "Kushaq", "Octavia", "Superb"],
    "Renault": ["Kwid", "Kiger", "Triber"]
}

def get_owner_details(plate_number: str) -> dict:
    """
    Returns mock owner details based on the plate number.
    Uses the string hash of the plate number to seed the random number generator,
    ensuring that the same plate number will always return the same randomized details.
    """
    # Use the plate number as a seed so it's consistent for the same plate
    random.seed(plate_number)
    
    owner_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    brand = random.choice(VEHICLE_BRANDS)
    model = random.choice(VEHICLE_MODELS[brand])
    vehicle_type = f"{brand} {model}"
    
    # Generate a random registration date between 1 and 15 years ago
    days_ago = random.randint(365, 365 * 15)
    reg_date_obj = datetime.now() - timedelta(days=days_ago)
    registration_date = reg_date_obj.strftime("%d-%b-%Y").upper() # Format like "12-AUG-2018"
    
    # Random RC Status (mostly ACTIVE, rarely EXPIRED or SUSPENDED)
    status_choices = ["ACTIVE"] * 90 + ["EXPIRED"] * 8 + ["SUSPENDED"] * 2
    rc_status = random.choice(status_choices)
    
    # Reset the random seed for other parts of the application
    random.seed()
    
    logger.info(f"Generated mock details for plate {plate_number}: {owner_name}, {vehicle_type}")
    
    return {
        "owner_name": owner_name,
        "vehicle_type": vehicle_type,
        "registration_date": registration_date,
        "rc_status": rc_status
    }
