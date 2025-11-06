import json
import os
import subprocess
from pathlib import Path

tier_lists = [
    t.removesuffix(".md") for t in os.listdir("src/content/tierlists/descriptions")
]

base_json = Path("src/assets/base_data/kioku_data.json")
content_dir = Path("src/content/tierlists/kioku")
template_dir = Path("src/content/templates")

repo = os.environ.get("REPO")
token = os.environ.get("GITHUB_TOKEN")
base_branch = os.environ.get("BASE_BRANCH", "main")

if not base_json.exists():
    raise FileNotFoundError(f"Missing {base_json}")

kiokus: dict = json.loads(base_json.read_text(encoding="utf-8"))


def run(cmd, check=True, capture=False):
    if capture:
        return subprocess.run(
            cmd, check=check, text=True, stdout=subprocess.PIPE
        ).stdout.strip()
    subprocess.run(cmd, check=check)


# for kioku_name, info in kiokus.values():
#     if info["rarity"] != 5:
#         continue
for kioku_name in ("Pluvia☆Magica", "Brilliant Beam", "Tiro Finale"):
    dir_path = content_dir / kioku_name.replace("'", "´")
    for tier in tier_lists:
        file_path = dir_path / f"{tier}.md"
        if file_path.exists():
            print(f"✅ Exists: {file_path}")
            continue
        pr_title = f"Add {kioku_name} {tier} markdown"
        pr_check = run(
            [
                "gh",
                "pr",
                "list",
                "--repo",
                repo,
                "--search",
                pr_title,
                "--json",
                "title",
            ],
            capture=True,
        )
        if pr_title in pr_check:
            continue

        dir_path.mkdir(parents=True, exist_ok=True)

        template_file = template_dir / f"{tier}.md"
        if not template_file.exists():
            raise FileNotFoundError(f"Missing {template_file}")

        template = template_file.read_text(encoding="utf-8")
        content = template.replace("{{NAME}}", kioku_name)
        file_path.write_text(content, encoding="utf-8")
        branch_name = f"auto/kioku-{kioku_name.replace(' ', '-').lower()}-{tier}"

        run(["git", "fetch", "origin", base_branch])
        run(["git", "checkout", "-b", branch_name, f"origin/{base_branch}"])

        run(["git", "add", str(file_path)])
        run(
            [
                "git",
                "-c",
                "user.name=Tier List Adder",
                "-c",
                "user.email=tier-list-adder-worker@users.noreply.github.com",
                "commit",
                "-m",
                pr_title,
            ]
        )
        run(["git", "push", "origin", branch_name])

        run(
            [
                "gh",
                "pr",
                "create",
                "--repo",
                repo,
                "--title",
                pr_title,
                "--body",
                f"Automatically generated {tier} markdown for **{kioku_name}**.",
                "--base",
                base_branch,
                "--head",
                branch_name,
            ]
        )
