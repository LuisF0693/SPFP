import re
import os

stories = {}

# Read all story files
for f in sorted(os.listdir('.')):
    if f.startswith('story-') and f.endswith('.md') and 'batch' not in f and 'summary' not in f:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Extract key fields
        story_id_match = re.search(r'\*\*Story ID:\*\*\s*(\w+-\d+)', content)
        effort_match = re.search(r'\*\*Effort:\*\*\s*(\d+)\s*hours?', content)
        priority_match = re.search(r'\*\*Priority:\*\*\s*(\w+)', content)
        sprint_match = re.search(r'\*\*Sprint:\*\*\s*([^*\n]+)', content)
        title_match = re.search(r'^#\s+Story\s+\d+[:\s]+(.+?)$', content, re.MULTILINE)
        type_match = re.search(r'\*\*Type:\*\*\s*([^*\n]+)', content)
        
        # Count acceptance criteria
        criteria_count = len(re.findall(r'- \[\s?\]', content))
        
        story_id = story_id_match.group(1) if story_id_match else 'UNKNOWN'
        effort = int(effort_match.group(1)) if effort_match else 0
        priority = priority_match.group(1) if priority_match else 'P2'
        sprint = sprint_match.group(1).strip() if sprint_match else 'TBD'
        title = title_match.group(1).strip() if title_match else 'Unknown'
        story_type = type_match.group(1).strip() if type_match else 'Tech Debt'
        
        stories[story_id] = {
            'file': f,
            'title': title,
            'sprint': sprint,
            'effort': effort,
            'priority': priority,
            'type': story_type,
            'criteria_count': criteria_count
        }

# Print results
print(f"Total stories found: {len(stories)}\n")
print("STORY_ID,TITLE,SPRINT,EFFORT_HOURS,PRIORITY,TYPE,CRITERIA_COUNT")
for story_id, data in sorted(stories.items()):
    print(f"{story_id},\"{data['title']}\",{data['sprint']},{data['effort']},{data['priority']},\"{data['type']}\",{data['criteria_count']}")

# Summary stats
total_effort = sum(s['effort'] for s in stories.values())
print(f"\n\nTOTAL EFFORT HOURS: {total_effort}")
print(f"AVERAGE EFFORT PER STORY: {total_effort/len(stories):.1f}h")

# By priority
p0 = sum(s['effort'] for s in stories.values() if s['priority'] == 'P0')
p1 = sum(s['effort'] for s in stories.values() if s['priority'] == 'P1')
p2 = sum(s['effort'] for s in stories.values() if s['priority'] == 'P2')
p3 = sum(s['effort'] for s in stories.values() if s['priority'] == 'P3')
print(f"\nP0 CRITICAL: {p0}h ({p0/total_effort*100:.1f}%)")
print(f"P1 HIGH: {p1}h ({p1/total_effort*100:.1f}%)")
print(f"P2 MEDIUM: {p2}h ({p2/total_effort*100:.1f}%)")
print(f"P3 LOW: {p3}h ({p3/total_effort*100:.1f}%)")
