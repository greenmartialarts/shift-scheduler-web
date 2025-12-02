import csv
import random
from datetime import datetime, timedelta

def generate_volunteers():
    volunteers = []
    # 65 Delegates (Max 10h -> 650h capacity)
    for i in range(1, 66):
        volunteers.append([f"v{i}", f"Delegate {i}", "Delegates", "10"])
    # 56 Adults (Max 12h -> 672h capacity)
    for i in range(66, 122):
        volunteers.append([f"v{i}", f"Adult {i}", "Adults", "12"])
    
    with open('sample_volunteers.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'name', 'group', 'max_hours'])
        writer.writerows(volunteers)
    print(f"Generated {len(volunteers)} volunteers.")

def generate_shifts():
    shifts = []
    base_time = datetime(2025, 12, 1, 8, 0) # Dec 1st, 8 AM
    
    for i in range(1, 151):
        # Create shifts across 3 days
        day_offset = (i - 1) // 50
        hour_offset = ((i - 1) % 10) * 2 # 10 shifts per "track", 2 hours each
        
        start = base_time + timedelta(days=day_offset, hours=hour_offset)
        end = start + timedelta(hours=2)
        
        # Requirement: 2 of each group
        req = "Delegates:2|Adults:2"
        allowed = "Delegates|Adults"
            
        shifts.append([
            f"s{i}",
            start.isoformat(),
            end.isoformat(),
            req,
            allowed,
            "" # excluded_groups
        ])
        
    with open('sample_shifts.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'start', 'end', 'required_groups', 'allowed_groups', 'excluded_groups'])
        writer.writerows(shifts)
    print(f"Generated {len(shifts)} shifts.")

if __name__ == "__main__":
    generate_volunteers()
    generate_shifts()
