import json
import base64
import os

file_path = r'C:\Users\김다은\.gemini\antigravity-ide\brain\39555dc7-f03b-44b7-aebf-8cae570d8c0b\.system_generated\steps\15\content.md'
output_dir = r'c:\GitHub blog\images'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    start_idx = content.find('{"nbformat"')
    if start_idx != -1:
        json_str = content[start_idx:]
        data = json.loads(json_str)
        
        image_count = 0
        for cell in data.get('cells', []):
            outputs = cell.get('outputs', [])
            for output in outputs:
                if 'data' in output and 'image/png' in output['data']:
                    image_count += 1
                    base64_data = output['data']['image/png']
                    
                    filename = ''
                    if image_count == 1:
                        filename = 'seoul-real-estate-eda-chart1.png'
                    elif image_count == 2:
                        filename = 'seoul-real-estate-eda-chart2.png'
                    elif image_count == 3:
                        filename = 'seoul-real-estate-eda-chart3.png'
                    elif image_count == 4:
                        filename = 'seoul-real-estate-eda-chart4.png'
                    
                    if filename:
                        filepath = os.path.join(output_dir, filename)
                        with open(filepath, "wb") as fh:
                            fh.write(base64.b64decode(base64_data))
                        print(f"Saved {filepath}")

        # Create thumbnail by copying chart1
        import shutil
        src = os.path.join(output_dir, 'seoul-real-estate-eda-chart1.png')
        dst = os.path.join(output_dir, 'seoul-real-estate-eda-thumbnail.png')
        if os.path.exists(src):
            shutil.copy(src, dst)
            print(f"Saved thumbnail {dst}")
            
except Exception as e:
    print(f"Error: {e}")
