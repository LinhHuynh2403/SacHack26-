import sys

with open("main.py", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith("@app.on_event(\"startup\")"):
        skip = True
        continue
    if skip and line.startswith("async def startup_event():"):
        continue
    if skip and line.strip() == "init_rag()":
        skip = False
        continue
    if skip and line.strip() == "":
        continue
        
    new_lines.append(line)

with open("main.py", "w") as f:
    f.writelines(new_lines)
