"""Post the client-update notes (docs/versions/<ver>/discord_notes.md) to the patch-notes
Discord webhooks, the same way ma-ex-data/patch_notes.py posts the data-update notes.

The webhooks and the posting code come from ma-ex-data (daily_runner/webhooks.json ->
"patch_notes" -> "public", or "private" with --private), so both posts go to the same
channels with the same name and message splitting.

Discord can't be reached from the Linux VM or the cloud container, so this runs on Windows:
E:\\unpackedExedra\\post_notes.bat (double-clicked in Explorer) calls it.

    python post_client_notes.py <notes.md>             # post to the public webhooks
    python post_client_notes.py <notes.md> --private   # test post
    python post_client_notes.py <notes.md> --no-post   # only check the file
"""
import argparse
import os
import sys

MA_EX_DATA = os.environ.get("MA_EX_DATA", r"E:\ma-ex-data" if os.name == "nt"
                            else os.path.expanduser("~/mnt/ma-ex-data"))
MAX_LEN = 6000


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("notes")
    ap.add_argument("--private", action="store_true")
    ap.add_argument("--no-post", action="store_true")
    args = ap.parse_args()

    with open(args.notes, encoding="utf-8-sig") as f:
        notes = f.read().strip()
    if not notes.startswith("**Client update"):
        print("Notes must start with the title line **Client update - <ver>**.")
        return 2
    if len(notes) > MAX_LEN:
        print(f"Notes are {len(notes)} chars, over {MAX_LEN} - shorten them.")
        return 2

    sys.path.insert(0, MA_EX_DATA)
    os.chdir(MA_EX_DATA)  # patch_notes' WEBHOOKS_FILE is relative
    import patch_notes as pn

    chunks = pn.split_message(notes)
    print(f"{len(notes)} chars, {len(chunks)} message(s).")
    if args.no_post:
        return 0
    urls = pn.webhook_urls(args.private)
    if not urls:
        print(f'No webhook in {pn.WEBHOOKS_FILE} -> patch_notes -> '
              f'{"private" if args.private else "public"} - not posting.')
        return 3
    failed = 0
    for n, url in enumerate(urls, 1):
        name = "/".join(url.rstrip("/").split("/")[-2:-1]) or f"#{n}"  # never print the token
        try:
            pn.post(url, notes)
            print(f"Posted to webhook {name} ({n}/{len(urls)}).")
        except Exception as e:
            failed += 1
            print(f"Posting to webhook {name} failed: {e}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
