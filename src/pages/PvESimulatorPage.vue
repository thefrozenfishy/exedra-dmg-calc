<template>
  <div class="team-page">
    <h1 class="page-title">PvE Simulator</h1>

    <SavedTeamsPanel :saved="saved" />

    <section class="toolbar card share-card-actions">
      <div class="toolbar-left">
        <ImageActionsToolbar :target="() => shareCardRef!" filename="pve-simulator.png" :export-options="exportOpts"
          :share-options="() => saved.shareOptions()" :disabled="!teamKiokus.length"
          :share-handler="saved.generateShareUrl" share-label="Share team" />
      </div>
    </section>

    <!-- What the image export / share preview shows (hidden on the page). -->
    <div class="share-card-preview" ref="shareCardRef">
      <div class="share-header">
        <div class="share-stage">{{ stagePath(stageId) || 'No stage selected' }}</div>
        <div class="share-sub">{{ runSummary }}</div>
      </div>
      <div class="share-card-grid">
        <div v-for="(slot, index) in team.slots" :key="index" class="share-slot"
          :class="{ 'share-slot-dealer': index === attackerIndex }">
          <template v-if="slot.main">
            <div v-if="index === attackerIndex" class="share-dealer-tag">Damage Dealer</div>
            <div class="share-slot-top">
              <div class="share-slot-kioku-image">
                <img :src="kiokuImage(slot.main.id)" :alt="slot.main.name" />
                <div class="share-overlay-badges">
                  <span class="share-overlay-badge ascension">A{{ slot.main.ascension }}</span>
                  <span class="share-overlay-badge heart">H{{ slot.main.heartphialLvl }}</span>
                  <span class="share-overlay-badge magic">ML{{ slot.main.magicLvl }}</span>
                  <span v-if="slot.main.rarity !== 3" class="share-overlay-badge special">SP{{ slot.main.specialLvl
                    }}</span>
                </div>
              </div>
            </div>
            <div class="share-slot-portrait-support">
              <div v-if="slot.main.portrait" class="share-slot-portrait-block">
                <img class="share-slot-portrait-icon" :src="portraitImage(slot.main.portrait)"
                  :alt="slot.main.portrait" />
                <div class="share-slot-label">{{ slot.main.portrait }}</div>
              </div>
              <div v-if="slot.support" class="share-slot-support-block">
                <img class="share-slot-support-image" :src="kiokuImage(slot.support.id)" :alt="slot.support.name" />
                <div class="share-slot-label">{{ slot.support.name }}</div>
              </div>
            </div>
          </template>
          <div v-else class="share-slot-empty">Empty</div>
        </div>
      </div>
      <div class="share-enemies-grid">
        <div v-for="(e, i) in enemyInfo" :key="e.id" class="share-enemy-slot">
          <img class="share-enemy-img" :src="enemyImage(e.enemyMstId)" :alt="e.name" />
          <div class="share-enemy-name">{{ e.name }}</div>
          <div class="share-enemy-hp">HP {{ fmt(e.hp) }}<span v-if="e.gauges > 1"> ×{{ e.gauges }}</span></div>
          <div class="share-enemy-toggles">
            <span v-if="mainTargetIdx === i" class="share-chip">Target</span>
            <span v-if="broken[i]" class="share-chip">Broken {{ breakRate[i] ?? e.maxRate }}%</span>
          </div>
        </div>
      </div>
      <div class="share-results">
        <div v-if="dealer?.best" class="share-result">
          <span class="share-result-label">Max damage · {{ dealer.name }} · {{ dealer.best.label }}</span>
          <span class="share-result-value">{{ fmt(dealer.best.total.crit) }}</span>
          <span class="share-result-sub">{{ fmt(dealer.best.total.avg) }} average</span>
        </div>
        <div v-if="battleResult || pending" class="share-result">
          <span class="share-result-label">Battle simulator</span>
          <span class="share-result-value" :class="pending ? 'waiting' : battleResult">{{ battleResultText }}</span>
          <span class="share-result-sub">after {{ actionCount }} action{{ actionCount === 1 ? '' : 's' }}</span>
        </div>
      </div>
    </div>

    <!-- Stage -->
    <section class="card section-card">
      <h2 class="section-title">Stage</h2>
      <StagePicker v-model="stageId" />

      <div v-if="waves.length" class="wave-row">
        <span class="filters-heading">Wave</span>
        <button v-for="(w, i) in waves" :key="i" type="button" class="chip" :class="{ active: waveIdx === i }"
          @click="waveIdx = i">{{ i + 1 }} <span class="chip-count">{{ Math.min(w.length, 5) }} enem{{ Math.min(w.length, 5)
            === 1 ? 'y' : 'ies' }}<template v-if="w.length > 5"> + {{ w.length - 5 }} backup{{ w.length - 5 === 1 ? '' :
              's' }}</template></span></button>
        <span class="row-hint">Max Damage uses the enemies on the field when the selected wave starts; the battle
          simulator plays every wave.</span>
      </div>
    </section>

    <!-- Enemies, in the same 5 columns as the team below -->
    <div v-if="enemyInfo.length" class="enemies-block">
      <h2 class="section-title page-section-title">Enemies <span class="title-sub">· wave {{ waveIdx + 1 }}</span></h2>
      <div class="team-grid enemy-grid">
        <div v-for="(e, i) in enemyInfo" :key="e.id" class="enemy-card" :class="[`pos-${e.position}`, { main: mainTargetIdx === i }]">
            <div class="enemy-top">
              <img class="enemy-img" :src="enemyImage(e.enemyMstId)" :alt="e.name" @error="hideImg" />
              <div class="enemy-title">
                <div class="enemy-name" :title="e.name">{{ e.name }}</div>
                <div class="enemy-break">
                  <template v-if="e.breakPoint > 0">Break {{ e.breakPoint }} · broken {{ e.initRate }}–{{ e.maxRate
                    }}%</template>
                  <template v-else>Can't be broken</template>
                </div>
              </div>
            </div>
            <div class="enemy-stat-grid">
              <div class="enemy-stat"><span class="enemy-stat-label">HP</span>
                <span class="enemy-stat-value">{{ fmt(e.hp) }}<span v-if="e.gauges > 1" class="muted"> ×{{ e.gauges
                    }}</span></span></div>
              <div class="enemy-stat"><span class="enemy-stat-label">ATK</span><span class="enemy-stat-value">{{
                fmt(e.atk) }}</span></div>
              <div class="enemy-stat"><span class="enemy-stat-label">DEF</span><span class="enemy-stat-value">{{
                fmt(e.def) }}</span></div>
              <div class="enemy-stat"><span class="enemy-stat-label">SPD</span><span class="enemy-stat-value">{{ e.spd
                  }}</span></div>
            </div>
            <div v-if="e.weak.length" class="enemy-elements weak" title="Weak to">Weak
              <img v-for="w in e.weak" :key="w" :src="`/exedra-dmg-calc/elements/${w}.png`" :alt="w" :title="w"
                class="elem-icon" />
            </div>
            <!-- Every resisted element has the same rate, so one number covers them all. -->
            <div v-if="e.resists.length" class="enemy-elements resist" title="Resists">Resist
              <img v-for="r in e.resists" :key="r.el" :src="`/exedra-dmg-calc/elements/${r.el}.png`" :alt="r.el"
                :title="r.el" class="elem-icon" />
              −{{ e.resists[0].pct }}%
            </div>
            <div class="enemy-controls">
              <label class="chip" :class="{ active: mainTargetIdx === i }"
                title="Single-target skills hit this enemy in Max Damage">
                <input type="radio" :checked="mainTargetIdx === i" @change="mainTargetIdx = i" /> Target
              </label>
              <label v-if="e.breakPoint > 0" class="chip" :class="{ active: !!broken[i] }"
                title="Evaluate Max Damage against this enemy while it's broken">
                <input type="checkbox" :checked="!!broken[i]"
                  @change="setBroken(i, ($event.target as HTMLInputElement).checked)" /> Broken
              </label>
              <label v-if="e.breakPoint > 0 && broken[i]" class="rate-field" title="Broken DMG rate (%)">
                <input class="num" type="number" min="100" :max="e.maxRate" :value="breakRate[i] ?? e.maxRate"
                  @change="setBreakRate(i, Number(($event.target as HTMLInputElement).value), e.maxRate)" />%
              </label>
            </div>
        </div>
      </div>

      <template v-for="row in extraEnemyRows" :key="row.title">
        <h3 class="enemy-row-title">{{ row.title }}</h3>
        <p class="enemy-row-hint">{{ row.hint }}</p>
        <div class="team-grid enemy-grid">
          <div v-for="e in row.enemies" :key="e.id" class="enemy-card enemy-card-extra">
            <div class="enemy-top">
              <img class="enemy-img" :src="enemyImage(e.enemyMstId)" :alt="e.name" @error="hideImg" />
              <div class="enemy-title">
                <div class="enemy-name" :title="e.name">{{ e.name }}</div>
                <div class="enemy-break">
                  <template v-if="e.breakPoint > 0">Break {{ e.breakPoint }} · broken {{ e.initRate }}–{{ e.maxRate
                    }}%</template>
                  <template v-else>Can't be broken</template>
                </div>
              </div>
            </div>
            <div class="enemy-stat-grid">
              <div class="enemy-stat"><span class="enemy-stat-label">HP</span>
                <span class="enemy-stat-value">{{ fmt(e.hp) }}<span v-if="e.gauges > 1" class="muted"> ×{{ e.gauges
                    }}</span></span></div>
              <div class="enemy-stat"><span class="enemy-stat-label">ATK</span><span class="enemy-stat-value">{{
                fmt(e.atk) }}</span></div>
              <div class="enemy-stat"><span class="enemy-stat-label">DEF</span><span class="enemy-stat-value">{{
                fmt(e.def) }}</span></div>
              <div class="enemy-stat"><span class="enemy-stat-label">SPD</span><span class="enemy-stat-value">{{ e.spd
                  }}</span></div>
            </div>
            <div v-if="e.weak.length" class="enemy-elements weak" title="Weak to">Weak
              <img v-for="w in e.weak" :key="w" :src="`/exedra-dmg-calc/elements/${w}.png`" :alt="w" :title="w"
                class="elem-icon" />
            </div>
            <!-- Every resisted element has the same rate, so one number covers them all. -->
            <div v-if="e.resists.length" class="enemy-elements resist" title="Resists">Resist
              <img v-for="r in e.resists" :key="r.el" :src="`/exedra-dmg-calc/elements/${r.el}.png`" :alt="r.el"
                :title="r.el" class="elem-icon" />
              −{{ e.resists[0].pct }}%
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Team -->
    <h2 class="section-title page-section-title">Team</h2>
    <div class="team-grid">
      <div v-for="(slot, index) in team.slots" :key="index" class="team-slot"
        :class="{ dealer: attackerIndex === index }">
        <button type="button" class="dealer-slot-btn" :class="{ active: attackerIndex === index }"
          :title="attackerIndex === index ? 'This member is the damage dealer' : 'Make this member the damage dealer'"
          @click="attackerIndex = index">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor" />
          </svg>
        </button>
        <h3 class="slot-title">
          {{ index === attackerIndex ? 'Damage Dealer' : `Member ${index < attackerIndex ? index + 1 : index}` }}
        </h3>
        <CharacterEditor :index="index" :slot="slot" :setMain="team.setMain" :setSupport="team.setSupport" />
      </div>
    </div>

    <!-- Max damage -->
    <section class="card section-card">
      <h2 class="section-title">Max Damage</h2>
      <p class="hint-text">The best case against wave {{ waveIdx + 1 }}: every buff and debuff listed under "Buffs &amp;
        Debuffs" below is active at the same time, at full stacks, with its conditions met. Each skill is then run
        through the battle engine's damage formula.</p>

      <p v-if="!teamKiokus.length" class="empty-hint">Add team members to calculate damage.</p>
      <template v-else-if="maxDmg">
        <div v-if="dealer?.best" class="result-block">
          <div class="result-label">{{ dealer.name }} · {{ dealer.best.label }}</div>
          <div class="result-value">{{ fmt(dealer.best.total.crit) }} <span class="result-unit">if it crits</span></div>
          <div class="result-sub">{{ fmt(dealer.best.total.normal) }} without a crit · {{ fmt(dealer.best.total.avg) }}
            on average at {{ dealer.best.critChance.toFixed(1) }}% crit rate</div>
        </div>

        <template v-if="isScoreAttack">
          <div class="sa-score-row" :title="saScoreTitle">
            <span class="sa-score-label">Score Attack score (estimate)</span>
            <span class="sa-score-value">{{ saScore }}</span>
          </div>
          <div class="sa-fields">
            <label class="field"><span class="field-label">Difficulty score</span>
              <input v-model.number="difficultyScore" type="number" /></label>
            <label class="field"><span class="field-label">HP remaining (%)</span>
              <input v-model.number="hpPercentTeam" type="number" min="0" max="100" /></label>
            <label class="field"><span class="field-label">Turns</span>
              <input v-model.number="saTurns" type="number" min="1" max="16" /></label>
            <label class="field"><span class="field-label">Score multiplier</span>
              <input v-model.number="scoreMultiplier" type="number" step="0.1" min="0" /></label>
          </div>
        </template>

        <div class="table-wrap">
          <table class="dmg-table">
            <thead>
              <tr>
                <th>Member</th>
                <th v-for="[, label] in skillCols" :key="label">{{ label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in maxDmg.members" :key="m.pos" :class="{ dealer: m.pos === dealerPos }">
                <td>
                  <div class="member-cell">
                    <img v-if="memberId(m.pos)" class="member-thumb" :src="kiokuImage(memberId(m.pos)!)"
                      :alt="m.name" />
                    <span>{{ m.name }}</span>
                    <span v-if="m.pos === dealerPos" class="dealer-badge">Dealer</span>
                  </div>
                </td>
                <td v-for="[type] in skillCols" :key="type">
                  <template v-if="skillOf(m, type)">
                    <div :title="perEnemyTitle(skillOf(m, type)!)" class="dmg-crit">{{ fmt(skillOf(m, type)!.total.crit)
                      }}</div>
                    <div class="dmg-sub">{{ fmt(skillOf(m, type)!.total.normal) }} · avg {{
                      fmt(skillOf(m, type)!.total.avg) }}</div>
                  </template>
                  <span v-else class="muted">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="table-note">Big number: every hit crits. Below: no crits · average. Totals are summed over every
          enemy the skill hits; hover a value for the per-enemy split.</p>
      </template>
    </section>

    <!-- Buffs & debuffs used by Max Damage, by where they come from -->
    <div v-if="maxDmg && maxDmg.effects.length" class="effects-block">
      <h2 class="section-title page-section-title">Buffs &amp; Debuffs</h2>
      <p class="hint-text">Every buff and debuff your team gives, grouped by what applies it. Max Damage counts the
        ones that are on: buffs on {{ dealerName }} (green) and debuffs on the enemies (red). Click one to turn it off
        or back on; lower its stacks to use fewer.</p>

      <div class="effects-summary">
        <span class="legend legend-buff">{{ effectCounts.buff }} buff{{ effectCounts.buff === 1 ? '' : 's' }} on {{
          dealerName }}</span>
        <span class="legend legend-debuff">{{ effectCounts.debuff }} debuff{{ effectCounts.debuff === 1 ? '' : 's' }}
          on the enemies</span>
        <span v-if="effectCounts.off" class="legend legend-off">{{ effectCounts.off }} turned off</span>
        <button v-if="excluded.size || stacks.size" type="button" class="link-btn" @click="resetEffects">Turn
          everything back on</button>
        <label v-if="effectCounts.na" class="chip" :class="{ active: showUnreachable }"
          title="Effects that only affect their own caster, or are limited to other elements/roles">
          <input type="checkbox" v-model="showUnreachable" /> Show {{ effectCounts.na }} that can't reach {{ dealerName
          }} or the enemies
        </label>
      </div>

      <div v-for="sec in effectSections" :key="sec.source" class="fx-section">
        <div class="fx-section-head">
          <span class="fx-section-title">{{ sec.source }}</span>
          <span class="fx-section-count">{{ sec.onCount }} of {{ sec.toggleable.length }} on</span>
          <button v-if="sec.toggleable.length > 1" type="button" class="link-btn"
            @click="setSectionOn(sec.toggleable, sec.onCount < sec.toggleable.length)">{{ sec.onCount <
              sec.toggleable.length ? 'Turn all on' : 'Turn all off' }}</button>
        </div>
        <template v-for="row in sec.rows" :key="row.side">
          <h4 class="fx-row-title" :class="row.side === 'ally' ? 'fx-row-buffs' : 'fx-row-debuffs'">{{ row.title }}</h4>
          <!-- One cell per team slot, in the same columns as the team. -->
          <div class="team-grid fx-grid">
            <div v-for="(cell, slot) in row.cells" :key="slot" class="fx-cell">
              <div v-if="cell.length" class="fx-cell-head">
                <img v-if="team.slots[slot]?.main" class="fx-thumb" :src="kiokuImage(team.slots[slot].main!.id)"
                  :alt="cell[0].casterName" />
                <span class="fx-caster">{{ cell[0].casterName }}</span>
              </div>
              <div v-for="e in cell" :key="e.key" class="fx-card"
                :class="[e.side === 'ally' ? 'fx-buff' : 'fx-debuff', `fx-${e.status}`]"
                :title="e.status === 'na' ? e.statusText : `${e.type}\nClick to turn ${e.status === 'off' ? 'on' : 'off'}`"
                @click="e.status !== 'na' && toggleEffect(e.key)">
                <div class="fx-effect">
                  <span class="fx-name">{{ e.name }}</span>
                  <span v-if="e.value" class="fx-value">{{ e.value }}</span>
                </div>
                <div v-if="e.description" class="fx-desc">{{ e.description }}</div>
                <div class="fx-foot">
                  <span class="fx-target">{{ e.statusText }}</span>
                  <span class="fx-switch">{{ e.status === 'off' ? 'Off' : e.status === 'na' ? 'N/A' : 'On' }}</span>
                </div>
                <label v-if="e.maxStacks > 1 && e.status !== 'na'" class="fx-stacks" @click.stop>
                  Stacks <input class="num" type="number" min="0" :max="e.maxStacks" :value="e.stacks"
                    @change="setStacks(e.key, Number(($event.target as HTMLInputElement).value), e.maxStacks)" /> /
                  {{ e.maxStacks }}
                </label>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Battle simulator -->
    <section class="card section-card battle-card">
      <h2 class="section-title">Battle Simulator</h2>
      <p class="hint-text">Plays the stage with the battle engine: enemy skills follow their skill rotation and
        conditions, enemies pick targets by role aggro, and later waves appear when a wave is cleared. Summons, boss
        form changes and Solo Raid linked HP / endless minions / countdowns are simulated.</p>

      <div class="sim-controls">
        <SegmentedToggle v-model="targetMode" :options="TARGET_MODE_OPTIONS" label="Control" />
        <p class="sim-hint">{{ TARGET_MODE_OPTIONS.find(o => o.value === targetMode)?.title }}</p>
        <RngControls v-model:mode="rngMode" :seed="seed" :changed="changedRolls" :disabled="!canRun"
          @update:seed="setSeed" @reset="resetRolls" />
        <div v-if="raid && partyBuffViews.length" class="party-buff-row">
          <span class="party-buff-label">Party buff</span>
          <div class="party-buff" :style="{ '--count': partyBuffViews.length }">
            <SegmentedToggle v-model="partyBuffChoice" :options="partyBuffOptions" />
            <div class="party-buff-effects">
              <div v-for="p in partyBuffViews" :key="p.value" class="party-buff-col"
                :class="{ active: p.value === partyBuffChoice }" @click="partyBuffChoice = p.value">
                <div v-for="(line, i) in p.buffs" :key="i" class="party-buff-effect">{{ line }}</div>
                <div v-if="p.charge" class="party-buff-charge">{{ p.charge }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="raid" class="raid-panel">
        <div class="raid-head">
          <span class="filters-heading">Solo Raid</span>
          <span>Difficulty {{ raid.difficulty }} · {{ raid.limitRoundCount }}-round limit · attempt {{
            raidAttempts.length + 1 }}</span>
        </div>
        <div class="raid-row">
          <button class="btn" :disabled="!battle || !battle.isOver" @click="nextAttempt"
            title="Start the next attempt from where this one ended: enemy HP, break gauges, turn gauges, the linked HP pool, the countdown and Vanguard points carry over (buffs and debuffs do not; the round count restarts)">Next
            attempt (carry over)</button>
          <button class="btn" :disabled="!raidAttempts.length" @click="resetAttempts">Back to attempt 1</button>
          <span v-if="raidAttempts.length" class="row-hint">{{ raidAttempts.length }} earlier attempt{{
            raidAttempts.length === 1 ? '' : 's' }} · linked HP / boss HP at the start of this one: {{
              fmt(raidAttempts[raidAttempts.length - 1].linkHp) }}</span>
        </div>
      </div>

      <button class="btn btn-accent run-sim-btn" @click="runSimulation" :disabled="!canRun">Run Simulation</button>

      <div class="sim-tools">
        <label class="field inline"><span class="field-label">Turns</span>
          <input v-model.number="simTurns" type="number" min="1" max="200" /></label>
        <button v-if="pickCount" class="btn" @click="resetPicks" :disabled="!canRun"
          title="Forget every decision you made and start the battle over">Reset {{ pickCount }} decision{{ pickCount ===
            1 ? '' : 's' }}</button>
        <button class="btn" @click="exportBattle" :disabled="!canRun"
          title="Save the stage, team, control and RNG settings, every decision and the simulated sequence to a file">Export
          to file</button>
        <button class="btn" @click="importInput?.click()"
          title="Load stage, team, settings and decisions from an exported file and re-run the simulation">Import
          file</button>
        <input ref="importInput" type="file" accept=".json,application/json" class="hidden-file"
          @change="importBattle" />
      </div>

      <div v-if="pending || battleResult" class="sim-status">
        <span class="result-pill" :class="pending ? 'waiting' : battleResult">{{ battleResultText }}</span>
        <span v-if="!pending && battleResult && raid && battle" class="row-hint"
          title="Approximation: 20 points per AV of elapsed time (the game computes the real score on the server)">{{
            battle.teamPointsUsed.toLocaleString() }} team points used ({{ Math.round(battle.elapsed) }} AV)</span>
      </div>

      <BattleTimeline :states="battleOutput" :show-sp="false" :rng-editable="rngMode === 'manual'"
        @decide="onDecide" />
      <div v-if="pending" ref="pickPanel" class="pick-panel">
        <div class="pick-head">{{ pending.kind === 'target' ? 'Pick a target' : pending.label.startsWith('Between') ?
          'Fire an ultimate?' : 'Choose an action' }}
          <span class="muted">· after action {{ actionCount }}</span>
        </div>
        <div class="pick-label">{{ pending.label }}</div>
        <div class="pick-options">
          <button v-for="(o, i) in pending.options" :key="i" type="button" class="btn pick-btn" @click="pickTarget(i)">
            <span>{{ o.label }}</span>
            <span v-if="hpOf(o.label)" class="muted small">{{ hpOf(o.label) }}</span>
          </button>
        </div>
        <p class="muted small">Every decision can be changed later from that action's roll list; the battle then re-runs
          from the start. Decisions are saved with the team when a saved team is selected above.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, reactive, ref, shallowRef, watch } from 'vue'
import { useTeamStore } from '../store/singleTeamStore'
import { useSetting } from '../store/settingsStore'
import CharacterEditor from '../components/CharacterEditor.vue'
import StagePicker from '../components/StagePicker.vue'
import BattleTimeline from '../components/BattleTimeline.vue'
import SegmentedToggle from '../components/SegmentedToggle.vue'
import RngControls from '../components/RngControls.vue'
import ImageActionsToolbar from '../components/ImageActionsToolbar.vue'
import SavedTeamsPanel from '../components/SavedTeamsPanel.vue'
import { useSavedTeams } from '../store/savedTeams'
import { PendingDecision, type RngDecision, type RngEvent, type RngMode } from '../models/BattleRng'
import { toast } from 'vue3-toastify'
import { TargetType, type BattleSnapshot, type SkillDetail } from '../types/KiokuTypes'
import { elementMap } from '../types/enums'
import { stageWaves, stageWaveMeta, summonTemplates, wavePositionIds, enemyName, breakMstOf, ELEMENT_KEYS, questStages, soloRaidInfo, type QuestEnemyAppearance } from '../models/PvE'
import { createPvEBattle, stageBattleType, waveStartUnits } from '../models/PvEBattle'
import passiveMstJson from '../assets/base_data/getPassiveSkillMstList.json'
import type { RaidCarry } from '../models/PvPBattle'
import { getScoreAttackStage } from '../models/PvEScore'
import { computeMaxDamage, type MaxDmgEffect, type MaxDmgResult, type MemberDamage, type SkillDamage } from '../models/MaxDamage'
import { buildSlotKioku, buildPvEExport, parsePvEExport, downloadText } from '../utils/pvpExport'
import { describePvESetup, sanitizePvESetup, stagePath, type PvESetup } from '../utils/pveSetup'
import { effectDescription, effectName, effectRestriction, effectValue } from '../utils/effectText'
import { passiveDetailsByMstId, portraits } from '../utils/helpers'
import type { PvPBattle } from '../models/PvPBattle'
import type { PvPKioku } from '../models/PvPKioku'

const team = useTeamStore()
const stageId = useSetting<number>('pveStageId', 982250)
const attackerIndex = useSetting('pveAttackerIndex', 2)
const scoreMultiplier = useSetting('scoreMultiplier', 35)
const saTurns = useSetting('turns', 3)
const hpPercentTeam = useSetting('hp_percentage_team', 20)
const difficultyScore = useSetting('difficulty_score', 6_000_000)
const simTurns = useSetting('pveSimTurns', 40)

const fmt = (n: number) => Math.round(n).toLocaleString()
const hideImg = (ev: Event) => { (ev.target as HTMLImageElement).style.visibility = 'hidden' }
const kiokuImage = (id: number) => `/exedra-dmg-calc/kioku_images/${id}_thumbnail.png`
const enemyImage = (enemyMstId: number) => `/exedra-dmg-calc/enemy/${enemyMstId}_thumbnail.png`
const portraitImage = (portrait: string) => portraits[portrait] ? `/exedra-dmg-calc/portrait_images/${portraits[portrait].resourceName}_thumbnail.png` : ''

// ---- stage / enemies ----
const waveIdx = ref(0)
const waveMetas = computed(() => stageId.value ? stageWaveMeta(stageId.value) : [])
const waves = computed(() => waveMetas.value.map(m => m.appearances))
const waveMeta = computed(() => waveMetas.value[Math.min(waveIdx.value, waveMetas.value.length - 1)])
// The enemies on the field when the wave starts (at most 5): Max Damage is evaluated against these only.
const wave = computed(() => waveMeta.value ? waveStartUnits(waveMeta.value) : [])
const mainTargetIdx = ref(0)
const broken = ref<boolean[]>([])
const breakRate = ref<(number | undefined)[]>([])

watch(stageId, () => { waveIdx.value = 0 })
watch(wave, w => {
  const main = w.findIndex(a => a.isMainTargetEnemy)
  mainTargetIdx.value = main >= 0 ? main : 0
  broken.value = w.map(a => (breakMstOf(a)?.breakPoint ?? 0) > 0)
  breakRate.value = w.map(() => undefined)
}, { immediate: true })

const setBroken = (i: number, v: boolean) => { const b = [...broken.value]; b[i] = v; broken.value = b }
const setBreakRate = (i: number, v: number, max: number) => {
  const r = [...breakRate.value]; r[i] = Number.isFinite(v) ? Math.max(100, Math.min(max, v)) : undefined; breakRate.value = r
}

function enemyView(a: QuestEnemyAppearance) {
  const b = breakMstOf(a)
  return {
    id: a.questEnemyAppearanceMstId, enemyMstId: a.enemyMstId, name: enemyName(a),
    hp: a.hp, atk: a.atk, def: a.def, spd: a.speed,
    gauges: a.startHpGaugeCount > 0 ? a.startHpGaugeCount : a.hpGaugeCount,
    weak: [1, 2, 3, 4, 5, 6].map(i => a[`weakElement${i}`]).filter((x: number) => x >= 1 && x <= 6).map((x: number) => elementMap[x]),
    resists: ELEMENT_KEYS.map((k, el) => ({ el: elementMap[el], pct: k ? (a[`${k}ResistRate`] ?? 0) / 10 : 0 })).filter(r => r.pct > 0),
    breakPoint: b?.breakPoint ?? 0,
    initRate: Math.trunc((b?.initialBreakedDamageReceiveRate ?? 1000) / 10),
    maxRate: Math.trunc((b?.maxBreakedDamageReceiveRate ?? 1000) / 10),
  }
}
// Each start unit with its position (1-5, left to right), which is also its column above the team.
const enemyInfo = computed(() => {
  const positions = wavePositionIds(wave.value.length)
  return wave.value.map((a, i) => ({ ...enemyView(a), position: positions[i] }))
})
// Endless waves list more than 5 enemies: only 5 can be on the field, the rest come in as those are defeated.
// Summons are defined for the whole stage (identical templates shown once).
const extraEnemyRows = computed(() => {
  const backups = (waveMeta.value?.appearances ?? []).slice(wave.value.length).map(enemyView)
  const seen = new Set<string>()
  const summons = [...(stageId.value ? summonTemplates(stageId.value).values() : [])].map(enemyView).filter(e => {
    const key = `${e.enemyMstId}:${e.hp}:${e.atk}:${e.def}:${e.spd}`
    return !seen.has(key) && !!seen.add(key)
  })
  return [
    { title: 'Backups', enemies: backups, hint: 'Only 5 enemies can be on the field at once. These wait in the back and come in as the ones on the field are defeated. Not part of Max Damage.' },
    { title: 'Summons', enemies: summons, hint: 'Enemies that can be summoned during the battle. Not part of Max Damage.' },
  ].filter(r => r.enemies.length)
})

// ---- team ----
// Members in slot order; an empty slot is skipped (quests can be played with fewer than 5).
const filledSlots = computed(() => team.slots.map((s, i) => [s, i] as const).filter(([s]) => !!s.main))
const teamKiokus = computed<PvPKioku[]>(() => {
  try {
    return filledSlots.value.map(([s]) => markRaw(buildSlotKioku(s)))
  } catch (e) {
    console.warn('Could not build team', e)
    return []
  }
})
const dealerPos = computed(() => Math.max(0, filledSlots.value.findIndex(([, i]) => i === attackerIndex.value)))
const memberId = (pos: number) => filledSlots.value[pos]?.[0].main?.id

// ---- max damage ----
const excluded = reactive(new Set<string>())
const stacks = reactive(new Map<string, number>())
const toggleEffect = (k: string) => { if (excluded.has(k)) excluded.delete(k); else excluded.add(k) }
const setStacks = (k: string, v: number, max: number) => {
  const n = Math.max(0, Math.min(max, Number.isFinite(v) ? v : max))
  if (n === max) stacks.delete(k); else stacks.set(k, n)
}
const resetEffects = () => { excluded.clear(); stacks.clear() }

const maxDmg = computed<MaxDmgResult | undefined>(() => {
  if (!teamKiokus.value.length || !wave.value.length) return undefined
  try {
    return computeMaxDamage(teamKiokus.value, wave.value, dealerPos.value, {
      battleType: stageBattleType(stageId.value),
      excluded: new Set(excluded), stacks: new Map(stacks),
      broken: broken.value, breakRate: breakRate.value, mainTargetIdx: mainTargetIdx.value,
    })
  } catch (e) {
    console.warn('Max damage failed', e)
    return undefined
  }
})
const dealer = computed(() => maxDmg.value?.members[dealerPos.value])
const dealerName = computed(() => dealer.value?.name ?? 'the damage dealer')
const skillCols: [TargetType, string][] = [[TargetType.specialId, 'Ultimate'], [TargetType.skillId, 'Battle Skill'], [TargetType.attackId, 'Basic Attack']]
const skillOf = (m: MemberDamage, t: TargetType) => m.skills.find(s => s.type === t)
const perEnemyTitle = (s: SkillDamage) => s.perEnemy.map((x, i) => x.crit ? `${enemyInfo.value[i]?.name}: ${fmt(x.crit)} crit / ${fmt(x.normal)} / avg ${fmt(x.avg)}` : '').filter(Boolean).join('\n')

// ---- buffs & debuffs: where each effect comes from and whether it counts ----
type EffectStatus = 'used' | 'partial' | 'off' | 'na'
const STATUS_ORDER: Record<EffectStatus, number> = { used: 0, partial: 1, off: 2, na: 3 }
// Sections, in this order: active skills first, then the kit's passives and what's equipped.
const SOURCE_ORDER = ['Battle Skill', 'Ultimate', 'Basic Attack', 'Follow-up', 'Ability', 'Ascension', 'Crystalis', 'Portrait', 'Support', 'Passive']
const showUnreachable = useSetting('pveShowUnreachableEffects', false)

function effectStatus(e: MaxDmgEffect): { status: EffectStatus, statusText: string } {
  const restriction = effectRestriction(e.detail)
  const only = restriction ? ` (only ${restriction})` : ''
  const enemyCount = maxDmg.value?.enemies.length ?? 0
  if (!e.applies) {
    return e.side === 'ally'
      ? { status: 'na', statusText: `Only affects ${e.casterName} itself` }
      : { status: 'na', statusText: `A drawback on ${e.casterName} itself, not on enemies` }
  }
  if (excluded.has(e.key)) return { status: 'off', statusText: 'Turned off: click to turn on' }
  if (!e.reach) return { status: 'off', statusText: 'Set to 0 stacks' }
  if (e.side === 'ally') {
    return e.reach.dealer
      ? { status: 'used', statusText: `On ${dealerName.value}` }
      : { status: 'na', statusText: `Only for ${restriction || 'other'} allies: ${dealerName.value} isn't one` }
  }
  const hit = e.reach.enemies.length
  if (!hit) return { status: 'na', statusText: `No enemy in this wave can receive it${only}` }
  return hit < enemyCount
    ? { status: 'partial', statusText: `On ${hit} of ${enemyCount} enemies${only}` }
    : { status: 'used', statusText: enemyCount === 1 ? 'On the enemy' : `On all ${enemyCount} enemies` }
}

const effectViews = computed(() => (maxDmg.value?.effects ?? []).map(e => {
  const count = Math.max(0, Math.min(e.maxStacks, stacks.get(e.key) ?? e.maxStacks))
  return {
    key: e.key, side: e.side, type: e.detail.abilityEffectType, name: effectName(e.detail.abilityEffectType),
    // Team slot (0-4) of the caster: the column its card goes in.
    slot: filledSlots.value[e.casterPos]?.[1] ?? e.casterPos, casterName: e.casterName, source: e.source, maxStacks: e.maxStacks, stacks: count,
    value: effectValue(e.detail, e.maxStacks > 1 ? count : 1), description: effectDescription(e.detail),
    ...effectStatus(e),
  }
}))
type EffectView = (typeof effectViews.value)[number]

const effectCounts = computed(() => {
  const counts = { buff: 0, debuff: 0, off: 0, na: 0 }
  for (const e of effectViews.value) {
    if (e.status === 'off' || e.status === 'na') counts[e.status]++
    else counts[e.side === 'ally' ? 'buff' : 'debuff']++
  }
  return counts
})

const effectSections = computed(() => {
  const bySource = new Map<string, EffectView[]>()
  for (const e of effectViews.value) {
    if (e.status === 'na' && !showUnreachable.value) continue
    bySource.set(e.source, [...(bySource.get(e.source) ?? []), e])
  }
  const rank = (source: string) => { const i = SOURCE_ORDER.indexOf(source); return i < 0 ? SOURCE_ORDER.length : i }
  return [...bySource].sort(([a], [b]) => rank(a) - rank(b)).map(([source, effects]) => {
    const toggleable = effects.filter(e => e.status !== 'na')
    const sorted = effects.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name))
    return {
      source,
      toggleable,
      onCount: toggleable.filter(e => e.status === 'used' || e.status === 'partial').length,
      // A "Buffs" and a "Debuffs" row, each with one cell per team slot.
      rows: ([['ally', 'Buffs'], ['enemy', 'Debuffs']] as const)
        .map(([side, title]) => ({ side, title, cells: [0, 1, 2, 3, 4].map(i => sorted.filter(e => e.side === side && e.slot === i)) }))
        .filter(row => row.cells.some(c => c.length)),
    }
  })
})

function setSectionOn(effects: EffectView[], on: boolean) {
  for (const e of effects) {
    if (on) excluded.delete(e.key)
    else excluded.add(e.key)
  }
}

// Score Attack score, same estimate as the previous version of this page.
const isScoreAttack = computed(() => !!getScoreAttackStage(stageId.value))
const saDamage = computed(() => dealer.value?.best?.total.crit ?? 0)
const saScore = computed(() => (difficultyScore.value + Number((20 * (saDamage.value / scoreMultiplier.value + (90000 - 5000 * saTurns.value) + 15000 * hpPercentTeam.value / 100)).toFixed(0))).toLocaleString())
const saScoreTitle = computed(() => `${difficultyScore.value} + 20 * (${saDamage.value} / ${scoreMultiplier.value} + (90000 - 5000 * ${saTurns.value}) + 15000 * ${hpPercentTeam.value / 100})`)

// ---- battle simulator ----
// shallowRef + markRaw: keep the engine out of Vue reactivity (object identity matters, see PvP page).
const battle = shallowRef<PvPBattle | null>(null)
const battleOutput = ref<BattleSnapshot[]>([])
const battleResult = ref<'win' | 'lose' | undefined>()
const canRun = computed(() => !!teamKiokus.value.length && !!stageId.value)

// RNG (models/BattleRng.ts) and targeting. Auto: the targeting AI picks, and its random picks are
// rolls like any other. Manual: the battle stops at every target decision (either team) until
// you pick; picks and changed rolls are replayed from the start (decisions, by roll index).
const TARGET_MODE_OPTIONS = [
  { value: 'auto', label: 'Auto', title: 'Full auto: allies use Battle Skill whenever there is SP, fire ultimates as soon as they are ready, and targets follow the game\'s targeting rules (AI); where those pick at random, the RNG setting below decides.' },
  { value: 'manual', label: 'Manual', title: 'You play the allies: on each ally turn choose Battle Skill or Basic Attack (or fire a ready ultimate first), choose which ultimates to fire between actions, and pick every target, for both teams. The battle stops at each decision until you choose.' },
] as const
const targetMode = useSetting<'auto' | 'manual'>('pveTargetMode', 'auto')
const rngMode = useSetting<RngMode>('pveRngMode', 'seed')
const seed = ref(Math.floor(Math.random() * 2 ** 32))
const decisions = shallowRef(new Map<number, RngDecision>())
const pending = shallowRef<RngEvent | null>(null)
const pickPanel = ref<HTMLElement | null>(null)
const changedRolls = computed(() => [...decisions.value.values()].filter(d => !d.pick).length)
const pickCount = computed(() => [...decisions.value.values()].filter(d => d.pick).length)
const actionCount = computed(() => battleOutput.value.slice(1).filter(s => !s.wave).length)
const battleResultText = computed(() => pending.value ? 'Waiting for your decision'
  : battleResult.value === 'win' ? 'Cleared'
    : battleResult.value === 'lose' ? (battle.value?.finishedByRoundLimit ? 'Round limit reached' : 'Defeated') : '')

// ---- Solo Raid: party buff, round limit, attempts carrying over (PvEBattle / PvPBattle.raidCarry) ----
const raid = computed(() => stageId.value ? soloRaidInfo(stageId.value) : undefined)
const partyBuffId = useSetting<number>('pveRaidPartyBuff', 0)
// Solo Raid party buff choices: the buffs each gives every ally, and how it earns Vanguard points.
const partyBuffViews = computed(() => (raid.value?.partyBuffs ?? []).map(p => ({
  value: String(p.soloRaidPartyBuffMstId),
  label: passiveInfo(p.passiveSkillMstId).name,
  title: passiveInfo(p.passiveSkillMstId).description,
  buffs: (passiveDetailsByMstId.get(p.passiveSkillMstId) ?? []).map(d =>
    effectDescription(d as unknown as SkillDetail) || `${effectName(d.abilityEffectType)} ${effectValue(d as unknown as SkillDetail) ?? ''}`.trim()),
  charge: (passiveDetailsByMstId.get(p.buffPointChargePassiveSkillMstId) ?? [])
    .map(d => String(d.description ?? '').replace(/grants \d+ Vanguard points?/, 'grants Vanguard points'))[0] ?? '',
})))
const partyBuffOptions = computed(() => partyBuffViews.value.map(({ value, label, title }) => ({ value, label, title })))
const partyBuffChoice = computed<string>({
  get: () => String(partyBuffId.value || raid.value?.partyBuffs[0]?.soloRaidPartyBuffMstId || ''),
  set: v => { partyBuffId.value = Number(v) },
})
const raidAttempts = shallowRef<RaidCarry[]>([])
const passiveNames = new Map<number, { name: string, description: string }>((passiveMstJson as any[]).map(p => [p.passiveSkillMstId, { name: p.name, description: String(p.description ?? '').replace(/<br>/g, '\n') }]))
const passiveInfo = (id: number) => passiveNames.get(id) ?? { name: `Passive ${id}`, description: '' }

function nextAttempt() {
  if (!battle.value?.isOver) return
  raidAttempts.value = [...raidAttempts.value, battle.value.raidCarry()]
  decisions.value = new Map()
  seed.value = Math.floor(Math.random() * 2 ** 32)
  runSimulation()
}
function resetAttempts() {
  raidAttempts.value = []
  decisions.value = new Map()
  runSimulation()
}
watch(partyBuffId, () => { if (hasRun()) runSimulation(); else buildBattle() })

function newBattle(): PvPBattle {
  // Fresh units: a battle mutates its units' state.
  const allies = filledSlots.value.map(([s]) => buildSlotKioku(s))
  const carry = raidAttempts.value[raidAttempts.value.length - 1]
  return markRaw(createPvEBattle(allies, stageId.value, seed.value, 0, {
    rngMode: rngMode.value, decisions: decisions.value, manualTargeting: targetMode.value === 'manual',
    partyBuffId: partyBuffId.value || undefined, raidCarry: carry,
  }))
}

// Initial state only (no simulation yet).
function buildBattle() {
  battleResult.value = undefined
  pending.value = null
  if (!canRun.value || !waves.value.length) {
    battle.value = null
    battleOutput.value = []
    return
  }
  try {
    battle.value = newBattle()
    battleOutput.value = [battle.value.getCurrentState()]
  } catch (e) {
    console.warn('Could not build battle', e)
    battle.value = null
    battleOutput.value = []
  }
}
watch([() => team.slots, stageId], () => {
  decisions.value = new Map()
  raidAttempts.value = []
  buildBattle()
}, { deep: true, immediate: true })

function runSimulation() {
  if (!canRun.value || !waves.value.length) return buildBattle()
  let b: PvPBattle
  try {
    b = newBattle()
  } catch (e) {
    console.warn('Could not build battle', e)
    return buildBattle()
  }
  battle.value = b
  pending.value = null
  const states: BattleSnapshot[] = [b.getCurrentState()]
  for (let t = 0; t < simTurns.value && !b.isOver; t++) {
    try {
      states.push(...b.executeNextAction())
    } catch (e) {
      if (e instanceof PendingDecision) {
        pending.value = e.event
        break
      }
      toast.warning(String(e))
      console.warn('Failed to execute next action:', e)
      break
    }
  }
  battleOutput.value = states
  battleResult.value = pending.value ? undefined : b.result
  if (pending.value) nextTick(() => pickPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
}

const hasRun = () => battleOutput.value.length > 1 || !!pending.value
watch([rngMode, targetMode], () => { if (hasRun()) runSimulation(); else buildBattle() })

function setSeed(v: number) {
  seed.value = v
  runSimulation()
}

function setDecision(index: number, d: RngDecision | undefined) {
  const next = new Map(decisions.value)
  if (d) next.set(index, d); else next.delete(index)
  decisions.value = next
  runSimulation()
}

function pickTarget(i: number) {
  const ev = pending.value
  if (ev) setDecision(ev.index, { kind: ev.kind, label: ev.label, value: i, pick: true })
}

function onDecide(ev: RngEvent, value: boolean | number) {
  if (ev.userPick) return setDecision(ev.index, { kind: ev.kind, label: ev.label, value, pick: true })
  setDecision(ev.index, value === ev.defaultOutcome ? undefined : { kind: ev.kind, label: ev.label, value })
}

function resetRolls() {
  decisions.value = new Map([...decisions.value].filter(([, d]) => d.pick))
  if (hasRun()) runSimulation(); else buildBattle()
}

function resetPicks() {
  decisions.value = new Map([...decisions.value].filter(([, d]) => !d.pick))
  runSimulation()
}

// ---- export / import (utils/pvpExport.ts: buildPvEExport / parsePvEExport) ----
const importInput = ref<HTMLInputElement | null>(null)

function exportBattle() {
  if (!canRun.value) return
  if (!hasRun()) runSimulation()
  const data = buildPvEExport({
    stageId: stageId.value, stageName: questStages.get(stageId.value)?.name,
    control: targetMode.value, rngMode: rngMode.value, seed: seed.value, turns: simTurns.value,
    decisions: decisions.value, slots: team.slots, snapshots: battleOutput.value, pending: pending.value,
    soloRaid: raid.value ? { partyBuffId: partyBuffId.value || undefined, attempts: raidAttempts.value } : undefined,
  })
  const tag = rngMode.value === 'seed' ? `seed${seed.value}` : rngMode.value
  downloadText(`pve-sim-${stageId.value}-${targetMode.value}-${tag}.json`, JSON.stringify(data, null, 2))
  toast.success(`Exported the run${data.decisionLog.length ? ` with ${data.decisionLog.length} decision${data.decisionLog.length === 1 ? '' : 's'}` : ''}`)
}

async function importBattle(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const data = parsePvEExport(await file.text())
    if (!stageWaves(data.stageId).length) throw new Error(`stage ${data.stageId} is not in this build's data`)
    saved.detach() // an imported file is a new setup, not an edit of the selected saved team
    stageId.value = data.stageId
    team.importSlots(data.slots)
    await nextTick() // lets the team/stage watcher reset its state first
    seed.value = data.seed
    simTurns.value = data.turns
    rngMode.value = data.rngMode ?? 'seed'
    targetMode.value = data.control ?? 'auto'
    decisions.value = new Map(Object.entries(data.decisions ?? {}).map(([k, v]) => [Number(k), v]))
    if (data.soloRaid) {
      partyBuffId.value = data.soloRaid.partyBuffId ?? 0
      raidAttempts.value = data.soloRaid.attempts ?? []
    }
    await nextTick() // the mode watchers re-run first; run once more with everything in place
    runSimulation()
    toast.success(`Imported ${data.stageName ?? `stage ${data.stageId}`} (${data.control} control, ${data.rngMode} RNG)`)
  } catch (e) {
    toast.error(`Could not import: ${(e as Error).message}`)
  }
}

// "Name (Enemy 2)" -> that unit's HP in the latest state, for the pick buttons.
function hpOf(label: string): string {
  const m = /\((Ally|Enemy) (\d+)\)$/.exec(label)
  const last = battleOutput.value[battleOutput.value.length - 1]
  if (!m || !last) return ''
  const u = (m[1] === 'Ally' ? last.allies : last.enemies).team[Number(m[2]) - 1]
  return u ? `HP ${fmt(u.hp)} / ${fmt(u.maxHp)}` : ''
}

// ---- saved teams: the team plus this page's whole setup (utils/pveSetup.ts) ----
function currentSetup(): PvESetup {
  return {
    stageId: stageId.value,
    wave: waveIdx.value,
    target: mainTargetIdx.value,
    broken: [...broken.value],
    breakRate: breakRate.value.map(r => r ?? null),
    dealer: attackerIndex.value,
    excluded: [...excluded],
    stacks: Object.fromEntries(stacks),
    control: targetMode.value,
    rngMode: rngMode.value,
    seed: seed.value,
    turns: simTurns.value,
    decisions: [...decisions.value],
    ran: hasRun(),
    raid: raid.value ? { partyBuffId: partyBuffId.value, noRoundLimit: false, attempts: raidAttempts.value } : null,
  }
}

// Called right after the team's slots were loaded. Staged like importBattle: the stage and team watchers
// reset the wave, target, decisions and attempts first, then the saved values go in.
async function applySetup(raw: unknown) {
  if (!raw) return
  const s = sanitizePvESetup(raw)
  if (!stageWaves(s.stageId).length) {
    toast.warning(`This team's stage (${s.stageId}) isn't in this version's data, so only the team was loaded.`)
    return
  }
  stageId.value = s.stageId
  attackerIndex.value = s.dealer
  await nextTick()
  waveIdx.value = Math.min(s.wave, Math.max(0, waves.value.length - 1))
  await nextTick()
  if (s.target < wave.value.length) mainTargetIdx.value = s.target
  if (s.broken.length === wave.value.length) broken.value = [...s.broken]
  if (s.breakRate.length === wave.value.length) breakRate.value = s.breakRate.map(r => r ?? undefined)
  resetEffects()
  s.excluded.forEach(k => excluded.add(k))
  Object.entries(s.stacks).forEach(([k, v]) => stacks.set(k, v))
  seed.value = s.seed
  simTurns.value = s.turns
  rngMode.value = s.rngMode
  targetMode.value = s.control
  if (s.raid) {
    partyBuffId.value = s.raid.partyBuffId
    raidAttempts.value = s.raid.attempts
  }
  decisions.value = new Map(s.decisions)
  await nextTick() // the mode / raid watchers re-run first
  if (s.ran || s.decisions.length) runSimulation(); else buildBattle()
}

const shareCardRef = ref<HTMLElement | null>(null)
const exportOpts = { exportClass: 'exporting' }

const runSummary = computed(() => [
  targetMode.value === 'manual' ? 'Manual control' : 'Auto control',
  rngMode.value === 'seed' ? `seed ${seed.value}` : `${rngMode.value} RNG`,
  pickCount.value ? `${pickCount.value} decision${pickCount.value === 1 ? '' : 's'}` : '',
  changedRolls.value ? `${changedRolls.value} changed roll${changedRolls.value === 1 ? '' : 's'}` : '',
].filter(Boolean).join(' · '))

const saved = useSavedTeams({
  kind: 'pve',
  routePath: '/pve-simulator',
  label: 'PvE Team',
  getSlots: () => [team.slots],
  applySlots: slots => team.importSlots(slots[0]),
  shareTarget: () => shareCardRef.value!,
  exportOptions: exportOpts,
  extra: {
    get: currentSetup,
    sanitize: sanitizePvESetup,
    apply: applySetup,
    describe: describePvESetup,
  },
  saveHint: 'The team, stage, settings and every decision are saved to this team automatically.',
})
</script>

<style scoped>
/* ── Page (same look as the Single Battle Calculator and PvP Simulator) ── */
.team-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  margin: 0 0 0.25rem;
  color: var(--text);
  text-align: center;
}

.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}

.section-title {
  font-size: 1.2rem;
  color: var(--accent-soft);
  margin: 0 0 0.75rem;
  text-align: center;
}

.page-section-title {
  margin: 0.5rem 0 0;
}

.subsection-title {
  font-size: 0.95rem;
  color: var(--accent-soft);
  margin: 0 0 0.25rem;
}

.filters-heading {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  flex-shrink: 0;
  opacity: 0.8;
}

.hint-text {
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
  max-width: 820px;
  margin: 0 auto 1rem;
}

.row-hint,
.col-hint,
.table-note {
  font-size: 0.78rem;
  color: var(--muted);
}

.col-hint {
  margin: 0 0 0.6rem;
}

.table-note {
  text-align: center;
  margin: 0.6rem 0 0;
}

.empty-hint {
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
  margin: 0.5rem 0;
}

.muted {
  color: var(--muted);
}

.small {
  font-size: 0.8rem;
}

/* Toggle chips, as on Kioku Setup */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  color: var(--muted);
  background: transparent;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  user-select: none;
}

.chip input {
  display: none;
}

.chip.active {
  background: var(--accent-glow);
  border-color: var(--border-strong);
  color: var(--accent);
}

.chip-count {
  opacity: 0.7;
  font-size: 0.72rem;
}

.num {
  width: 4.5em;
  padding: 0.15rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font: inherit;
  font-size: 0.8rem;
}

.btn {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5em 1.2em;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn-accent {
  background: var(--accent-glow);
  border: 1px solid var(--border-strong);
  color: var(--accent);
}

.btn-accent:hover:not(:disabled) {
  background: var(--accent-glow-strong);
  border-color: var(--accent);
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--accent-soft);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.field.inline {
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.74rem;
  color: var(--muted);
}

.field input {
  width: 8rem;
}

.field.inline input {
  width: 4.5rem;
}

.hidden-file {
  display: none;
}

/* ── Toolbar + share image ── */
.toolbar {
  display: flex;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.share-card-actions {
  justify-content: center;
}

.exporting {
  display: block !important;
  width: 1200px !important;
}

.share-card-preview {
  display: none;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem;
  background: rgba(18, 13, 25, 0.95);
  color: var(--text);
}

.share-header {
  text-align: center;
  margin-bottom: 0.75rem;
}

.share-stage {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--accent-soft);
}

.share-sub {
  font-size: 0.8rem;
  color: var(--muted);
}

.share-card-grid,
.share-enemies-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.share-enemies-grid {
  margin-top: 0.75rem;
}

.share-slot,
.share-enemy-slot {
  position: relative;
  background: rgba(15, 11, 21, 0.95);
  border: 1px solid rgba(255, 209, 110, 0.15);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.share-slot-dealer {
  border-color: rgba(255, 209, 110, 0.6);
}

.share-dealer-tag {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
}

.share-slot-kioku-image {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 14px;
  overflow: hidden;
  background: radial-gradient(circle at top, rgba(255, 207, 109, 0.14), rgba(14, 10, 21, 1));
}

.share-slot-kioku-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.share-overlay-badges {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.share-overlay-badge {
  position: absolute;
  min-width: 32px;
  height: 32px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: rgba(15, 12, 20, 0.88);
  color: var(--text);
  font-size: 0.72rem;
  font-weight: 700;
}

.share-overlay-badge.ascension { left: 80%; top: 0; }
.share-overlay-badge.heart { left: 20%; top: 0; }
.share-overlay-badge.magic { left: 20%; bottom: 0; }
.share-overlay-badge.special { left: 80%; bottom: 0; }

.share-slot-portrait-support {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.share-slot-portrait-block,
.share-slot-support-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.share-slot-portrait-icon,
.share-slot-support-image {
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
}

.share-slot-label {
  font-size: 0.72rem;
  color: var(--muted);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-slot-empty {
  color: var(--muted);
  margin: auto;
}

.share-enemy-img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
}

.share-enemy-name {
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.share-enemy-hp {
  font-size: 0.78rem;
  color: var(--muted);
}

.share-enemy-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
}

.share-chip {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--accent);
  font-size: 0.74rem;
}

.share-results {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-top: 1rem;
}

.share-result {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-result-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.share-result-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
}

.share-result-value.win { color: var(--success); }
.share-result-value.lose { color: var(--danger); }

.share-result-sub {
  font-size: 0.78rem;
  color: var(--muted);
}

/* ── Stage + enemies ── */
.wave-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0.9rem 0 0;
}

.wave-row .row-hint {
  margin-left: 0.4rem;
}

/* Same columns as .team-grid; while it shows 5 columns, each enemy sits above its position (1-5). */
.enemies-block {
  container-type: inline-size;
}

.title-sub {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--muted);
}

.team-grid.enemy-grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  margin-top: 0.75rem;
}

@container (min-width: 1128px) {
  .enemy-card.pos-1 { grid-column: 1; }
  .enemy-card.pos-2 { grid-column: 2; }
  .enemy-card.pos-3 { grid-column: 3; }
  .enemy-card.pos-4 { grid-column: 4; }
  .enemy-card.pos-5 { grid-column: 5; }
}

.enemy-row-title {
  margin: 1.25rem 0 0;
  text-align: center;
  font-size: 0.95rem;
  color: var(--accent-soft);
}

.enemy-row-hint {
  margin: 0.2rem auto 0;
  max-width: 720px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
}

.enemy-card-extra {
  border-style: dashed;
  opacity: 0.85;
}

.enemy-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.enemy-card.main {
  border-color: rgba(255, 209, 110, 0.6);
  box-shadow: 0 0 0 1px rgba(255, 209, 110, 0.2);
}

.enemy-top {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  min-width: 0;
}

.enemy-img {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.25);
}

.enemy-title {
  min-width: 0;
}

.enemy-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.enemy-break {
  font-size: 0.75rem;
  color: var(--muted);
}

.enemy-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem 0.5rem;
}

.enemy-stat {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.enemy-stat-label {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.enemy-stat-value {
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.enemy-elements {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.78rem;
}

.elem-icon {
  width: 16px;
  height: 16px;
  vertical-align: -3px;
}

.weak {
  color: var(--success);
}

.resist {
  color: var(--muted);
}

.enemy-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.rate-field {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--muted);
}

/* ── Team ── */
.team-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.team-slot {
  position: relative;
  min-width: 0;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.team-slot.dealer {
  border-color: rgba(255, 209, 110, 0.55);
  box-shadow: 0 0 0 1px rgba(255, 209, 110, 0.2), 0 0 12px rgba(255, 209, 110, 0.12);
}

.slot-title {
  font-size: 0.95rem;
  color: var(--accent-soft);
  text-align: center;
  margin: 0 0 0.5rem;
}

.dealer-slot-btn {
  position: absolute;
  top: -0.6rem;
  left: -0.6rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  background: var(--panel);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s, color 0.15s;
}

.dealer-slot-btn:hover {
  border-color: rgba(255, 209, 110, 0.5);
  color: var(--accent-soft);
  transform: scale(1.08);
}

.dealer-slot-btn.active {
  background: rgba(255, 209, 110, 0.18);
  border-color: rgba(255, 209, 110, 0.75);
  color: var(--accent);
}

/* ── Max damage ── */
.result-block {
  text-align: center;
  margin: 0 0 1rem;
}

.result-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.result-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.result-unit {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
}

.result-sub {
  font-size: 0.85rem;
  color: var(--muted);
}

.sa-score-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.sa-score-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.sa-score-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
}

.sa-fields {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.sa-fields .field {
  align-items: center;
}

.table-wrap {
  overflow-x: auto;
}

.dmg-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.dmg-table th,
.dmg-table td {
  padding: 0.45rem 0.65rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: right;
  white-space: nowrap;
}

.dmg-table th {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.dmg-table th:first-child,
.dmg-table td:first-child {
  text-align: left;
}

.dmg-table tr.dealer td {
  background: var(--accent-glow);
}

.dmg-table tr.dealer td:first-child {
  box-shadow: inset 2px 0 0 var(--accent);
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-thumb {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.dealer-badge {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  padding: 0 0.4rem;
}

.dmg-crit {
  font-weight: 700;
}

.dmg-sub {
  font-size: 0.75rem;
  color: var(--muted);
}

/* ── Buffs & debuffs (card style of the Single Battle Calculator's "Buffs Received") ── */
.effects-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 0.9rem;
  margin-bottom: 1rem;
}

.legend {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
}

.legend::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.legend-buff::before { background: var(--success); }
.legend-debuff::before { background: var(--danger); }
.legend-off::before { background: rgba(255, 255, 255, 0.25); }

.fx-section {
  margin-top: 1.1rem;
}

.fx-section-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0 0.2rem 0.3rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.fx-section-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-soft);
}

.fx-section-count {
  font-size: 0.75rem;
  color: var(--muted);
}

.fx-section-head .link-btn {
  margin-left: auto;
}

.effects-block {
  container-type: inline-size;
}

.fx-row-title {
  margin: 0.6rem 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.fx-row-buffs { color: var(--success); }
.fx-row-debuffs { color: var(--danger); }

/* Same columns as .team-grid (auto-fill keeps empty slots so each cell stays under its member). */
.team-grid.fx-grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  align-items: start;
}

.fx-cell {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.fx-cell-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

/* Green: buff on the damage dealer. Red: debuff on the enemies. Grey: turned off / can't reach. */
.fx-card {
  --fx: var(--success);
  --fx-bg: rgba(20, 100, 40, 0.16);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 3px solid var(--fx);
  background: var(--fx-bg);
  font-size: 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, opacity 0.12s;
}

.fx-card.fx-debuff {
  --fx: var(--danger);
  --fx-bg: rgba(180, 40, 40, 0.16);
}

.fx-card:hover {
  filter: brightness(1.15);
}

.fx-card.fx-off,
.fx-card.fx-na {
  --fx: rgba(255, 255, 255, 0.2);
  --fx-bg: rgba(255, 255, 255, 0.02);
  opacity: 0.6;
}

.fx-card.fx-off .fx-name,
.fx-card.fx-off .fx-value {
  text-decoration: line-through;
}

.fx-card.fx-na {
  border-left-style: dashed;
  cursor: default;
}

.fx-card.fx-na:hover {
  filter: none;
}

.fx-thumb {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.fx-caster {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fx-switch {
  margin-left: auto;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fx);
  border: 1px solid var(--fx);
  border-radius: 999px;
  padding: 0 0.45rem;
}

.fx-effect {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.fx-name {
  font-weight: 600;
  color: var(--fx);
}

.fx-value {
  font-weight: 700;
  color: var(--fx);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.fx-desc {
  font-size: 0.74rem;
  color: var(--muted);
  line-height: 1.35;
  white-space: pre-line;
}

.fx-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem 0.6rem;
}

.fx-target {
  font-size: 0.72rem;
  color: var(--muted);
}

.fx-stacks {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: var(--muted);
}

.fx-stacks .num {
  width: 3.5em;
}

/* ── Battle simulator ── */
.sim-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.sim-hint {
  margin: 0 0 0.5rem;
  max-width: 640px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
}

.party-buff-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.4rem;
  max-width: 100%;
}

.party-buff-label {
  font-size: 0.8rem;
  color: var(--muted);
  padding-top: 0.3rem;
}

/* The pill toggle stretched over one column per party buff, with that buff's effects in the column below it. */
.party-buff {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: calc(var(--count) * 190px);
  max-width: calc(100vw - 7rem);
}

.party-buff :deep(.fight-mode-row),
.party-buff :deep(.fight-mode-toggle) {
  display: grid;
  width: 100%;
}

.party-buff-effects {
  display: grid;
  grid-template-columns: repeat(var(--count), minmax(0, 1fr));
  gap: 3px;
  padding: 0 3px;
}

.party-buff-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 0.74rem;
  color: var(--muted);
  text-align: left;
  cursor: pointer;
}

.party-buff-col.active {
  color: var(--text);
  background: var(--accent-glow);
  border-color: var(--border-strong);
}

.party-buff-charge {
  font-size: 0.7rem;
  opacity: 0.75;
}

.raid-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 auto 1rem;
  max-width: 820px;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.02);
}

.raid-head,
.raid-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.6rem;
}

.raid-head {
  font-weight: 600;
}

.run-sim-btn {
  display: block;
  margin: 0 auto 0.75rem;
}

.sim-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto 1rem;
}

.sim-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.result-pill {
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  border: 1px solid currentColor;
}

.result-pill.win { color: var(--success); }
.result-pill.lose { color: var(--danger); }
.result-pill.waiting { color: var(--accent); }

.pick-panel {
  margin: 0.5rem auto 0;
  max-width: 640px;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  scroll-margin: 1rem;
}

.pick-head {
  font-weight: 700;
  color: var(--accent);
}

.pick-label {
  overflow-wrap: anywhere;
}

.pick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pick-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  text-align: left;
}
</style>
