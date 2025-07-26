from max_dmg_calc import Team, Kioku, kioku_data, run_single

attacker = "Absolute Rain"

atk_element = kioku_data[attacker]["element"]


team = Team(
    [
        Kioku(
            attacker,
            dps_element=atk_element,
            is_dps=True,
            heartphial_lvl=50,
            support=Kioku(
                "Oracle Ray",
                dps_element=atk_element,
                kioku_lvl=120,
                magic_lvl=120,
            ),
            portrait="The Savior's Apostle",
            kioku_lvl=106,
            magic_lvl=120,
            ascension=0,
            crys=(
                "ATK%-25",
                "Elem-24",
                "CD-20",
            ),
        ),
        Kioku(
            "Judgement Earth",
            dps_element=atk_element,
            kioku_lvl=120,
            magic_lvl=120,
            ascension=0,
        ),
        Kioku(
            "Unknown Flying Fire",
            dps_element=atk_element,
            kioku_lvl=120,
            magic_lvl=120,
            ascension=5,
        ),
        Kioku(
            "Soul Salvation",
            dps_element=atk_element,
            kioku_lvl=120,
            magic_lvl=120,
            ascension=2,
        ),
        Kioku(
            "Brilliant Beam",
            dps_element=atk_element,
            kioku_lvl=120,
            magic_lvl=120,
            ascension=5,
            support=Kioku(
                "Flame Waltz",
                dps_element=atk_element,
                kioku_lvl=120,
                magic_lvl=120,
            ),
        ),
    ],
    debug=False,
)

stage_def = 1500  # Check wiki
stage_max_break = 3  # 300% = 3
enemy_count = 1

run_single(
    team, base_def=stage_def, max_break_mult=stage_max_break, enemy_count=enemy_count
)
