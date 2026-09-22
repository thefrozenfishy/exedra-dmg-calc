import json

with open("debugging/exedra_dmg_calc_debug.json", "r", encoding="utf-8") as f:
    d = json.load(f)
    for file, li in d.items():
        with open(f"debugging/{file}.json", "w", encoding="utf-8") as g:
            try:
                json.dump(json.loads(li), g)
            except json.decoder.JSONDecodeError:
                g.write(li)
