import csv
import random
from datetime import datetime, timedelta

def generate_volunteers():
    volunteers = []
    # 10 Delegates (Max 5h -> 50h capacity)
    for i in range(1, 11):
        volunteers.append([
            f"Delegate {i}",
            "Delegates",
            "5",
            f"delegate{i}@example.com",
            f"(555) 101-{i:04d}"
        ])
    # 10 Adults (Max 6h -> 60h capacity)
    for i in range(11, 21):
        volunteers.append([
            f"Adult {i}",
            "Adults",
            "6",
            f"adult{i}@example.com",
            f"(555) 201-{i:04d}"
        ])
    
    with open('sample_volunteers_impossible.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Group', 'Max Hours', 'Email', 'Phone'])
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
        req = "Delegates:2, Adults:2"
            
        shifts.append([
            f"Shift {i}",
            start.strftime("%m/%d/%Y %I:%M %p"),
            end.strftime("%m/%d/%Y %I:%M %p"),
            req
        ])
        
    with open('sample_shifts_impossible.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Start', 'End', 'Groups'])
        writer.writerows(shifts)
    print(f"Generated {len(shifts)} shifts.")

if __name__ == "__main__":
    generate_volunteers()
    generate_shifts()
