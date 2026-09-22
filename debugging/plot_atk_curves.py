import json
from pathlib import Path

import matplotlib.pyplot as plt

KIOKU_LEVEL_BREAKPOINTS = [1, 120, 140, 160, 180, 200]


def linear_interpolation(a, b, t):
    return a + (b - a) * t


def kioku_stat(level, values):
    if level <= 1:
        return values[0]

    for i, bp in enumerate(KIOKU_LEVEL_BREAKPOINTS):
        if level <= bp:
            prev = KIOKU_LEVEL_BREAKPOINTS[i - 1]
            t = (level - prev) / (bp - prev)
            return linear_interpolation(values[i - 1], values[i], t)

    return values[-1]


with open("src/assets/base_data/kioku_data.json", encoding="utf8") as f:
    data = json.load(f)


ROLES = sorted({d["role"] for d in data.values()})
RARITIES = [None, 3, 4, 5]


def get_characters(role, rarity):
    chars = [
        (name, d)
        for name, d in data.items()
        if d.get("role") == role and (rarity is None or d.get("rarity") == rarity)
    ]
    return sorted(chars, key=lambda x: x[0])


MAX_LVL = 160
levels = list(range(1, 201))


def plot_stat(stat_key, pretty_name, characters, out_dir):
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    # ---------- Absolute ----------
    plt.figure(figsize=(13, 8))

    for name, d in characters:
        values = [
            d[f"min{pretty_name}"],
            d[f"{stat_key}120"],
            d[f"{stat_key}140"],
            d[f"{stat_key}160"],
            d[f"{stat_key}180"],
            d[f"{stat_key}200"],
        ]

        curve = [kioku_stat(lvl, values) for lvl in levels]

        plt.plot(levels, curve, lw=1.5, label=name)

    plt.title(f"Attacker {pretty_name}")
    plt.xlabel("Level")
    plt.ylabel(pretty_name)
    plt.grid(alpha=0.3)
    plt.xlim(1, MAX_LVL)
    plt.legend(fontsize=7, ncol=2)
    plt.tight_layout()
    plt.savefig(Path(out_dir) / f"{stat_key}_absolute.png", dpi=250)
    plt.close()

    # ---------- Normalized ----------
    plt.figure(figsize=(13, 8))

    for name, d in characters:
        values = [
            d[f"min{pretty_name}"],
            d[f"{stat_key}120"],
            d[f"{stat_key}140"],
            d[f"{stat_key}160"],
            d[f"{stat_key}180"],
            d[f"{stat_key}200"],
        ]

        curve = [kioku_stat(lvl, values) for lvl in levels]
        base = curve[0]
        normalized = [v / base for v in curve]

        plt.plot(levels, normalized, lw=1.5, label=name)

    plt.title(f"Normalized Attacker {pretty_name} Growth")
    plt.xlabel("Level")
    plt.ylabel(f"{pretty_name} (Level 1 = 1.0)")
    plt.grid(alpha=0.3)
    plt.xlim(1, MAX_LVL)
    plt.legend(fontsize=7, ncol=2)
    plt.tight_layout()
    plt.savefig(Path(out_dir) / f"{stat_key}_normalized.png", dpi=250)
    plt.close()

    # ---------- Difference from average ----------
    plt.figure(figsize=(13, 8))

    curves = []

    for name, d in characters:
        values = [
            d[f"min{pretty_name}"],
            d[f"{stat_key}120"],
            d[f"{stat_key}140"],
            d[f"{stat_key}160"],
            d[f"{stat_key}180"],
            d[f"{stat_key}200"],
        ]

        curve = [kioku_stat(lvl, values) for lvl in levels]
        curves.append((name, curve))

    # Average value at each level
    average_curve = [
        sum(curve[i] for _, curve in curves) / len(curves) for i in range(len(levels))
    ]

    for name, curve in curves:
        diff = [100 * (curve[i] / average_curve[i] - 1) for i in range(len(levels))]

        plt.plot(levels, diff, lw=1.5, label=name)

    plt.axhline(0, color="black", linestyle="--", linewidth=1)
    plt.title(f"{pretty_name} Compared to Average Attacker")
    plt.xlabel("Level")
    plt.ylabel("% Difference from Average")
    plt.grid(alpha=0.3)
    plt.xlim(1, MAX_LVL)
    plt.legend(fontsize=7, ncol=2)
    plt.tight_layout()
    plt.savefig(Path(out_dir) / f"{stat_key}_vs_average.png", dpi=250)
    plt.close()

    # ---------- Growth per level ----------
    plt.figure(figsize=(13, 8))

    for name, d in characters:
        values = [
            d[f"min{pretty_name}"],
            d[f"{stat_key}120"],
            d[f"{stat_key}140"],
            d[f"{stat_key}160"],
            d[f"{stat_key}180"],
            d[f"{stat_key}200"],
        ]

        curve = [kioku_stat(lvl, values) for lvl in levels]
        growth = [curve[i + 1] - curve[i] for i in range(len(curve) - 1)]

        plt.plot(levels[:-1], growth, lw=1.5, label=name)

    plt.title(f"{pretty_name} Growth per Level")
    plt.xlabel("Level")
    plt.ylabel(f"+{pretty_name} / level")
    plt.grid(alpha=0.3)
    plt.xlim(1, MAX_LVL - 1)
    plt.legend(fontsize=7, ncol=2)
    plt.tight_layout()
    plt.savefig(Path(out_dir) / f"{stat_key}_growth_per_level.png", dpi=250)
    plt.close()
    plt.figure(figsize=(13, 8))

    # Per lvl
    for name, d in characters:
        values = [
            d[f"min{pretty_name}"],
            d[f"{stat_key}120"],
            d[f"{stat_key}140"],
            d[f"{stat_key}160"],
            d[f"{stat_key}180"],
            d[f"{stat_key}200"],
        ]

        curve = [kioku_stat(lvl, values) for lvl in levels]
        growth = [(curve[i + 1] / curve[i] - 1) * 100 for i in range(len(curve) - 1)]

        plt.plot(levels[:-1], growth, lw=1.5, label=name)

    plt.title(f"{pretty_name} Percent Growth per Level")
    plt.xlabel("Level")
    plt.ylabel("% increase / level")
    plt.grid(alpha=0.3)
    plt.xlim(1, MAX_LVL - 1)
    plt.legend(fontsize=7, ncol=2)
    plt.tight_layout()
    plt.savefig(Path(out_dir) / f"{stat_key}_growth_percent.png", dpi=250)
    plt.close()


for role in ROLES:
    for rarity in RARITIES:
        chars = get_characters(role, rarity)

        if not chars:
            continue

        folder = (
            Path("debugging/stats")
            / role.lower()
            / ("all" if rarity is None else f"rarity{rarity}")
        )

        plot_stat("atk", "Atk", chars, folder)
        plot_stat("hp", "Hp", chars, folder)
        plot_stat("def", "Def", chars, folder)

print("Done!")
