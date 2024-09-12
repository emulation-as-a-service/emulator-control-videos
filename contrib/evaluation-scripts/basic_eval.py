import json
import sys

def analyze_json(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            
            good_count = sum(item['accuracy'] == 'good' for item in data)
            inaccurate_count = sum(item['accuracy'] == 'inaccurate' for item in data)
            
            print(f'Number of objects with "accuracy": "good": {good_count}')
            print(f'Number of objects with "accuracy": "inaccurate": {inaccurate_count}')
    
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
    except json.JSONDecodeError:
        print("Error: Failed to decode JSON.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_json_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    analyze_json(file_path)
