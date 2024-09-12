import json
import sys

def count_events(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            event_count = len(data.get("events", []))
        return event_count
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading events file: {e}")
        return 0

def count_workflow_items(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            if isinstance(data, list):
                workflow_count = len(data)
            else:
                workflow_count = 0
        return workflow_count
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading workflow list file: {e}")
        return 0

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <events_file_path> <workflow_list_file_path>")
        sys.exit(1)
    
    events_file_path = sys.argv[1]
    workflow_list_file_path = sys.argv[2]

    event_count = count_events(events_file_path)
    workflow_count = count_workflow_items(workflow_list_file_path)
    
    print(f"Number of events: {event_count}")
    print(f"Number of workflow list items: {workflow_count}")
