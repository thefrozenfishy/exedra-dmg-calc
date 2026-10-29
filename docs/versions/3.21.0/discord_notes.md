**Client update - 3.21.0**
What the new game version changes in how battles and menus work. New kioku, events and stages are in the data-update notes.

**⬆️ New mechanic: Step-Up skills**
A unit with a Step-Up skill gets a button next to its Battle Skill. Each press raises the skill one step and swaps it for a stronger version.
- Cost: that version's own SP **plus 1 SP per step**, so Step 1 costs +1 SP and Step 2 costs +2 SP on top.
- The button greys out when the team can't pay for the next step or the skill is at its top step. Cancel goes back to the normal skill.
- **On auto**, the unit takes the highest step the team can afford, but only when its role's trigger is met. Otherwise it uses the normal skill:
  - Attacker: an enemy is in Break
  - Breaker: no enemy is in Break yet
  - Healer: an ally is below 50% HP
  - Buffer / Debuffer: one of its own buffs / debuffs has 1 turn left
  - Defender: an ally has no barrier
So an Attacker on auto never steps up outside Break. Play it manually if you want the big step earlier.

**🩸 New mechanic: skills that cost HP**
- A skill can spend the user's own HP: a % of max HP, a flat amount, or both, rounded up. It shows as its own HP-loss number.
- It **never takes a unit below 1 HP**. At 1 HP the skill still works and costs nothing.
- Passives can now trigger on "paid HP this action".
- In Link Raid, HP a boss spends on its own skills counts toward the raid's total damage.

**🔗 Link Raid: shared HP bars**
Bosses can now have several parts on one HP bar. Damage to any part counts toward your total, and when the bar empties, every part falls. There is also an EX Bonus for featured characters, but it is still 0 in every season.

**🔒 Magic Seal**
Auto battle and enemies now aim Magic Seal only at units it can land on. No unit uses Magic Seal yet.

**🛒 Outside battle**
- Shop: bulk exchange, a Recommended exchange tab, and a reminder for unclaimed free Web Shop items.
- Profile: shows your highest cleared Mirror Tower floor.
- Some bosses can now have their own defeat cutscene.
- Characters can have different voice lines per costume.

**🧮 Simulator**
exedra-dmg-calc runs on 3.21.0. Step-Up (auto and manual), HP costs and shared-HP bosses work as in the game.
