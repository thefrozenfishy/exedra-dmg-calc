# Old single-hit model vs 1:1 engine

Generated 2026-10-16 10:47 by `npx tsx scripts/sim/compareOldModel.ts`.

Setup on both sides: max levels (kioku 160, magic 140, heartphial 50, ultimate 10; the character A5, Lux A0), only the kit, one enemy with 3000 DEF, weak, broken at 500%, every hit a crit, the Ultimate.

"Why" knocks out one effect type at a time (from every team member) in both models and lists the types whose impact differs: e.g. `UP_ATK_ACCUM_RATIO (old -75%, engine -19%)` means removing that type costs 75% of the damage in the old model but 19% in the engine.

## Dealer: the character's Ultimate next to four Lux

| Character | Engine vs old | Old | Engine | Crit rate old / engine | Why |
|---|---|---|---|---|---|
| Seraphic Trial | -61.2% | 151,333 | 58,698 | 10% / 10% | UP_ATK_ACCUM_RATIO (old -75.0%, engine -19.3%); UP_ATK_RATIO (old 0.0%, engine -16.1%) |
| Tiro Finale Liberation | +74.0% | 284,712 | 495,278 | 10% / 10% | UP_GIV_DMG_RATIO (old -23.1%, engine -48.7%); UP_ATK_RATIO (old -20.0%, engine -31.0%) |
| Désintégration | -42.4% | 269,384 | 155,217 | 10% / 10% | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -18.7%); DWN_ELEMENT_RESIST_ACCUM_RATIO (old 0.0%, engine -9.1%) |
| Falsified Phenomena | +68.9% | 220,696 | 372,735 | 40% / 40% | UP_CTD_FIXED (old 0.0%, engine -25.0%); UP_GIV_DMG_RATIO (old -13.3%, engine -31.6%); UP_ELEMENT_DMG_RATE_RATIO (old -20.0%, engine -15.8%) |
| Luce della Speranza | -37.4% | 156,064 | 97,637 | 10% / 10% | TSUBAME_LINK (old -37.4%, engine 0.0%); UP_ATK_RATIO (old -37.4%, engine 0.0%); ADDITIONAL_DAMAGE (old -37.4%, engine 0.0%); TSUBAME (old -37.4%, engine 0.0%) |
| Oracle Ray | +59.3% | 264,634 | 421,677 | 10% / 10% | UP_GIV_DMG_RATIO (old -44.4%, engine -60.8%); UP_ATK_ACCUM_RATIO (old 0.0%, engine -11.1%); UP_ATK_RATIO (old -16.6%, engine -14.8%) |
| Marigold Dadaism | +51.5% | 135,255 | 204,884 | 10% / 10% | UP_GIV_DMG_RATIO (old -23.1%, engine -40.1%); UP_GIV_SLIP_DMG_RATIO (old 0.0%, engine -2.6%) |
| La Danse Macabre | +39.9% | 218,676 | 306,023 | 10% / 10% | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -21.2%); UP_ATK_ACCUM_RATIO (old 0.0%, engine -16.6%); UP_WEAK_ELEMENT_DMG_RATIO (old 0.0%, engine -14.3%) |
| Luminous Tenet | +37.3% | 249,966 | 343,154 | 50% / 50% | UP_AIM_RCV_DMG_RATIO (old 0.0%, engine -16.7%); UP_CTD_FIXED (old 0.0%, engine -9.1%); ADDITIONAL_DAMAGE (old 0.0%, engine -3.8%) |
| Scorchin' Summer Spike | +30.0% | 116,261 | 151,140 | 10% / 10% | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -25.0%); ADDITIONAL_DAMAGE (old 0.0%, engine -10.3%); UP_GIV_DMG_RATIO (old -37.5%, engine -28.8%) |
| La Porte du Paradis | +26.4% | 268,416 | 339,161 | 48% / 48% | UP_ATK_ACCUM_RATIO (old 0.0%, engine -14.3%); UP_WEAK_ELEMENT_DMG_RATIO (old 0.0%, engine -7.7%); UP_ATK_RATIO (old -16.6%, engine -14.3%) |
| Yuletide Gift | +24.9% | 262,441 | 327,899 | 10% / 10% | UP_ATK_ACCUM_RATIO (old 0.0%, engine -20.0%); UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -18.8%) |
| Invisible Assassin | +24.9% | 95,841 | 119,744 | 10% / 10% | UP_ATK_ACCUM_RATIO (old 0.0%, engine -20.0%) |
| Ryushin Spiral Fury | +24.0% | 115,209 | 142,805 | 10% / 10% | UP_ATK_RATIO (old -8.0%, engine -25.8%); UP_ATK_ACCUM_RATIO (old -12.0%, engine -9.7%) |
| Sacred Gift | +23.4% | 45,463 | 56,084 | 10% / 10% | WEAKNESS (old 0.0%, engine -18.9%) |
| Metallicized Projectile | +20.9% | 347,526 | 420,085 | 60% / 60% | UP_WEAK_ELEMENT_DMG_RATIO (old -20.0%, engine -29.4%); UP_ATK_RATIO (old -13.3%, engine -18.7%); UP_ATK_ACCUM_RATIO (old -20.0%, engine -18.7%) |
| Kugatachi | +20.8% | 307,171 | 371,164 | 10% / 10% | UP_WEAK_ELEMENT_DMG_RATIO (old 0.0%, engine -17.2%) |
| Bebe-O'-Lantern | +20.0% | 141,313 | 169,509 | 10% / 10% | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -22.4%); UP_ATK_ACCUM_RATIO (old 0.0%, engine -16.6%); DWN_DEF_RATIO (old -32.4%, engine -45.5%); UP_RCV_DMG_RATIO (old -34.2%, engine -39.4%) |
| Soul Salvation | +19.9% | 132,780 | 159,267 | 10% / 10% | UP_GIV_DMG_RATIO (old 0.0%, engine -19.4%); UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -17.6%); UP_ATK_ACCUM_RATIO (old 0.0%, engine -16.6%) |
| Melodia Appassionata | +18.3% | 188,542 | 223,111 | 10% / 10% | VORTEX_ATK (old 0.0%, engine -40.8%); UP_GIV_DMG_RATIO (old 0.0%, engine -21.6%); UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -21.0%); UP_GIV_VORTEX_DMG_RATIO (old 0.0%, engine -6.6%) |
| Meteor Punch | -15.4% | 48,265 | 40,839 | 10% / 10% | UP_GIV_DMG_RATIO (old 0.0%, engine -16.7%); UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -2.5%); UP_RCV_DMG_RATIO (old -15.3%, engine -12.9%) |
| Aqua Tempest | +16.7% | 165,913 | 193,566 | 10% / 10% | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -31.0%); ADDITIONAL_DAMAGE (old 0.0%, engine -5.7%); UP_WEAK_ELEMENT_DMG_RATIO (old -38.5%, engine -34.1%) |
| Kiss-shot | +16.7% | 264,055 | 308,064 | 10% / 10% | UP_GIV_DMG_RATIO (old 0.0%, engine -14.3%); UP_GIV_DMG_ACCUM_RATIO (old -16.7%, engine -14.3%) |
| Tiro Finale | +16.7% | 111,369 | 129,930 | 10% / 10% | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -19.2%); UP_WEAK_ELEMENT_DMG_RATIO (old 0.0%, engine -14.3%) |
| The Universe's Edge | +15.8% | 349,452 | 404,629 | 10% / 10% | UP_GIV_DMG_RATIO (old -47.4%, engine -54.5%) |
| Fiore Finale | +14.7% | 385,414 | 442,097 | 10% / 10% | UP_ELEMENT_DMG_RATE_RATIO (old 0.0%, engine -12.8%); UP_GIV_DMG_RATIO (old -41.2%, engine -35.9%) |
| Dark Art Dominion | +13.8% | 289,379 | 329,294 | 70% / 70% | UP_CTD_RATIO (old 0.0%, engine -12.1%); UP_CTD_ACCUM_RATIO (old -17.2%, engine -15.2%) |
| Soaring Storyteller | +13.3% | 94,493 | 107,073 | 10% / 10% | UP_DEF_ACCUM_RATIO (old 0.0%, engine -11.7%); UP_DEF_RATIO (old -33.3%, engine -29.4%) |
| Flame Waltz | +12.5% | 125,024 | 140,652 | 77.5% / 77.5% | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -27.5%); UP_WEAK_ELEMENT_DMG_RATIO (old 0.0%, engine -11.1%) |
| Nothing to Despair, Ever | -11.1% | 475,589 | 423,003 | 35% / 50% | UP_GIV_DMG_RATIO (old -23.1%, engine 0.0%); UP_CTD_ACCUM_RATIO (old 0.0%, engine -13.5%); UP_CTD_FIXED (old -25.0%, engine -21.6%) |
| L'Ombre | +11.9% | 227,793 | 254,992 | 10% / 10% |  |
| Pluvia☆Clara | +11.5% | 35,229 | 39,294 | 10% / 10% |  |
| Nine Phases | +11.1% | 39,623 | 44,009 | 10% / 10% |  |
| Yummy Hunter | +10.7% | 53,825 | 59,592 | 35% / 45% |  |
| Brilliant Beam | +10.4% | 63,455 | 70,048 | 10% / 10% |  |
| Pluvia☆Neujahr | +9.4% | 191,252 | 209,182 | 62.5% / 62.5% |  |
| Nightmare Stinger | +8.3% | 30,198 | 32,708 | 10% / 10% |  |
| Doppel of Silence | +8.0% | 68,217 | 73,663 | 20% / 30% |  |
| Evoluzione Presente | +6.3% | 321,871 | 341,988 | 80% / 80% |  |
| Time Stop Strike | +5.7% | 112,411 | 118,835 | 10% / 10% |  |
| Atomo Arrabbiato | -2.5% | 92,039 | 89,765 | 36% / 36% |  |

52 other characters are within 0.5%.

## Support: Lux's Ultimate gain with the character (points)

| Character | Identity (element/role/ailment) | Old | Engine | Difference | Why |
|---|---|---|---|---|---|
| Melodia Appassionata | -/-/VORTEX | +296.0% | +63.6% | -232.4 | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -12.8%); UP_ATK_ACCUM_RATIO (old -12.6%, engine 0.0%); UP_ATK_RATIO (old -4.2%, engine 0.0%) |
| Scorchin' Summer Spike | -/Attacker/- | +643.3% | +463.0% | -180.3 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -34.6%); ADDITIONAL_DAMAGE (old 0.0%, engine -19.3%) |
| Scorchin' Summer Spike | -/-/- | +357.4% | +284.9% | -72.5 | ADDITIONAL_DAMAGE (old 0.0%, engine -27.3%); UP_BUFF_EFFECT_VALUE (old 0.0%, engine -25.0%) |
| L'Ombre | -/Attacker/- | +317.1% | +367.1% | +50.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -31.8%); UP_GIV_DMG_RATIO (old -40.3%, engine -46.7%) |
| L'Ombre | Light/Attacker/- | +317.1% | +367.1% | +50.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -31.8%); UP_GIV_DMG_RATIO (old -40.3%, engine -46.7%) |
| L'Ombre | Dark/Attacker/- | +317.1% | +367.1% | +50.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -31.8%); UP_GIV_DMG_RATIO (old -40.3%, engine -46.7%) |
| L'Ombre | -/-/- | +218.5% | +256.5% | +38.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -27.3%); UP_GIV_DMG_RATIO (old -40.3%, engine -46.7%) |
| L'Ombre | Light/-/- | +218.5% | +256.5% | +38.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -27.3%); UP_GIV_DMG_RATIO (old -40.3%, engine -46.7%) |
| L'Ombre | Dark/-/- | +218.5% | +256.5% | +38.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -27.3%); UP_GIV_DMG_RATIO (old -40.3%, engine -46.7%) |
| Flame Waltz | -/-/- | +198.8% | +236.1% | +37.4 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -27.5%); UP_WEAK_ELEMENT_DMG_RATIO (old 0.0%, engine -11.1%) |
| Luminous Tenet | -/-/- | +34.8% | 0.0% | -34.8 |  |
| Tiro Finale | -/-/- | +107.8% | +142.5% | +34.6 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -19.2%); UP_WEAK_ELEMENT_DMG_RATIO (old 0.0%, engine -14.3%) |
| Sacred Gift | -/-/- | +30.0% | +60.4% | +30.4 | WEAKNESS (old 0.0%, engine -18.9%) |
| Désintégration | Aqua/-/- | +143.7% | +168.1% | +24.4 | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -18.7%); DWN_ELEMENT_RESIST_ACCUM_RATIO (old 0.0%, engine -9.1%) |
| Atomo Arrabbiato | Forest/-/POISON | +69.3% | +91.8% | +22.5 | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -13.1%); DWN_ELEMENT_RESIST_ACCUM_RATIO (old -14.5%, engine -24.5%) |
| Désintégration | -/-/- | +111.0% | +132.1% | +21.1 | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -16.5%); DWN_ELEMENT_RESIST_ACCUM_RATIO (old 0.0%, engine -9.1%) |
| Brilliant Beam | -/-/- | +82.2% | +101.2% | +18.9 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -9.4%); UP_ATK_RATIO (old -34.1%, engine -38.4%); UP_GIV_DMG_RATIO (old -16.7%, engine -19.4%) |
| Pluvia☆Neujahr | -/-/- | +382.7% | +366.8% | -16.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -31.0%); ADDITIONAL_DAMAGE (old 0.0%, engine -9.1%); UP_ATK_CONSUME_RATIO (old -21.1%, engine -19.2%) |
| Pluvia☆Neujahr | Light/-/- | +382.7% | +366.8% | -16.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -31.0%); ADDITIONAL_DAMAGE (old 0.0%, engine -9.1%); UP_ATK_CONSUME_RATIO (old -21.1%, engine -19.2%) |
| Luminous Tenet | Dark/-/- | +34.8% | +20.0% | -14.8 | UP_AIM_RCV_DMG_RATIO (old 0.0%, engine -16.7%) |
| Pluvia☆Clara | -/-/- | +24.5% | +38.9% | +14.4 | UP_WEAK_ELEMENT_DMG_RATIO (old -7.7%, engine -17.2%) |
| Nine Phases | -/-/- | 0.0% | +11.1% | +11.1 | WEAKNESS (old 0.0%, engine -10.0%) |
| Doppel of Silence | -/-/- | +24.9% | +34.9% | +10.0 | UP_ATK_RATIO (old -20.0%, engine -25.9%) |
| Natsuki's Kioku | -/-/- | +43.5% | +53.4% | +9.9 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -6.5%); UP_ATK_RATIO (old -13.8%, engine -16.1%); UP_GIV_DMG_RATIO (old -13.8%, engine -16.1%); UP_CTD_FIXED (old -6.3%, engine -7.4%) |
| Atomo Arrabbiato | -/-/POISON | +63.6% | +73.0% | +9.4 | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -11.4%); DWN_ELEMENT_RESIST_ACCUM_RATIO (old -11.5%, engine -16.3%) |
| Atomo Arrabbiato | -/-/- | +63.6% | +55.1% | -8.4 | UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -11.4%); DWN_ELEMENT_RESIST_ACCUM_RATIO (old -11.5%, engine -16.3%) |
| Aqua Tempest | -/-/- | +357.5% | +350.5% | -7.0 | UP_BUFF_EFFECT_VALUE (old 0.0%, engine -31.0%); ADDITIONAL_DAMAGE (old 0.0%, engine -18.0%) |
| Mito's Kioku | -/-/- | +6.0% | +12.8% | +6.8 | DWN_DEF_RATIO (old 0.0%, engine -5.0%); UP_RCV_DMG_RATIO (old -5.7%, engine -6.7%); UP_DEBUFF_EFFECT_VALUE (old 0.0%, engine -1.1%) |
| Nanaka's Kioku | -/-/- | +41.5% | +48.0% | +6.5 | UP_ATK_RATIO (old -7.4%, engine -11.5%) |
| Luce della Speranza | Dark/-/- | +294.8% | +289.9% | -5.0 | UP_ATK_RATIO (old -37.4%, engine 0.0%); ADDITIONAL_DAMAGE (old -37.4%, engine 0.0%); TSUBAME (old -37.4%, engine 0.0%); UP_BUFF_EFFECT_VALUE (old 0.0%, engine -28.9%) |
| Himika's Kioku | -/-/- | +22.9% | +27.7% | +4.8 |  |
| Luce della Speranza | -/-/- | +261.0% | +256.4% | -4.5 |  |
| Atomo Arrabbiato | Forest/-/- | +69.3% | +72.0% | +2.7 |  |

140 other bars are within 0.5 points.

## Not compared

- Venusta Dissonanza: Found unknown effects: CONSUME_SELF_HP, STEP_UP_SKILL

