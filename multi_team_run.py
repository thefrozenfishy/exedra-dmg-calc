from max_dmg_calc import run

run(
    magic_lvl=120,
    kioku_lvl=105,
    enemies_on_stage=1,
    include_4star_attackers=True,
    include_4star_sustains=False,
    include_4star_supports=True,
    name="tff",
    base_def=1500,
    max_break_mult=300,
    stage_weak_elements=["Aqua", "Forest", "Flame"],
    mostlyA5s=False,
    find_weakest=False,
    find_strongest=False,
)
