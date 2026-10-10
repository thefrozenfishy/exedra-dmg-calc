<template>
    <section class="card section-card solver-card">
        <h2 class="section-title">Fight Solver</h2>
        <p class="hint-text">Searches your decisions (Battle Skill or Basic Attack, when to fire each ultimate, every
            ally-side
            target) for the clear that takes the least AV, with the team above and the Battle Simulator's RNG setting.
            Enemies
            keep their normal AI. Depth-first, best-looking branch first; a branch stops once it can't beat the best
            clear,
            and paths that reach a state already seen with no more AV are merged.</p>

        <div class="solver-controls">
            <label class="field inline"
                title="Stop after this many tree nodes in total (the search can be continued). Empty or 0: no limit, the search runs until you press Stop"><span
                    class="field-label">Node limit</span>
                <input v-model.number="maxNodes" type="number" min="0" step="1000" placeholder="∞" /></label>
            <label class="field inline" title="Don't explore past this AV (0 = no cap)"><span class="field-label">AV
                    cap</span>
                <input v-model.number="maxAv" type="number" min="0" step="0.1" /></label>
            <label class="field inline"
                title="Only search this many decisions (actions you pick) ahead of the start; deeper lines are cut. Empty or 0: no limit. Pairs well with a checkpoint goal or tactics goals to compare the states reached"><span
                    class="field-label">Max depth</span>
                <input v-model.number="maxDepth" type="number" min="0" step="1" placeholder="∞" /></label>
            <label class="field inline"
                title="Where a line ends: the clear, or a checkpoint where you pick the state to go on from: the end of the current wave, the boss's next phase, the HP down to 75 / 50 / 25% (the wave's shared HP pool if it has one, e.g. crisis wave 1; else the boss, all HP bars; a minion wave without a pool is played through to the boss), or the next break (a main target if the wave has one). Every checkpoint also counts when its wave ends first"><span
                    class="field-label">Goal</span>
                <select v-model="goal">
                    <option v-for="g in goalOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
                </select></label>
            <label class="field inline"
                :title="goal === 'clear' ? 'Also keep lines up to this much AV slower than the best clear (more clears to choose from; 0 = only ever faster ones, the quickest search)' : 'Checkpoints: also keep lines up to this much AV slower than the fastest one (they may arrive with more EP, SP or HP)'"><span
                    class="field-label">AV slack</span>
                <input v-model.number="slack" type="number" min="0" step="10" /></label>
            <label class="field inline"
                :title="`Search with this many parallel workers (0 = auto: ${autoWorkers} on this device)`"><span
                    class="field-label">Workers</span>
                <input v-model.number="workers" type="number" min="0" max="16" /></label>
        </div>
        <div v-if="teamNames.length" class="priority-row"
            title="Checkpoint states: a prioritised character's EP and AV until its next turn count on their own (as much EP and as little AV as possible for each), ahead of the rest of the team's totals; the cards list the best of those first">
            <span class="field-label">Prioritise</span>
            <button v-for="n in teamNames" :key="n" type="button" class="prio-chip" :class="{ on: priorityNames.includes(n) }"
                @click="togglePriority(n)">{{ priorityNames.includes(n) ? '★ ' : '' }}{{ n }}</button>
        </div>
        <details v-if="teamNames.length" class="tactics" :open="tacticsOpen"
            @toggle="tacticsOpen = ($event.target as HTMLDetailsElement).open">
            <summary><span class="tactics-title">Tactics</span> <span class="muted small">· {{ tacticsSummary
                    }}</span></summary>
            <fieldset class="option-group tactic-group">
                <legend>General <span class="muted">· how you play every stage</span></legend>
                <label class="check"
                    title="Only when someone on the team has an 'on enemy break, advances action order' effect (an ascension such as Final Fatebloom's A4, or the Heroic Grace crystalis): breaking enemies one after the other is tried before breaking several in one action, and a break is tried first while the allies who get the advance are not already at 0 AV. Only an order of search: the other lines are still tried later (a break of everything that ends the wave is never held back).">
                    <input v-model="tactics.spreadBreaks" type="checkbox" /> Spread breaks over several actions (when the team has break action-advance)</label>
            </fieldset>
            <fieldset class="option-group tactic-group">
                <legend>Checkpoint goals <span class="muted">· top = most important; they rank the states (and
                        clears) before AV, EP, SP and next turns</span></legend>
                <p v-if="!tactics.goals.length" class="muted small tactic-empty">None: every character and value is
                    "don't care" (the solver's own ranking). Add one per value you care about, most important first;
                    a state that misses a limit (at least / at most / between / buff) is still listed, but only states
                    that meet every limit set the AV bound.</p>
                <div v-for="(g, i) in tactics.goals" :key="i" class="goal-row" :class="{ gone: !goalInTeam(g) }"
                    draggable="true" @dragstart="dragGoal = i" @dragover.prevent @drop="dropGoal(i)"
                    :title="goalInTeam(g) ? 'Drag (or use the arrows) to change its priority' : 'Not in the current team: ignored'">
                    <span class="goal-rank">{{ i + 1 }}</span>
                    <button type="button" class="icon-btn" :disabled="i === 0" @click="moveGoal(i, -1)"
                        title="More important">▲</button>
                    <button type="button" class="icon-btn" :disabled="i === tactics.goals.length - 1"
                        @click="moveGoal(i, 1)" title="Less important">▼</button>
                    <select v-model="g.ally" @change="fixGoal(g)">
                        <option value="">Team</option>
                        <option v-for="n in teamNames" :key="n" :value="n">{{ n }}</option>
                        <option v-if="g.ally && !teamNames.includes(g.ally)" :value="g.ally">{{ g.ally }} (not in
                            team)</option>
                    </select>
                    <select v-model="g.metric" @change="fixGoal(g)">
                        <option v-for="m in metricsFor(g)" :key="m" :value="m">{{ METRIC_LABELS[m] }}</option>
                    </select>
                    <template v-if="g.metric === 'buff'">
                        <select v-model="g.mode">
                            <option value="has">has</option>
                            <option value="lacks">does not have</option>
                        </select>
                        <input v-model.trim="g.buff" class="buff-input" placeholder="e.g. CUTOUT"
                            title="Text found in the effect's type (e.g. CUTOUT) or in its 'applier - description' as the Battle Timeline lists it" />
                        <select v-model="g.from">
                            <option value="">from anyone</option>
                            <option v-for="n in teamNames" :key="n" :value="n">from {{ n }}</option>
                        </select>
                    </template>
                    <template v-else>
                        <select v-model="g.mode">
                            <option v-for="m in NUM_MODES" :key="m" :value="m">{{ MODE_LABELS[m] }}</option>
                        </select>
                        <input v-if="isLimit(g.mode)" v-model.number="g.value" type="number" class="tiny" step="any" />
                        <template v-if="g.mode === 'between'"><span class="muted small">and</span><input
                                v-model.number="g.value2" type="number" class="tiny" step="any" /></template>
                        <span v-if="isLimit(g.mode) && metricUnit(g)" class="muted small">{{ metricUnit(g) }}</span>
                    </template>
                    <button type="button" class="icon-btn" @click="removeGoal(i)" title="Remove this goal">✕</button>
                </div>
                <div class="tactic-buttons">
                    <button type="button" class="btn small-btn" @click="addGoal()">+ Add goal</button>
                </div>
            </fieldset>
            <fieldset class="option-group tactic-group">
                <legend>Strategies <span class="muted">· "try first": those lines are searched first; "only": the
                        other options are not tried</span></legend>
                <div class="strat-grid">
                    <span class="strat-head">Character</span><span class="strat-head">Action on its turns</span><span
                        class="strat-head">Ally-side targets (buffs)</span><span class="strat-head">Ultimate</span>
                    <template v-for="n in teamNames" :key="n">
                        <span class="strat-name" :class="{ on: strategyOn(n) }">{{ n }}</span>
                        <span class="strat-cell">
                            <select v-model="stratOf(n).action">
                                <option :value="undefined">any</option>
                                <option value="basic">Basic Attack</option>
                                <option value="skill">Battle Skill</option>
                            </select>
                            <select v-if="stratOf(n).action" v-model="stratOf(n).actionStrict" class="strict-select" title="Try first: these lines are searched first, the rest later. Only: the other options are not tried at all"><option :value="undefined">try first</option><option :value="true">only</option></select>
                        </span>
                        <span class="strat-cell">
                            <select v-model="stratOf(n).buffMain" title="Main target">
                                <option value="">any</option>
                                <option v-for="m in teamNames" :key="m" :value="m">{{ m }}</option>
                            </select>
                            <template v-if="stratOf(n).buffMain"><span class="muted small"
                                    title="When the main target already has this character's buffs">then</span>
                                <select v-model="stratOf(n).buffSecond" title="Second target">
                                    <option value="">—</option>
                                    <option v-for="m in teamNames" :key="m" :value="m">{{ m }}</option>
                                </select>
                                <input v-model.trim="stratOf(n).buffName" class="buff-input" placeholder="any buff"
                                    title="'Already has the buffs': an effect from this character matching this text (its type, e.g. CUTOUT, or its description); empty: any effect from this character" />
                                <select v-model="stratOf(n).buffStrict" class="strict-select" title="Try first: these lines are searched first, the rest later. Only: the other options are not tried at all"><option :value="undefined">try first</option><option :value="true">only</option></select></template>
                        </span>
                        <span class="strat-cell">
                            <span class="muted small">≥</span><input v-model.number="stratOf(n).ultBreaks" type="number"
                                class="tiny" min="0" max="5" placeholder="1"
                                title="Number of enemies in break (living)" /><span class="muted small">broken:</span>
                            <select v-model="stratOf(n).ultAtBreak">
                                <option v-for="m in ULT_MODES" :key="m.value" :value="m.value">{{ m.label }}</option>
                            </select>
                            <span class="muted small">else</span>
                            <select v-model="stratOf(n).ultOtherwise">
                                <option v-for="m in ULT_MODES" :key="m.value" :value="m.value">{{ m.label }}</option>
                            </select>
                            <select v-if="ultOn(n)" v-model="stratOf(n).ultStrict" class="strict-select" title="Try first: these lines are searched first, the rest later. Only: the other options are not tried at all"><option :value="undefined">try first</option><option :value="true">only</option></select>
                        </span>
                    </template>
                </div>
            </fieldset>
            <div class="tactic-buttons">
                <button type="button" class="btn small-btn" :disabled="!tacticsCount" @click="clearTactics"
                    title="Every goal and strategy back to don't care">Clear tactics</button>
                <button type="button" class="btn small-btn" :disabled="!tacticsCount" @click="exportTactics"
                    title="Save the tactics to a file for the command-line runner (scripts/sim/fightSolve.ts --tactics FILE)">Export
                    tactics</button>
                <button type="button" class="btn small-btn" @click="tacticsInput?.click()"
                    title="Load tactics saved with Export tactics (replaces the current goals and strategies; characters not in the team are kept but ignored)">Import
                    tactics</button>
                <input ref="tacticsInput" type="file" accept=".json,application/json" class="hidden-file"
                    @change="importTactics" />
            </div>
        </details>
        <div class="option-groups">
            <fieldset class="option-group">
                <legend>Exact <span class="muted">· the result stays optimal</span></legend>
                <label class="check"
                    title="Merge paths that reach the same battle state (same HP, gauges, buffs, SP...) with no less AV">
                    <input v-model="memo" type="checkbox" /> Merge equal states</label>
                <label class="check"
                    title="Also merge a state into an earlier one that is equal except for resources that only help: less enemy HP, more ally HP / EP / SP, less AV. A resource only counts when no condition this battle can check reads it across a threshold the two states sit on different sides of">
                    <input v-model="dominance" type="checkbox" /> Dominance (better resources)</label>
                <label class="check"
                    title="Targets on interchangeable units (same state and same neighbours, e.g. identical fresh minions) are tried once">
                    <input v-model="symmetry" type="checkbox" /> Skip identical targets</label>
                <label class="check"
                    title="Run a quick beam search first (the 8 most promising lines per decision) so a good clear is known early and the bound cuts hard from the start; also the shared prefix for parallel workers">
                    <input v-model="beam" type="checkbox" /> Greedy pre-pass</label>
                <label class="check"
                    title="Best first: always go on from the most promising waiting line of the whole search (fewest deviations from your tactics, then the best estimated finish), so the node limit goes into a few good lines. Depth first: the older sweep, which finishes the last decisions of each line before going back (complete, but wide)">
                    Search order <select v-model="searchOrder">
                        <option value="best">Best first (a good line fast)</option>
                        <option value="dfs">Depth first (exhaustive)</option>
                    </select></label>
            </fieldset>
            <fieldset class="option-group">
                <legend>Approximations <span class="muted">· faster, may miss the best clear</span></legend>
                <label class="check"
                    title="Cut a branch when its AV plus an optimistic estimate of the AV still needed (each enemy's HP at the team's top Max Damage rate times the safety factor: higher = fewer cuts) already makes it slower than the best clear">
                    <input v-model="lowerBound" type="checkbox" /> Lower bound, safety ×<input v-model.number="lbSafety"
                        class="tiny" type="number" min="0.5" max="10" step="0.5" :disabled="!lowerBound" /></label>
                <label class="check"
                    title="Ally-side targets (buffs, heals) are picked by the targeting AI instead of tried one by one">
                    <input v-model="aiAllyTargets" type="checkbox" /> AI picks ally targets</label>
                <label class="check" title="Enemy targets are picked by the targeting AI instead of tried one by one">
                    <input v-model="aiEnemyTargets" type="checkbox" /> AI picks enemy targets</label>
                <label class="check" title="Every ultimate fires as soon as it is ready (like auto play)">
                    <input v-model="ultsAsap" type="checkbox" /> Ultimates as soon as ready</label>
                <label class="check"
                    title="Breaker ultimates fire as soon as they are ready; Attacker ultimates only while an enemy is broken (others are still tried). The search always tries this order first even when unchecked">
                    <input v-model="ultHabits" type="checkbox" /> Ultimate habits</label>
                <label class="check"
                    title="States that differ only slightly (turn gauges within 0.5 AV, HP within 0.1%) count as equal when merging">
                    <input v-model="loose" type="checkbox" /> Loose merging</label>
                <label class="check"
                    title="End a path as a defeat as soon as any of your units is down (much smaller search; clears that need a sacrifice are not found)">
                    <input v-model="stopOnAllyDeath" type="checkbox" /> Stop when an ally dies</label>
            </fieldset>
        </div>
        <p class="solver-mode muted small">{{ modeText }}</p>

        <div class="solver-buttons">
            <button class="btn btn-accent" :disabled="!canRun || running" @click="start()">{{ stats ? 'Solve again' :
                'Solve'
                }}</button>
            <button class="btn" :disabled="!running" @click="stop">Stop</button>
            <button class="btn" :disabled="running || !stats || stats.done || !parts.length" @click="resume"
                :title="maxNodes > 0 ? `Continue the stopped search (up to ${(stats?.nodes ?? 0) + maxNodes} nodes)` : 'Continue the stopped search (no node limit)'">Continue</button>
            <span class="solver-file-buttons">
                <button class="btn" :disabled="!candidates.length || saving" @click="saveResults"
                    title="Save the checkpoint states / clears found, each with the line that gets there, the team, stage and RNG to a file (the search tree itself is not saved)">{{
                        saving ? 'Saving…' : 'Save results' }}</button>
                <button class="btn" :disabled="running" @click="loadInput?.click()"
                    title="Load results saved from the Fight Solver: the states found and their lines (also sets the team, stage and RNG they were found with)">Load
                    results</button>
                <input ref="loadInput" type="file" accept=".json,application/json" class="hidden-file"
                    @change="loadResults" />
            </span>
        </div>
        <p v-if="loadedNote" class="solver-loaded muted small">{{ loadedNote }}</p>

        <div v-if="error" class="solver-error">{{ error }}</div>
        <div v-if="stale && stats" class="solver-stale">The team, stage or RNG changed since this search: solve again to
            use
            them.</div>

        <div v-if="stats" class="solver-stats">
            <span class="result-pill" :class="statusPillClass">{{ statusText }}</span>
            <span v-if="stats.bestElapsed !== undefined" class="best-av"
                title="Elapsed action value when the last enemy fell (or the checkpoint was reached)">{{ jobGoal ===
                    'clear' ? 'Best clear' : 'Fastest checkpoint' }}: <b>{{ fmtAv(stats.bestElapsed) }} AV</b><span
                    class="muted"> (round {{ roundOf(stats.bestElapsed) }})</span></span>
            <span class="muted small">{{ stats.nodes.toLocaleString() }} nodes · {{ stats.actions.toLocaleString() }}
                actions
                simulated · {{ stats.merged.toLocaleString() }} merged · {{ stats.dominated.toLocaleString() }}
                dominated · {{
                    stats.symmetry.toLocaleString() }} identical targets skipped · {{ stats.bounded.toLocaleString() }} cut
                by the
                bound<template v-if="stats.lowerBounded"> ({{ stats.lowerBounded.toLocaleString() }} by the lower
                    bound)</template>
                · {{
                    stats.wins.toLocaleString() }} clears<template v-if="stats.checkpoints"> · {{
                    stats.checkpoints.toLocaleString() }}
                    checkpoints</template><template v-if="stats.missedGoals"> ({{ stats.missedGoals.toLocaleString() }}
                    miss your goal limits)</template> · {{ stats.losses.toLocaleString() }} defeats<template v-if="stats.allyFell">
                    ({{
                        stats.allyFell.toLocaleString() }} by an ally falling)</template> · {{ (stats.ms / 1000).toFixed(1)
                }}
                s<template v-if="parts.length > 1"> · {{
                    parts.length }} workers</template><template v-if="stats.phase === 'prefix'"> ·
                    pre-pass</template></span>
        </div>

        <p v-if="info && stats" class="solver-info muted small">{{ info }}</p>
        <p v-if="stats && stopOnAllyDeath && stats.allyFell > 0 && stats.allyFell * 3 > stats.nodes"
            class="solver-hint">Most
            lines
            here end because an ally falls ({{ stats.allyFell.toLocaleString() }} of {{ stats.nodes.toLocaleString() }}
            nodes).
            If
            clearing this stage needs a unit to go down, untick "Stop when an ally dies" and solve again.</p>

        <div v-if="candidates.length" class="candidates">
            <h3 v-if="candidates.every(c => c.note)" class="cand-title">Saved line{{ candidates.length === 1 ? '' : 's'
                }} <span class="muted">· play or continue from {{ candidates.length === 1 ? 'it' : 'any of them'
                    }}</span></h3>
            <h3 v-else-if="jobGoal !== 'clear'" class="cand-title">Checkpoint states <span class="muted">· {{
                    candidates.length
                    }} not
                    worse in every way than another (faster, more EP or SP, or the team's next turns sooner{{
                    jobPriority.length ? `; ★ ${jobPriority.join(', ')}: own EP and next turn each` : '' }}; HP only
                    breaks ties{{ candidates.some(c => c.goals?.length) ? '; your tactics goals first' : '' }}); pick one to go on from</span></h3>
            <h3 v-else class="cand-title">Clears found <span class="muted">· the {{ candidates.length }} fastest{{
                clearSlack >
                    0 ?
                    ` (slower lines kept up to ${clearSlack} AV behind the best)` : '' }}{{ candidates.some(c => c.goals?.length) ? ', ranked by your tactics goals first' : '' }}</span></h3>
            <div class="cand-list">
                <div v-for="c in candidates" :key="c.gid" class="cand"
                    :class="{ selected: c.gid === selectedId, win: c.win, miss: c.meets === false }">
                    <div class="cand-head">
                        <b>{{ fmtAv(c.elapsed) }} AV</b>
                        <span v-if="c.note" class="cand-note">{{ c.note }}</span>
                        <span class="muted">round {{ c.round }} · wave {{ c.wave }}{{ c.win ? ' · clear' : '' }}<template
                                v-if="!c.win && c.bossPct"> · HP {{ c.bossPct.toFixed(1) }}%</template><b
                                v-if="!c.win && c.broken" class="cand-broken"> · BREAK</b></span>
                        <span class="cand-keys"><span title="Team SP">SP <b>{{ c.sp }}</b></span><span
                                title="Team EP: the allies' EP as a share of full, added up">EP <b>{{ teamEp(c)
                                    }}</b></span><span v-if="hasTurns(c)"
                                title="AV until each ally's next turn, added up (lower = the team acts sooner)">next
                                turns Σ
                                <b>{{ fmtAv(turnSum(c)) }}</b> AV</span></span>
                    </div>
                    <div v-if="c.goals?.length" class="cand-goals">
                        <span v-for="(g, gi) in c.goals" :key="gi" class="cand-goal"
                            :class="{ ok: g.ok === true, miss: g.ok === false }"
                            :title="g.ok === false ? 'Misses this limit' : g.ok ? 'Limit met' : 'Ranked: as high / low as possible'">{{
                                g.ok === false ? '✗' : g.ok ? '✓' : '·' }} {{ g.label }} <b>{{ g.value }}</b></span>
                    </div>
                    <div class="cand-allies">
                        <div class="cand-ally cand-legend" :class="{ 'with-magic': hasMagic(c) }"><span></span><span>EP</span><span
                                title="AV until this ally's next turn">Next</span><span v-if="hasMagic(c)"
                                title="Magic stacks">Magic</span><span>HP</span></div>
                        <div v-for="(a, i) in c.allies" :key="i" class="cand-ally" :class="{ dead: a.dead, 'with-magic': hasMagic(c) }"
                            :title="allyTitle(a)">
                            <span class="cand-name" :class="{ prio: a.priority }">{{ a.priority ? '★ ' : '' }}{{ shortName(a.name) }}</span>
                            <span class="bar ep" :class="{ full: epPct(a) >= 100 }"><i
                                    :style="{ width: `${epPct(a)}%` }"></i></span>
                            <span class="cand-av" :class="{ now: a.av !== undefined && a.av < 0.05 }">{{ a.dead ? '—' :
                                a.av ===
                                undefined ? '?' : fmtAv(a.av) }}</span>
                            <span v-if="hasMagic(c)" class="cand-magic" :class="{ full: !!a.maxMagic && a.magic! >= a.maxMagic }">{{ magicText(a) }}</span>
                            <span class="bar hp"><i :style="{ width: `${a.hpPct}%` }"></i></span>
                        </div>
                    </div>
                    <div class="cand-buttons">
                        <button class="btn small-btn" :disabled="lineBusy" @click="openCard(c)"
                            title="Show this line in the Battle Simulator above: change any of your picks there, play on by hand, or start a new search from any action">Open
                            in simulator</button>
                        <button v-if="!c.win" class="btn small-btn btn-accent" :disabled="lineBusy || running"
                            @click="requestLine('solve', c.gid)"
                            title="A new search from this state to the next checkpoint (same goal)">Continue from
                            here</button>
                    </div>
                    <details v-if="c.route" class="cand-route">
                        <summary>Route · {{ c.route.length }} decision{{ c.route.length === 1 ? '' : 's' }}</summary>
                        <ol>
                            <li v-for="(r, i) in c.route" :key="i"><span class="muted">{{ fmtAv(r.elapsed) }}</span> {{
                                r.label
                                }}</li>
                        </ol>
                    </details>
                </div>
            </div>
        </div>

        <div v-show="treeSize > 0" class="tree-wrap">
            <div class="tree-bar">
                <span class="legend"><i class="lg best"></i>best clear</span>
                <span v-if="running" class="legend"><i class="lg current"></i>searching now</span>
                <span class="legend"><i class="lg other"></i>other paths</span>
                <span class="legend"><i class="lg clear"></i>other clears</span>
                <span v-if="jobGoal !== 'clear'" class="legend"><i class="lg checkpoint"></i>checkpoints</span>
                <span class="legend"><i class="lg open"></i>not explored</span>
                <span class="legend"><i class="lg lose"></i>defeat</span>
                <span class="tree-help muted small">Wheel: zoom · drag: pan · hover an edge for its action · click a
                    node to
                    show
                    its battle in the Battle Simulator above (and to search or skip its branch)</span>
                <button class="btn small-btn" @click="fitView()" title="Show the whole tree">Fit</button>
                <button class="btn small-btn" :disabled="stats?.bestNode === undefined" @click="focusBest"
                    title="Zoom in on the best clear's line">Best path</button>
            </div>
            <div ref="pane" class="tree-pane" :style="{ height: `${paneHeight}px` }">
                <canvas ref="canvas" @wheel.prevent="onWheel" @pointerdown="onPointerDown" @pointermove="onPointerMove"
                    @pointerup="onPointerUp" @pointerenter="onPointerEnter" @pointerleave="onPointerLeave"
                    :class="{ dragging: !!drag, pointing: !!hover }"></canvas>
                <div v-if="hover && !drag" class="tip" :style="tipStyle">
                    <div class="tip-title">{{ hover.edge ? 'Action' : 'Node' }} · {{ hover.depth === 0 ? 'start' :
                        `decision
                        ${hover.depth}` }}</div>
                    <div class="tip-label">{{ hover.label }}</div>
                    <div class="tip-sub">{{ fmtAv(hover.elapsed) }} AV · {{ hpText(hover.remaining) }}</div>
                    <div class="tip-sub" :class="hover.status">{{ STATUS_TEXT[hover.status] }}<template
                            v-if="hover.best"> · on the best
                            clear</template></div>
                </div>
            </div>
        </div>

        <div v-if="selected" class="node-panel">
            <div class="np-main">
                <div class="np-head">
                    <span class="np-dot" :class="[selected.status, { best: selected.onBestPath }]"></span>
                    <b>{{ selected.parent < 0 ? 'Start' : `Decision ${selected.depth}` }}</b>
                            <span class="muted">· {{ STATUS_TEXT[selected.status] }}</span>
                            <span v-if="selected.onBestPath" class="best-tag">best clear</span>
                </div>
                <div>{{ fmtAv(selected.elapsed) }} AV (round {{ roundOf(selected.elapsed) }}) · {{
                    hpText(selected.remaining) }}
                </div>
                <div v-if="selected.note" class="muted">{{ selected.note }}</div>
                <div v-if="selected.childCount || selected.status === 'open' || selected.status === 'skipped'"
                    class="np-buttons">
                    <button class="btn small-btn btn-accent" @click="prioritize('focus')"
                        title="Your hunch: the search continues inside this branch first (best-looking lines first), then goes on with the rest. Also brings back a skipped branch">Search
                        this
                        branch next</button>
                    <button class="btn small-btn" @click="prioritize('skip')"
                        title="Drop this branch's lines that are still waiting (the result is then no longer proven optimal)">Skip
                        this
                        branch</button>
                    <span v-if="prioritized" class="muted small">{{ prioritized }}</span>
                </div>
                <div class="np-buttons">
                    <button class="btn small-btn" :disabled="lineBusy" @click="requestLine('play')"
                        title="This node's line is in the Battle Simulator above: change any of your picks there, play on by hand, or start a new search from any action">Show
                        in simulator ↑</button>
                    <button class="btn small-btn" :disabled="lineBusy || running" @click="requestLine('solve')"
                        title="Start a new search that begins at this node (with every worker)">Solve from here</button>
                    <button class="btn small-btn" :disabled="saving" @click="saveNode()"
                        title="Save this node's line to a file: Load results brings it back as a card to play or continue from (after a refresh too), and the command line can start from it (--from-results)">{{
                            saving ? 'Saving…' : 'Save this line' }}</button>
                    <button v-if="selected.parent >= 0" class="btn small-btn"
                        @click="select(selected.parent)">Parent</button>
                    <button v-if="selected.mergedInto !== undefined" class="btn small-btn"
                        @click="select(selected.mergedInto)">Go to
                        the merged node</button>
                    <button v-if="stats?.bestNode !== undefined && stats.bestNode !== selected.id" class="btn small-btn"
                        @click="select(stats.bestNode!)">Best clear</button>
                </div>
            </div>
            <div v-if="selected.picks.length" class="np-block">
                <div class="np-label">Decisions on the edge into this node</div>
                <ol class="np-picks">
                    <li v-for="(p, i) in selected.picks" :key="i"><span class="muted">{{ p.label }}:</span> <b>{{
                            p.choice
                            }}</b><span v-if="p.count > 1" class="muted small"> (of {{ p.count }})</span></li>
                </ol>
            </div>
            <div v-if="selected.actors.length" class="np-block">
                <div class="np-label">Actions on that edge</div>
                <div class="np-actors">{{ selected.actors.join(' → ') }}</div>
            </div>
            <div v-if="selected.nextDecision" class="np-block">
                <div class="np-label">Next decision</div>
                <div>{{ selected.nextDecision }}</div>
            </div>
        </div>

    </section>
</template>

<script setup lang="ts">
// Fight solver panel of the PvE Simulator (search in workers/fightSolverWorker.ts, models/FightSolver.ts).
// The search tree is drawn top-down on a canvas (it can hold tens of thousands of nodes): the root is the battle
// start, each node a decision point, each edge one combination of decisions for the next action that needs any
// (plus the automatic actions after it). The best clear's line is gold, everything else grey. Hovering an edge or a
// node shows its action; clicking a node replays the battle up to it (the worker re-runs the path).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useSetting } from '../store/settingsStore'
import type { RngMode } from '../models/BattleRng'
import type { RaidCarry } from '../models/PvPBattle'
import type { TeamSlot } from '../types/BestTeamTypes'
import { SOLVER_GOALS, SOLVER_STATUSES, hpGoalShare, type CheckpointView, type SolverGoal, type SolverLine, type SolverNodeStatus, type SolverNodeView, type SolverStats, type SolverTreeChunk } from '../models/FightSolver'
import type { FightSolverJob, FightSolverMessage, FightSolverRequest, SolverExportItem } from '../workers/fightSolverWorker'
import { buildPvEExport, downloadText, type PvEExport } from '../utils/pvpExport'
import { METRIC_LABELS, MODE_LABELS, TEAM_METRICS, isLimit, strategyActive, tacticsFromNames, tacticsToNames, type AllyStrategyByName, type SolverTacticsByName, type TacticGoalByName, type TacticMetric, type TacticMode, type UltMode } from '../models/FightSolverTactics'
import { RESULTS_FORMAT, lineOf, mergeCandidates, resultsFileName, type SavedResults, type SolverRouteStep } from '../models/FightSolverResults'

const props = defineProps<{
    canRun: boolean
    slots: TeamSlot[]
    stageId: number
    seed: number
    rngMode: RngMode
    partyBuffId?: number
    raidCarry?: RaidCarry
    // Loading saved results: puts the team, stage and RNG they were found with on the page.
    applySetup?: (data: PvEExport) => Promise<void>
}>()

// play: a node's line for the Battle Simulator ("Play from here").
// play: a line for the Battle Simulator (the one battle view: nodes and cards are shown there). scroll: false when a
// tree click only refreshes it.
const emit = defineEmits<{ play: [line: SolverLine, opts?: { scroll?: boolean }] }>()

// 0 = no limit: the search runs until Stop (or until nothing is left).
const maxNodes = useSetting<number>('pveSolverNodeLimit', 0)
const goal = useSetting<SolverGoal>('pveSolverGoal', 'clear')
// Prioritised characters (by name, so the choice survives reordering the team): their EP and next turn count on their
// own on checkpoint states (FightSolver.stateCard).
const priorityNames = useSetting<string[]>('pveSolverPriority', [])
const teamNames = computed(() => props.slots.map(s => s.main?.name ?? '').filter(Boolean))
function togglePriority(n: string) {
  const cur = priorityNames.value ?? []
  priorityNames.value = cur.includes(n) ? cur.filter(x => x !== n) : [...cur, n]
}
// Tactics (models/FightSolverTactics.ts): checkpoint goals in priority order and per-character strategies, by name.
const tacticsSetting = useSetting<SolverTacticsByName>('pveSolverTactics', { goals: [], strategies: {} })
// Stored (not the default object) so the form's v-model edits are saved.
tacticsSetting.value = normalizeTactics(tacticsSetting.value)
const tactics = computed(() => tacticsSetting.value)
const tacticsOpen = useSetting<boolean>('pveSolverTacticsOpen', false)
const NUM_MODES: TacticMode[] = ['high', 'low', 'gte', 'lte', 'between']
const ULT_MODES: { value: UltMode, label: string }[] = [{ value: 'free', label: 'solver decides' }, { value: 'asap', label: 'as soon as ready' }, { value: 'hold', label: 'hold' }]
function normalizeTactics(t?: SolverTacticsByName): SolverTacticsByName {
    return {
        spreadBreaks: !!t?.spreadBreaks,
        goals: Array.isArray(t?.goals) ? t!.goals.map(g => ({ ...g, ally: g.ally ?? '', from: g.from ?? '' })) : [],
        strategies: Object.fromEntries(Object.entries(t?.strategies && typeof t.strategies === 'object' ? t.strategies : {})
            .map(([n, x]) => [n, { ...emptyStrategy(), ...JSON.parse(JSON.stringify(x ?? {})), buffMain: x?.buffMain ?? '', buffSecond: x?.buffSecond ?? '', ultAtBreak: x?.ultAtBreak ?? 'free', ultOtherwise: x?.ultOtherwise ?? 'free' }])),
    }
}
// A function declaration (hoisted): normalizeTactics uses it during setup, above this line.
function emptyStrategy(): AllyStrategyByName { return { buffMain: '', buffSecond: '', ultAtBreak: 'free', ultOtherwise: 'free' } }
// Every team member has a strategy entry (so the form can bind to it).
watch(teamNames, names => {
    for (const n of names) if (!tactics.value.strategies[n]) tactics.value.strategies[n] = emptyStrategy()
}, { immediate: true })
const stratOf = (n: string): AllyStrategyByName => tactics.value.strategies[n] ?? {}
const ultOn = (n: string) => { const s = stratOf(n); return (!!s.ultAtBreak && s.ultAtBreak !== 'free') || (!!s.ultOtherwise && s.ultOtherwise !== 'free') }
const strategyOn = (n: string) => strategyActive(stratOf(n))
const goalInTeam = (g: TacticGoalByName) => TEAM_METRICS.includes(g.metric) || teamNames.value.includes(g.ally)
const metricsFor = (g: TacticGoalByName): TacticMetric[] => g.ally ? ['av', 'ep', 'hp', 'magic', 'buff'] : TEAM_METRICS
const metricUnit = (g: TacticGoalByName) => g.metric === 'ep' || g.metric === 'hp' ? '%' : g.metric === 'av' || g.metric === 'elapsed' ? 'AV' : ''
// Keeps a goal consistent after its character / value changed (team values for "Team", a mode the value has).
function fixGoal(g: TacticGoalByName) {
    if (!metricsFor(g).includes(g.metric)) g.metric = g.ally ? 'av' : 'elapsed'
    if (g.metric === 'buff') { if (g.mode !== 'has' && g.mode !== 'lacks') g.mode = 'has' }
    else if (g.mode === 'has' || g.mode === 'lacks') g.mode = g.metric === 'av' || g.metric === 'elapsed' ? 'low' : 'high'
}
function addGoal() {
    const ally = teamNames.value[0] ?? ''
    tactics.value.goals.push({ ally, metric: 'av', mode: 'low', from: '' })
}
function removeGoal(i: number) { tactics.value.goals.splice(i, 1) }
function moveGoal(i: number, d: number) {
    const gs = tactics.value.goals, j = i + d
    if (j < 0 || j >= gs.length) return
    const [g] = gs.splice(i, 1)
    gs.splice(j, 0, g)
}
const dragGoal = ref<number | null>(null)
function dropGoal(i: number) {
    const from = dragGoal.value
    dragGoal.value = null
    if (from === null || from === i) return
    const gs = tactics.value.goals
    const [g] = gs.splice(from, 1)
    gs.splice(i, 0, g)
}
const tacticsCount = computed(() => tactics.value.goals.filter(goalInTeam).length + teamNames.value.filter(strategyOn).length + (tactics.value.spreadBreaks ? 1 : 0))
const tacticsSummary = computed(() => {
    const g = tactics.value.goals.filter(goalInTeam).length, s = teamNames.value.filter(strategyOn).length
    const sp = !!tactics.value.spreadBreaks
    if (!g && !s && !sp) return "don't care (the solver's own ranking and order)"
    return [sp ? 'spread breaks' : '', g ? `${g} goal${g === 1 ? '' : 's'}` : '', s ? `strategies for ${teamNames.value.filter(strategyOn).join(', ')}` : ''].filter(Boolean).join(' · ')
})
function clearTactics() {
    tacticsSetting.value = { goals: [], strategies: {}, spreadBreaks: false }
    for (const n of teamNames.value) tactics.value.strategies[n] = emptyStrategy()
}
function exportTactics() {
    downloadText('fight-solver-tactics.json', JSON.stringify({ format: 'exedra-fight-solver-tactics', version: 1, tactics: tactics.value }, null, 2))
}
const tacticsInput = ref<HTMLInputElement | null>(null)
async function importTactics(ev: Event) {
    const input = ev.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    try {
        const data = JSON.parse(await file.text())
        // Accept the Export tactics wrapper or a bare { goals, strategies } object.
        const t = data?.format === 'exedra-fight-solver-tactics' ? data.tactics : data
        if (!t || !Array.isArray(t.goals) || (t.strategies != null && typeof t.strategies !== 'object')) throw new Error('not a Fight Solver tactics file')
        tacticsSetting.value = normalizeTactics(t)
        for (const n of teamNames.value) if (!tactics.value.strategies[n]) tactics.value.strategies[n] = emptyStrategy()
        error.value = ''
    } catch (e) {
        error.value = `Could not import tactics: ${(e as Error).message}`
    }
}
const jobTactics = () => tacticsFromNames(tactics.value, props.slots.map(s => s.main?.name ?? ''))

// The prioritised characters of the search on screen (names, for the cards' title).
const jobPriority = ref<string[]>([])
const priorityIndexes = () => props.slots.map((s, i) => (priorityNames.value ?? []).includes(s.main?.name ?? '') ? i : -1).filter(i => i >= 0)
// The page's goals, plus any other HP goal a loaded file (or the command line) used, e.g. hp60.
const goalOptions = computed(() => {
  const share = hpGoalShare(goal.value)
  return SOLVER_GOALS.some(g => g.value === goal.value) || share === undefined ? SOLVER_GOALS
    : [...SOLVER_GOALS, { value: goal.value, label: `Boss / wave HP at ${Math.round(share * 100)}%` }]
})
const checkpointSlack = useSetting<number>('pveSolverSlack', 30)
const clearSlack = useSetting<number>('pveSolverClearSlack', 0)
const slack = computed<number>({
    get: () => (goal.value === 'clear' ? clearSlack.value : checkpointSlack.value) ?? 0,
    set: v => { if (goal.value === 'clear') clearSlack.value = v; else checkpointSlack.value = v },
})
const jobGoal = ref<SolverGoal>('clear')   // the goal of the search on screen
const maxAv = useSetting<number>('pveSolverMaxAv', 0)
const maxDepth = useSetting<number>('pveSolverMaxDepth', 0)
const memo = useSetting<boolean>('pveSolverMemo', true)
const stopOnAllyDeath = useSetting<boolean>('pveSolverStopOnAllyDeath', true)
// Exact pruning (the result stays optimal for the model)
const dominance = useSetting<boolean>('pveSolverDominance', true)
const symmetry = useSetting<boolean>('pveSolverSymmetry', true)
const beam = useSetting<boolean>('pveSolverBeam', true)
const searchOrder = useSetting<'best' | 'dfs'>('pveSolverSearch', 'best')
// Approximations (faster, may miss the best clear)
const lowerBound = useSetting<boolean>('pveSolverLowerBound', false)
const lbSafety = useSetting<number>('pveSolverLbSafety', 1.5)
const aiAllyTargets = useSetting<boolean>('pveSolverAiAllyTargets', false)
const aiEnemyTargets = useSetting<boolean>('pveSolverAiEnemyTargets', false)
const ultsAsap = useSetting<boolean>('pveSolverUltsAsap', false)
const ultHabits = useSetting<boolean>('pveSolverUltHabits', false)
const loose = useSetting<boolean>('pveSolverLoose', false)
// Performance
const workers = useSetting<number>('pveSolverWorkers', 0)
const autoWorkers = Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 2) - 1))

const STATUS_TEXT: Record<SolverNodeStatus, string> = {
    open: 'not explored yet', expanded: 'explored', win: 'clear', lose: 'defeat (wipe, round limit or an ally down)',
    merged: 'merged: same state reached before with no more AV', bound: 'cut: already slower than the best (+ AV slack)',
    cap: 'capped', error: 'engine error', dominated: 'dominated: an equal-or-better state was reached with no more AV',
    foreign: 'searched by another worker', skipped: 'skipped by you', checkpoint: 'reached the checkpoint',
}

const running = ref(false)
const stats = shallowRef<SolverStats | null>(null)
const selectedId = ref<number | null>(null)
const selected = shallowRef<SolverNodeView | null>(null)
const error = ref('')
const jobKey = ref('')

const inputKey = computed(() => JSON.stringify([props.slots, props.stageId, props.seed, props.rngMode, props.partyBuffId, props.raidCarry]))
const stale = computed(() => !!jobKey.value && jobKey.value !== inputKey.value)

const modeText = computed(() => {
    const r = props.rngMode === 'seed' ? `seed ${props.seed} (each path is one exact seeded battle)`
        : props.rngMode === 'manual' ? 'Manual RNG is searched as Weighted (rolls happen iff ≥ 50%; flipped rolls are not used)'
            : `${props.rngMode} RNG`
    return `RNG: ${r}.`
})

const statusText = computed(() => {
    const s = stats.value
    if (!s) return ''
    if (running.value) return 'Searching…'
    if (s.done && s.userSkipped > 0) return `Complete except ${s.userSkipped.toLocaleString()} skipped`
    if (s.done && s.bestElapsed === undefined && s.missedGoals) return 'No line meets your goal limits'
    if (s.done && jobGoal.value !== 'clear') return s.bestElapsed !== undefined ? 'Every line to the checkpoint searched' : 'No line reaches the checkpoint'
    if (s.done) return s.bestElapsed !== undefined ? 'Optimal (search complete)' : 'No clear exists'
    return s.stopReason === 'node limit' ? 'Node limit reached' : 'Stopped'
})
const statusPillClass = computed(() => running.value ? 'waiting' : stats.value?.bestElapsed !== undefined ? 'win' : 'lose')

const fmtAv = (v: number) => v.toFixed(1)
const roundOf = (t: number) => t < 150 ? 1 : Math.floor((t - 150) / 100) + 2
// `remaining` = waves still to come + the current wave's HP fraction (FightSolver.remaining).
function splitHp(rem: number): { frac: number, later: number } {
    const later = Math.max(0, Math.ceil(rem - 1e-9) - 1)
    return { frac: rem - later, later }
}
function hpText(rem: number): string {
    if (rem <= 0) return 'all enemies down'
    const { frac, later } = splitHp(rem)
    return `${(frac * 100).toFixed(1)}% enemy HP left${later ? ` (+${later} wave${later === 1 ? '' : 's'})` : ''}`
}

// ---- tree data (plain arrays, outside Vue reactivity; `treeVersion` signals changes) ----
// Global node ids: the page's own numbering of the merged tree of every worker (see `parts`).
const tree = {
    parent: [] as number[], elapsed: [] as number[], remaining: [] as number[], label: [] as string[],
    status: new Uint8Array(0), depth: [] as number[], children: [] as number[][], best: new Set<number>(),
    currents: [] as number[], // nodes the workers are expanding right now
    // layout: x in slots (siblings 1 apart), width in slots, maxDepth
    x: new Float64Array(0), leaves: 0, maxDepth: 0,
    owner: [] as number[], local: [] as number[], // global id -> worker, that worker's node id
}
const treeVersion = ref(0)
const treeSize = ref(0)
const FOREIGN = SOLVER_STATUSES.indexOf('foreign')

function resetTree() {
    fitZoomFloor = fitRowFloor = Infinity
    tree.parent = []; tree.elapsed = []; tree.remaining = []; tree.label = []; tree.status = new Uint8Array(0)
    tree.depth = []; tree.children = []; tree.best = new Set(); tree.currents = []; tree.x = new Float64Array(0); tree.leaves = 0; tree.maxDepth = 0
    tree.owner = []; tree.local = []
    treeSize.value = 0
    treeVersion.value++
}

// One search split over several workers: each runs the same prefix (only worker 0 sends it), then its share.
interface Part {
    worker: Worker
    map: number[]                  // the worker's node id -> global id
    queue: SolverTreeChunk[]       // chunks waiting for parents another worker has not sent yet
    stats?: SolverStats
    bestPath: number[]             // the worker's ids
    running: boolean
    status: Uint8Array             // the worker's latest statuses (its ids)
    candidates: CheckpointView[]   // the worker's checkpoint candidates (its ids)
}
const parts = shallowRef<Part[]>([])

// Adds a chunk of worker `w`'s nodes. Prefix nodes of workers > 0 are worker 0's (same ids); a chunk whose parents
// are not known yet waits in the queue.
function addChunk(w: number, c: SolverTreeChunk): boolean {
    const part = parts.value[w]
    const prefix = part.stats?.prefixSize ?? 0
    const zero = parts.value[0]
    for (let i = 0; i < c.parents.length; i++) {
        const local = c.from + i
        if (part.map[local] !== undefined) continue
        if (w !== 0 && local < prefix) {
            const g = zero.map[local]
            if (g === undefined) return false
            part.map[local] = g
            continue
        }
        const p = c.parents[i]
        const gp = p < 0 ? -1 : part.map[p] ?? (w !== 0 && p < prefix ? zero.map[p] : undefined)
        if (gp === undefined) return false
        if (p >= 0 && part.map[p] === undefined) part.map[p] = gp
        const id = tree.parent.length
        part.map[local] = id
        tree.parent.push(gp)
        tree.elapsed.push(c.elapsed[i])
        tree.remaining.push(c.remaining[i])
        tree.label.push(c.labels[i])
        tree.depth.push(gp < 0 ? 0 : tree.depth[gp] + 1)
        tree.children.push([])
        tree.owner.push(w)
        tree.local.push(local)
        if (gp >= 0) tree.children[gp].push(id)
    }
    part.status = c.status
    return true
}

// Statuses: each node from the worker that owns it; a prefix node from whichever worker does not mark it "foreign".
function mergeStatus() {
    const st = new Uint8Array(tree.parent.length)
    parts.value.forEach((part, w) => {
        const prefix = part.stats?.prefixSize ?? Infinity
        const zero = parts.value[0]
        part.status.forEach((code, local) => {
            const g = part.map[local] ?? (local < prefix ? zero.map[local] : undefined)
            if (g === undefined) return
            if (local < prefix && w !== 0 && code === FOREIGN) return
            if (local < prefix && code === FOREIGN && st[g]) return
            st[g] = code
        })
    })
    tree.status = st
}

// Tidy layout (Reingold-Tilford style contour packing): each subtree keeps its left/right outline per depth, siblings
// are pushed right just far enough that no level overlaps (1 slot apart), and a parent sits centred over its first and
// last child. Shallow leaves therefore tuck in above deep subtrees instead of each taking a column of their own.
function layoutTree() {
    const n = tree.parent.length
    const rel = new Float64Array(n)   // x relative to the parent
    const x = new Float64Array(n)
    let maxDepth = 0, minX = 0, maxX = 0
    if (n) {
        const left: number[][] = new Array(n), right: number[][] = new Array(n)
        // Post-order without recursion (the tree can be deep).
        const order: number[] = []
        const stack = [0]
        while (stack.length) { const id = stack.pop()!; order.push(id); for (const c of tree.children[id]) stack.push(c) }
        for (let k = order.length - 1; k >= 0; k--) {
            const id = order[k]
            const kids = tree.children[id]
            if (!kids.length) { left[id] = [0]; right[id] = [0]; continue }
            // Place children left to right; offsets relative to the first child.
            const accL = left[kids[0]].slice(), accR = right[kids[0]].slice()
            const off = [0]
            for (let c = 1; c < kids.length; c++) {
                const cl = left[kids[c]], cr = right[kids[c]]
                let shift = -Infinity
                const m = Math.min(cl.length, accR.length)
                for (let d = 0; d < m; d++) shift = Math.max(shift, accR[d] - cl[d] + 1)
                off.push(shift)
                for (let d = 0; d < cr.length; d++) {
                    if (d < accR.length) accR[d] = cr[d] + shift
                    else { accR.push(cr[d] + shift); accL.push(cl[d] + shift) }
                }
            }
            const centre = (off[0] + off[off.length - 1]) / 2
            kids.forEach((c, i) => { rel[c] = off[i] - centre })
            left[id] = [0, ...accL.map(v => v - centre)]
            right[id] = [0, ...accR.map(v => v - centre)]
            for (const c of kids) { left[c] = right[c] = undefined as any } // free
        }
        for (const id of order) {
            const p = tree.parent[id]
            x[id] = p < 0 ? 0 : x[p] + rel[id]
            if (x[id] < minX) minX = x[id]
            if (x[id] > maxX) maxX = x[id]
            if (tree.depth[id] > maxDepth) maxDepth = tree.depth[id]
        }
        for (let id = 0; id < n; id++) x[id] -= minX
    }
    tree.x = x
    tree.leaves = n ? maxX - minX + 1 : 0
    tree.maxDepth = maxDepth
    treeSize.value = n
    treeVersion.value++
}

// ---- checkpoint candidates: every worker's, on page ids, not worse in every way than another one ----
// `line` / `route`: candidates loaded from a file (no worker behind them; the line is all there is).
type Candidate = CheckpointView & { gid: number, line?: SolverLine, route?: { label: string, elapsed: number }[], note?: string }
const candidates = shallowRef<Candidate[]>([])
function mergedCandidates(): (CheckpointView & { gid: number })[] {
    const all = parts.value.flatMap(p => p.candidates.flatMap(c => p.map[c.id] !== undefined ? [{ ...c, gid: p.map[c.id] }] : []))
    return mergeCandidates(all)
}
const epPct = (a: { ep: number, maxEp: number }) => a.maxEp > 0 ? Math.min(100, 100 * a.ep / a.maxEp) : 0
const hasMagic = (c: CheckpointView) => c.allies.some(a => !!a.maxMagic)
// The hover text of an ally row: its numbers, then every buff / debuff / ailment on it (as in the Battle Timeline).
const allyTitle = (a: Candidate['allies'][number]) => {
    console.log(a)
    const lines = [`${a.name}: EP ${Math.round(a.ep)} / ${a.maxEp}${a.av !== undefined && !a.dead ? `, next turn in ${fmtAv(a.av)} AV` : ''}${a.maxMagic ? `, Magic ${a.magic} / ${a.maxMagic}` : ''}, HP ${a.hpPct.toFixed(0)}%`]
    for (const [label, list] of [['Buffs', a.buffs], ['Debuffs', a.debuffs], ['Ailments', a.ailments]] as const) {
        if (list?.length) lines.push('', `${label} (${list.length}):`, ...list)
    }
    return lines.join('\n')
}
// As the battle timeline shows it: a 1000-stack kit as a %, others as stacks / max.
const magicText = (a: { magic?: number, maxMagic?: number }) => !a.maxMagic ? '' : a.maxMagic === 1000 ? `${(a.magic ?? 0) / 10}%` : `${a.magic ?? 0}/${a.maxMagic}`
const teamEp = (c: CheckpointView) => `${Math.round(c.allies.reduce((s, a) => s + (a.dead ? 0 : epPct(a)), 0) / Math.max(1, c.allies.length))}%`
const hasTurns = (c: CheckpointView) => c.allies.some(a => a.av !== undefined)
const turnSum = (c: CheckpointView) => c.allies.reduce((s, a) => s + (a.dead ? 0 : a.av ?? 0), 0)
const shortName = (n: string) => n.length > 14 ? n.slice(0, 13) + '…' : n

// ---- workers ----
function terminateAll() { for (const p of parts.value) p.worker.terminate(); parts.value = [] }
function sendAll(m: FightSolverRequest) { for (const p of parts.value) p.worker.postMessage(m) }

// Combined statistics: counts summed (the shared prefix once), best of all, done when every worker is.
function combinedStats(): SolverStats | null {
    const ss = parts.value.map(p => p.stats).filter((x): x is SolverStats => !!x)
    if (!ss.length) return null
    const prefix = ss[0].prefixSize ?? 0
    const sum = (k: keyof SolverStats) => ss.reduce((a, x) => a + (Number(x[k]) || 0), 0)
    const bestIdx = bestPart()
    const best = bestIdx >= 0 ? parts.value[bestIdx].stats! : undefined
    const many = ss.length > 1 && ss.every(x => x.prefixSize !== undefined)
    return {
        ...ss[0],
        nodes: many ? prefix + ss.reduce((a, x) => a + x.nodes - (x.prefixSize ?? 0), 0) : sum('nodes'),
        expanded: sum('expanded'), actions: sum('actions'), merged: sum('merged'), dominated: sum('dominated'),
        bounded: sum('bounded'), lowerBounded: sum('lowerBounded'), symmetry: sum('symmetry'), capped: sum('capped'),
        wins: sum('wins'), losses: sum('losses'), errors: sum('errors'), open: sum('open'), userSkipped: sum('userSkipped'), checkpoints: sum('checkpoints'), allyFell: sum('allyFell'),
        ms: Math.max(...ss.map(x => x.ms)),
        bestElapsed: best?.bestElapsed,
        bestNode: best?.bestNode !== undefined ? parts.value[bestIdx].map[best.bestNode] : undefined,
        done: ss.length === parts.value.length && ss.every(x => x.done),
        stopReason: ss.every(x => x.done) ? 'search complete' : ss.some(x => x.stopReason === 'stopped') ? 'stopped' : ss.find(x => x.stopReason)?.stopReason,
        phase: ss.some(x => x.phase === 'prefix') ? 'prefix' : ss.every(x => x.phase === 'done') ? 'done' : 'search',
    }
}
function bestPart(): number {
    let bi = -1
    parts.value.forEach((p, i) => {
        const b = p.stats?.bestElapsed
        if (b !== undefined && (bi < 0 || b < parts.value[bi].stats!.bestElapsed!)) bi = i
    })
    return bi
}

const info = ref('')
let sharedBound = Infinity

function onMessage(w: number, m: FightSolverMessage) {
    const part = parts.value[w]
    if (!part) return
    if (m.type === 'error') {
        error.value = m.error
        // A failed replay (history / play / continue) must not leave the page waiting.
        if (m.request) { lineBusy.value = false; lineRequest = undefined; return }
        part.running = false
        running.value = parts.value.some(p => p.running)
        return
    }
    if (m.type === 'focused') { onFocused(m.count); return }
    if (m.type === 'decisions') { onLine(part, m); return }
    if (m.type === 'exported') { onExported(part, m.items); return }
    if (m.type === 'history') return   // (not used by the page: nodes are shown in the Battle Simulator)
    try { handleProgress(w, part, m) } finally { part.worker.postMessage({ type: 'ack' } satisfies FightSolverRequest) }
}
function handleProgress(w: number, part: (typeof parts.value)[number], m: Extract<FightSolverMessage, { type: 'progress' }>) {
    const wasRunning = running.value
    part.stats = m.stats
    part.running = m.running
    part.bestPath = m.bestPath
    part.candidates = m.candidates ?? []
    if (w === 0 && m.info) info.value = m.info
    // Share a better clear with the other workers (their bound).
    const b = m.stats.bestElapsed
    if (b !== undefined && b < sharedBound) {
        sharedBound = b
        parts.value.forEach((p, i) => { if (i !== w) p.worker.postMessage({ type: 'bound', elapsed: b } satisfies FightSolverRequest) })
    }
    let grew = false
    if (m.tree) part.queue.push(m.tree)
    // Drain every worker's queue (a chunk may wait for worker 0's prefix).
    for (let again = true; again;) {
        again = false
        parts.value.forEach((p, i) => {
            while (p.queue.length && addChunk(i, p.queue[0])) { p.queue.shift(); grew = again = true }
        })
    }
    mergeStatus()
    running.value = parts.value.some(p => p.running)
    stats.value = combinedStats()
    candidates.value = mergedCandidates()
    const bi = bestPart()
    const best = bi >= 0 ? parts.value[bi].bestPath.map(id => parts.value[bi].map[id]).filter(g => g !== undefined) : []
    const bestChanged = best.length !== tree.best.size || best.some(id => !tree.best.has(id))
    if (bestChanged) tree.best = new Set(best)
    tree.currents = parts.value.flatMap(p => p.running && p.stats?.current !== undefined && p.map[p.stats.current] !== undefined ? [p.map[p.stats.current]] : [])
    if (grew) { if (pointerInside) layoutPending = true; else layoutTree() }
    else if (bestChanged) treeVersion.value++
    else draw()
    if (autoFit && !pointerInside) fitView(false)
    const bestNode = stats.value?.bestNode
    // When the search pauses, show the best clear's battle (unless something else was picked).
    if (wasRunning && !running.value && bestNode !== undefined && (selectedId.value === null || autoSelected)) { select(bestNode, false); autoSelected = true }
}

const workerCount = () => {
    const n = Math.round(workers.value || 0)
    return Math.max(1, Math.min(16, n > 0 ? n : Math.min(8, (navigator.hardwareConcurrency || 2) - 1)))
}

// The opening of the current search ("solve from here") and the AI target sides it used.
let opening: SolverLine | undefined
let jobSides: ('friend' | 'opp')[] = []
// "Solve from here" from the Battle Simulator: a new search starting after its played part.
function solveFrom(line: SolverLine, route: SolverRouteStep[] = []) { start(line, route) }
// The route to where the current search starts (Continue / Solve from here on a node or a card): saved lines and
// cards list it before their own decisions. Unknown for a part played by hand in the simulator.
let openingRoute: SolverRouteStep[] = []
defineExpose({ solveFrom })

function start(from?: SolverLine | MouseEvent, route: SolverRouteStep[] = []) {
    openingRoute = from && !(from instanceof Event) ? route : []
    if (!props.canRun) return
    opening = from && !(from instanceof Event) ? from : undefined
    terminateAll()
    error.value = ''
    info.value = ''
    sharedBound = Infinity
    resetTree()
    candidates.value = []
    selectedId.value = null
    selected.value = null
    stats.value = null
    running.value = true
    autoFit = true
    autoSelected = false
    jobKey.value = inputKey.value
    const count = workerCount()
    const list: Part[] = []
    for (let index = 0; index < count; index++) {
        const worker = new Worker(new URL('../workers/fightSolverWorker.ts', import.meta.url), { type: 'module' })
        worker.onmessage = (e: MessageEvent<FightSolverMessage>) => onMessage(index, e.data)
        worker.onerror = (e) => { error.value = `Solver worker failed: ${e.message}`; list[index].running = false; running.value = list.some(p => p.running) }
        list.push({ worker, map: [], queue: [], bestPath: [], running: true, status: new Uint8Array(0), candidates: [] })
    }
    parts.value = list
    const job: FightSolverJob = {
        slots: JSON.parse(JSON.stringify(props.slots)), stageId: props.stageId, seed: props.seed, rngMode: props.rngMode,
        partyBuffId: props.partyBuffId, raidCarry: props.raidCarry ? JSON.parse(JSON.stringify(props.raidCarry)) : undefined,
        // The node limit is for the whole search: each worker gets its share.
        maxNodes: maxNodes.value > 0 ? Math.ceil(Math.max(100, maxNodes.value) / count) : 0, maxAv: Math.max(0, maxAv.value || 0), maxDepth: Math.max(0, Math.floor(maxDepth.value || 0)),
        memo: memo.value, dominance: dominance.value, symmetry: symmetry.value, beamWidth: beam.value ? 8 : 0, search: searchOrder.value,
        lowerBound: lowerBound.value ? Math.max(0.1, lbSafety.value || 1) : 0,
        aiAllyTargets: aiAllyTargets.value, aiEnemyTargets: aiEnemyTargets.value, ultsAsap: ultsAsap.value,
        ultHabits: ultHabits.value, loose: loose.value, stopOnAllyDeath: stopOnAllyDeath.value,
        partition: { index: 0, count },
        opening: opening ? JSON.parse(JSON.stringify(opening)) : undefined,
        goal: goal.value, slack: Math.max(0, slack.value || 0),
        priority: priorityIndexes(),
        tactics: jobTactics(),
    }
    lastJob = job
    jobPriority.value = (job.priority ?? []).map(i => props.slots[i]?.main?.name ?? `#${i + 1}`)
    loadedNote.value = ''
    loadedFile = undefined
    exportWait = undefined
    saving.value = false
    jobGoal.value = goal.value
    jobSides = [...(aiAllyTargets.value ? ['friend' as const] : []), ...(aiEnemyTargets.value ? ['opp' as const] : [])]
    list.forEach((p, index) => p.worker.postMessage({ type: 'start', job: { ...job, partition: { index, count } } } satisfies FightSolverRequest))
}
function stop() { sendAll({ type: 'stop' }) }
function resume() {
    if (!stats.value) return
    running.value = true
    const extra = maxNodes.value > 0 ? Math.ceil(Math.max(100, maxNodes.value) / parts.value.length) : 0
    for (const p of parts.value) {
        if (p.stats?.done) continue
        p.running = true
        const own = (p.stats?.nodes ?? 0) - (p.stats?.prefixSize ?? 0)
        p.worker.postMessage({ type: 'resume', maxNodes: extra > 0 ? own + extra : 0 } satisfies FightSolverRequest)
    }
}

// The worker to ask about a node: its owner; for a prefix node (in every worker) one that searched it itself.
function nodeWorker(id: number): Part | undefined {
    let part = parts.value[tree.owner[id]]
    const local = tree.local[id]
    if (part && local < (part.stats?.prefixSize ?? 0)) part = parts.value.find(p => p.status[local] !== FOREIGN) ?? part
    return part
}

// The user's priorities: a prefix node lives in every worker (same id), a later node only in its owner.
const prioritized = ref('')
let focusReplies = { kind: 'focus' as 'focus' | 'skip', expected: 0, replies: 0, count: 0, active: 0, later: false }
function prioritize(kind: 'focus' | 'skip') {
    const id = selectedId.value
    if (id === null) return
    const owner = parts.value[tree.owner[id]]
    const local = tree.local[id]
    if (!owner) return
    const targets = local < (owner.stats?.prefixSize ?? Infinity) ? parts.value : [owner]
    focusReplies = { kind, expected: targets.length, replies: 0, count: 0, active: 0, later: false }
    prioritized.value = '…'
    for (const p of targets) p.worker.postMessage({ type: kind, id: local } satisfies FightSolverRequest)
    // Searching a branch next also continues a paused search (one more node-limit's worth).
    if (kind === 'focus') { autoSelected = false; if (!running.value) resume() }
}
function onFocused(count: number) {
    const f = focusReplies
    f.replies++
    if (count < 0) f.later = true
    else { f.count += count; if (count > 0) f.active++ }
    const of = parts.value.length > 1 ? ` (${f.active} of ${parts.value.length} workers)` : ''
    prioritized.value = f.kind === 'skip'
        ? `${f.count.toLocaleString()} waiting line${f.count === 1 ? '' : 's'} skipped${of}`
        : f.later && !f.count ? 'Applied as soon as the pre-pass ends'
            : f.count ? `${f.count.toLocaleString()} waiting line${f.count === 1 ? '' : 's'} moved to the front${of}${f.active < parts.value.length ? ' — the other workers keep their own branches; "Solve from here" puts all of them on it' : ''}`
                : 'Nothing left to search in this branch (all of it is explored or cut)'
}

// A node's line as simulator decisions (from the worker that has it): shown in the simulator ("show": a tree click,
// without scrolling; "play": scrolled to), or the opening of a new search ("solve"). The reply also brings the
// node's details for the node panel.
let lineRequest: { action: 'show' | 'play' | 'solve', id: number, part: Part, load: boolean } | undefined
const lineBusy = ref(false)
function requestLine(action: 'show' | 'play' | 'solve', nodeId?: number, load = true) {
    const id = nodeId ?? selectedId.value
    if (id === null) return
    const card = candidates.value.find(c => c.gid === id)
    if (card?.line) {
        const line: SolverLine = JSON.parse(JSON.stringify(card.line))
        if (action === 'solve') start(line, card.route ?? []); else emit('play', line, { scroll: action === 'play' })
        return
    }
    const part = nodeWorker(id)
    if (!part) return
    lineRequest = { action, id, part, load }
    lineBusy.value = true
    part.worker.postMessage({ type: 'decisions', id: tree.local[id] } satisfies FightSolverRequest)
}
function onLine(part: Part, m: { id: number, decisions: SolverLine['decisions'], steps: number, openingSteps: number, route: SolverRouteStep[], view: SolverNodeView }) {
    const req = lineRequest
    if (!req || req.part !== part || tree.local[req.id] !== m.id) return   // an older request
    lineRequest = undefined
    lineBusy.value = false
    if (selectedId.value === req.id) {
        selected.value = { ...m.view, id: req.id, parent: tree.parent[req.id], mergedInto: m.view.mergedInto !== undefined ? part.map[m.view.mergedInto] : undefined, onBestPath: tree.best.has(req.id) }
    }
    const line: SolverLine = {
        decisions: m.decisions, steps: m.steps,
        control: opening?.control ?? 'manual',
        // The opening's own switches, then solver control from where the opening ended.
        switches: [...(opening?.switches ?? []), { at: m.openingSteps, aiSides: jobSides }],
    }
    if (req.action === 'solve') start(line, [...openingRoute, ...m.route])
    else if (req.load) {
        if (req.action === 'play') { emit('play', line, { scroll: true }); return }
        // A tree click: the simulator above changes height; keep the tree where it was on screen.
        const top = canvas.value?.getBoundingClientRect().top
        emit('play', line, { scroll: false })
        // (Re-checked for a moment: the simulator keeps growing while its portraits load.)
        if (top !== undefined) {
            const until = performance.now() + 3500
            const hold = () => {
                const now = canvas.value?.getBoundingClientRect().top
                if (now !== undefined && Math.abs(now - top) > 1) window.scrollBy(0, now - top)
                if (performance.now() < until) requestAnimationFrame(hold)
            }
            nextTick(() => requestAnimationFrame(hold))
        }
    }
}
// A card: a live one is a tree node (selected there too), a loaded one carries its line.
function openCard(c: Candidate) {
    if (c.line) { requestLine('play', c.gid); return }
    select(c.gid, true, true)
}
watch(selectedId, () => { prioritized.value = '' })

// ---- save / load results: the candidates (checkpoint states or clears) with the line to each, and the setup ----
let lastJob: FightSolverJob | undefined
const saving = ref(false)
const loadedNote = ref('')
const loadInput = ref<HTMLInputElement | null>(null)
// node: saving one node of the tree ("Save this line"), not the candidates.
let exportWait: { parts: Set<Part>, items: Map<Part, SolverExportItem[]>, node?: number } | undefined

function saveResults() {
    if (!candidates.value.length || saving.value) return
    // Loaded results: written back as they are.
    if (candidates.value.every(c => c.line) && loadedFile) { writeFile(loadedFile.setup, loadedFile.search, candidates.value); return }
    if (!lastJob) return
    const byPart = new Map<Part, number[]>()
    for (const c of candidates.value) {
        const part = nodeWorker(c.gid)
        if (!part) continue
        byPart.set(part, [...(byPart.get(part) ?? []), tree.local[c.gid]])
    }
    if (!byPart.size) return
    saving.value = true
    exportWait = { parts: new Set(byPart.keys()), items: new Map() }
    for (const [part, ids] of byPart) part.worker.postMessage({ type: 'export', ids } satisfies FightSolverRequest)
}

function onExported(part: Part, items: SolverExportItem[]) {
    const w = exportWait
    if (!w || !w.parts.has(part)) return
    w.items.set(part, items)
    if (w.items.size < w.parts.size) return
    exportWait = undefined
    saving.value = false
    const job = lastJob!
    if (w.node !== undefined) { saveNodeFile(job, w.node, [...w.items.values()][0]?.[0]); return }
    const out: Candidate[] = []
    let failed = 0
    for (const c of candidates.value) {
        const part = nodeWorker(c.gid)
        const it = part && w.items.get(part)?.find(x => x.id === tree.local[c.gid])
        if (!it || !it.decisions) { failed++; continue }
        out.push({ ...c, route: [...openingRoute, ...it.route], line: lineOf(it, opening, jobSides) })
    }
    if (failed) error.value = `${failed} state${failed === 1 ? '' : 's'} could not be replayed and were left out of the file`
    writeFile(jobSetup(job), jobSearch(job), out)
}

// The setup a job ran with, as a PvE Simulator export (team, stage, seed, RNG; no decisions).
function jobSetup(job: FightSolverJob): PvEExport {
    return buildPvEExport({
        stageId: job.stageId, control: 'auto', rngMode: job.rngMode, seed: job.seed, turns: 100,
        decisions: new Map(), slots: job.slots, snapshots: [],
        soloRaid: job.partyBuffId || job.raidCarry ? { partyBuffId: job.partyBuffId, attempts: job.raidCarry ? [job.raidCarry] : [] } : undefined,
    })
}
function jobSearch(job: FightSolverJob): SavedResults['search'] {
    const { slots: _s, partition: _p, ...rest } = job
    return { goal: jobGoal.value, slack: job.slack, job: rest, stats: stats.value }
}

// "Save this line": one node of the tree as a results file with a single card.
function saveNode() {
    const id = selectedId.value
    if (id === null || saving.value || !lastJob) return
    const part = nodeWorker(id)
    if (!part) return
    saving.value = true
    exportWait = { parts: new Set([part]), items: new Map(), node: id }
    part.worker.postMessage({ type: 'export', ids: [tree.local[id]], cards: true } satisfies FightSolverRequest)
}
function saveNodeFile(job: FightSolverJob, id: number, it: SolverExportItem | undefined) {
    if (!it?.decisions || !it.card) { error.value = `Could not save that line${it?.error ? `: ${it.error}` : ''}`; return }
    const depth = tree.depth[id] ?? 0
    const status = STATUS_TEXT[SOLVER_STATUSES[tree.status[id]] ?? 'open'] ?? ''
    const note = depth === 0 ? 'Start of the search' : `Decision ${depth} of the search${status ? ` (${status.split(':')[0]})` : ''}`
    writeFile(jobSetup(job), jobSearch(job), [{ ...it.card, gid: id, route: [...openingRoute, ...it.route], line: lineOf(it, opening, jobSides), note }], `line-d${depth}`)
}

function writeFile(setup: PvEExport, search: SavedResults['search'], list: Candidate[], tag?: string) {
    const data: SavedResults = {
        format: RESULTS_FORMAT, version: 1, savedAt: new Date().toISOString(), setup, search,
        candidates: list.map(({ gid: _g, id: _i, line, route, ...c }) => ({ ...c, line: line!, route: route ?? [] })),
    }
    downloadText(resultsFileName(setup.stageId, search.goal, new Date(), tag), JSON.stringify(data))
}

let loadedFile: SavedResults | undefined
async function loadResults(ev: Event) {
    const input = ev.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    try {
        const data = JSON.parse(await file.text()) as SavedResults
        if (data?.format !== RESULTS_FORMAT || !Array.isArray(data.candidates) || !data.setup) throw new Error('not a Fight Solver results file')
        terminateAll()
        error.value = ''
        info.value = ''
        resetTree()
        selectedId.value = null
        selected.value = null
        running.value = false
        lastJob = undefined
        if (props.applySetup) await props.applySetup(data.setup)
        await nextTick()
        goal.value = data.search.goal
        slack.value = data.search.slack
        jobGoal.value = data.search.goal
        const filled = data.setup.slots.filter(s => !!s.main)
        jobPriority.value = (data.search.job.priority ?? []).map(i => filled[i]?.main?.name ?? `#${i + 1}`)
        // The file's tactics into the form (Continue from here searches with them again).
        if (data.search.job.tactics) {
            tacticsSetting.value = normalizeTactics(tacticsToNames(data.search.job.tactics, filled.map(sl => sl.main?.name ?? '')))
            for (const n of teamNames.value) if (!tactics.value.strategies[n]) tactics.value.strategies[n] = emptyStrategy()
        }
        opening = undefined
        jobSides = [...(data.search.job.aiAllyTargets ? ['friend' as const] : []), ...(data.search.job.aiEnemyTargets ? ['opp' as const] : [])]
        stats.value = data.search.stats ? { ...data.search.stats, current: undefined, bestNode: undefined } : null
        candidates.value = data.candidates.map((c, i) => ({ ...c, id: i, gid: -1 - i }))
        loadedFile = data
        jobKey.value = inputKey.value
        const n = data.candidates.length
        const what = data.candidates.every(c => c.note) ? 'saved line' : data.search.goal === 'clear' ? 'clear' : 'checkpoint state'
        loadedNote.value = `Loaded ${n} ${what}${n === 1 ? '' : 's'} saved ${new Date(data.savedAt).toLocaleString()}. Play or continue from any of them; the search tree is not part of the file.`
    } catch (e) {
        error.value = `Could not load: ${(e as Error).message}`
    }
}

let autoSelected = false
// A tree node: selected in the tree and its panel; its line goes into the Battle Simulator (the one battle view).
// The automatic pick of the best clear when a search pauses only selects it (the simulator keeps what you have there).
function select(id: number, user = true, scroll = false) {
    if (user) autoSelected = false
    // A prefix node lives in every worker: ask the one that searched it (the others mark it "foreign").
    if (!nodeWorker(id)) return
    selectedId.value = id
    selected.value = null
    requestLine(scroll ? 'play' : 'show', id, user)
    draw()
}

// ---- canvas view: x zoom (px per leaf slot) + pan; rows have a fixed height ----
const pane = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const PAD_X = 28
const PAD_TOP = 22
const PAD_BOTTOM = 22
const MAX_ZOOM = 90
let width = 600
let zoom = 1          // px per leaf slot
let panX = 0          // screen x of slot 0 (before PAD_X)
let panY = 0
let rowH = 40
let baseRow = 40     // row height at the fitted zoom; zooming in grows rows too, more slowly than columns
let autoFit = true

// A fixed-size pane: its height never follows the tree, and during a search the fitted zoom and row height only
// ever shrink (a growing tree does not make the view jump back and forth).
const PANE_HEIGHT = 620
const paneHeight = computed(() => PANE_HEIGHT)
let fitZoomFloor = Infinity
let fitRowFloor = Infinity
// While the pointer is on the canvas the drawing holds still: new nodes wait (layoutPending) until it leaves.
let pointerInside = false
let layoutPending = false

const sx = (id: number) => PAD_X + panX + tree.x[id] * zoom
const sy = (id: number) => PAD_TOP + panY + tree.depth[id] * rowH

// (At least 60 slots wide, so the first few nodes don't start out huge.)
function fitZoom() { return Math.min(MAX_ZOOM, (width - 2 * PAD_X) / Math.max(60, tree.leaves - 1)) }
function clampView() {
    const h = paneHeight.value
    const treeH = PAD_TOP + PAD_BOTTOM + tree.maxDepth * rowH
    panY = treeH <= h ? 0 : Math.min(0, Math.max(h - treeH, panY))
    const span = Math.max(0, (tree.leaves - 1) * zoom)
    const inner = width - 2 * PAD_X
    panX = span <= inner ? (inner - span) / 2 : Math.min(0, Math.max(inner - span, panX))
}
// Zoom to `z` px per slot keeping the tree point under (mx, my) (pane coordinates) in place.
function setZoom(z: number, mx: number, my: number) {
    const slot = (mx - PAD_X - panX) / zoom
    const depth = (my - PAD_TOP - panY) / rowH
    zoom = Math.max(fitZoom(), Math.min(MAX_ZOOM, z))
    rowH = Math.min(72, baseRow * Math.pow(zoom / fitZoom(), 0.4))
    panX = mx - PAD_X - slot * zoom
    panY = my - PAD_TOP - depth * rowH
    clampView()
}
function fitView(user = true) {
    if (user) { autoFit = true; fitZoomFloor = fitRowFloor = Infinity }
    const h = paneHeight.value
    fitRowFloor = Math.min(fitRowFloor, Math.max(14, Math.min(40, (h - PAD_TOP - PAD_BOTTOM) / Math.max(20, tree.maxDepth))))
    baseRow = rowH = fitRowFloor
    fitZoomFloor = Math.min(fitZoomFloor, fitZoom())
    zoom = Math.min(fitZoom(), fitZoomFloor)
    panX = 0
    panY = 0
    clampView()
    draw()
}
// Frame the gold line: its horizontal extent fills the pane (a little margin), top of the tree in view.
function focusBest() {
    if (stats.value?.bestNode === undefined || !tree.x.length) return
    autoFit = false
    const xs = [...tree.best].map(id => tree.x[id])
    const lo = Math.min(...xs), hi = Math.max(...xs)
    const inner = width - 2 * PAD_X
    setZoom(inner / (hi - lo + 6), PAD_X, PAD_TOP)
    rowH = baseRow // the whole line top to bottom
    panX = inner / 2 - ((lo + hi) / 2) * zoom
    panY = 0
    clampView()
    draw()
}

function onWheel(e: WheelEvent) {
    if (!tree.leaves) return
    autoFit = false
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        panX -= (e.shiftKey ? e.deltaY : e.deltaX)
    } else {
        const rect = canvas.value!.getBoundingClientRect()
        setZoom(zoom * Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top)
    }
    clampView()
    draw()
}

const drag = ref<{ x: number, y: number, panX: number, panY: number, moved: boolean } | null>(null)
interface Hover { id: number, edge: boolean, x: number, y: number, depth: number, label: string, elapsed: number, remaining: number, status: SolverNodeStatus, best: boolean }
const hover = shallowRef<Hover | null>(null)
const tipStyle = computed(() => {
    const h = hover.value
    if (!h) return {}
    const left = Math.min(Math.max(8, h.x + 14), width - 260)
    // Lower half of the pane: the tooltip opens above the pointer so it never runs off the bottom.
    return h.y > paneHeight.value / 2
        ? { left: `${left}px`, bottom: `${paneHeight.value - h.y + 14}px` }
        : { left: `${left}px`, top: `${h.y + 14}px` }
})

function onPointerDown(e: PointerEvent) {
    drag.value = { x: e.clientX, y: e.clientY, panX, panY, moved: false }
    canvas.value?.setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
    const d = drag.value
    if (d) {
        const dx = e.clientX - d.x, dy = e.clientY - d.y
        if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
        if (d.moved) {
            autoFit = false
            panX = d.panX + dx
            panY = d.panY + dy
            clampView()
            draw()
        }
        return
    }
    const rect = canvas.value!.getBoundingClientRect()
    const px = e.clientX - rect.left, py = e.clientY - rect.top
    const hit = hitTest(px, py)
    const prev = hover.value
    if (!hit) { if (prev) { hover.value = null; draw() } return }
    const id = hit.id
    hover.value = {
        id, edge: hit.edge, x: px, y: py, depth: tree.depth[id], label: tree.label[id], elapsed: tree.elapsed[id],
        remaining: tree.remaining[id], status: SOLVER_STATUSES[tree.status[id]] ?? 'open', best: tree.best.has(id),
    }
    if (!prev || prev.id !== id || prev.edge !== hit.edge) draw()
}
function onPointerUp(e: PointerEvent) {
    const d = drag.value
    drag.value = null
    canvas.value?.releasePointerCapture(e.pointerId)
    if (d && !d.moved) {
        const rect = canvas.value!.getBoundingClientRect()
        const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top)
        if (hit) select(hit.id)
    }
}
function onPointerEnter() { pointerInside = true }
function onPointerLeave() {
    pointerInside = false
    if (!drag.value && hover.value) { hover.value = null; draw() }
    if (layoutPending) { layoutPending = false; layoutTree() }
}

const nodeRadius = () => Math.max(2, Math.min(6, zoom * 0.32))

// Nearest node within reach, else the nearest edge (an edge belongs to its child node).
function hitTest(px: number, py: number): { id: number, edge: boolean } | null {
    const n = tree.x.length // laid-out nodes only (newer ones wait while the pointer is on the canvas)
    if (!n) return null
    const reach = Math.max(7, nodeRadius() + 3)
    let bestNode = -1, bestD = reach * reach
    for (let id = 0; id < n; id++) {
        const dx = sx(id) - px, dy = sy(id) - py
        const d = (dx * dx + dy * dy) * (tree.best.has(id) ? 0.5 : 1) // the gold line wins close calls
        if (d < bestD) { bestD = d; bestNode = id }
    }
    if (bestNode >= 0) return { id: bestNode, edge: false }
    // Edges: only those whose rows straddle the pointer.
    let bestEdge = -1, bestE = 6
    for (let id = 1; id < n; id++) {
        const p = tree.parent[id]
        const y0 = sy(p), y1 = sy(id)
        if (py < y0 || py > y1) continue
        const d = distToEdge(px, py, sx(p), y0, sx(id), y1)
        if (d < bestE) { bestE = d; bestEdge = id }
    }
    return bestEdge >= 0 ? { id: bestEdge, edge: true } : null
}

// Edges are vertical S-curves (cubic, control points at mid height): sample them.
function edgePoint(x0: number, y0: number, x1: number, y1: number, t: number): [number, number] {
    const ym = (y0 + y1) / 2, u = 1 - t
    const x = u * u * u * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x1 + t * t * t * x1
    const y = u * u * u * y0 + 3 * u * u * t * ym + 3 * u * t * t * ym + t * t * t * y1
    return [x, y]
}
function distToEdge(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
    let best = Infinity
    let [ax, ay] = [x0, y0]
    for (let k = 1; k <= 12; k++) {
        const [bx, by] = edgePoint(x0, y0, x1, y1, k / 12)
        const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay
        const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy || 1)))
        const dx = ax + t * vx - px, dy = ay + t * vy - py
        best = Math.min(best, Math.hypot(dx, dy))
        ax = bx; ay = by
    }
    return best
}

// ---- drawing ----
let frame = 0
function draw() {
    if (frame) return
    frame = requestAnimationFrame(() => { frame = 0; paint() })
}

function cssVar(el: Element, name: string, fallback: string): string {
    return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

function paint() {
    const cv = canvas.value, pn = pane.value
    if (!cv || !pn) return
    const dpr = window.devicePixelRatio || 1
    const w = pn.clientWidth, h = pn.clientHeight
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
        cv.style.width = `${w}px`; cv.style.height = `${h}px`
    }
    const ctx = cv.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const n = tree.x.length // laid-out nodes only
    if (!n) return
    const gold = cssVar(cv, '--accent', '#f6d485')
    const text = cssVar(cv, '--text', '#f8eed7')
    const success = cssVar(cv, '--success', '#79d5aa')
    const info = cssVar(cv, '--info', '#8bcff9')
    const danger = cssVar(cv, '--danger', '#ff9b8f')
    const GREY = 'rgba(200, 192, 176, 0.42)'
    const GREY_FAINT = 'rgba(200, 192, 176, 0.2)'
    const r = nodeRadius()
    const visible = (x: number) => x > -40 && x < w + 40
    const st = (id: number) => SOLVER_STATUSES[tree.status[id]] ?? 'open'
    const faint = (s: SolverNodeStatus) => s === 'merged' || s === 'dominated' || s === 'bound' || s === 'cap' || s === 'open' || s === 'foreign' || s === 'skipped'
    const hoverId = hover.value?.id ?? -1

    const curve = (p: number, id: number) => {
        const x0 = sx(p), y0 = sy(p), x1 = sx(id), y1 = sy(id), ym = (y0 + y1) / 2
        ctx.moveTo(x0, y0)
        ctx.bezierCurveTo(x0, ym, x1, ym, x1, y1)
    }

    // Grey edges, batched by shade.
    ctx.lineWidth = 1
    for (const [shade, pick] of [[GREY_FAINT, true], [GREY, false]] as const) {
        ctx.strokeStyle = shade
        ctx.beginPath()
        for (let id = 1; id < n; id++) {
            const p = tree.parent[id]
            if (tree.best.has(id) || faint(st(id)) !== pick) continue
            const xa = sx(p), xb = sx(id)
            if ((xa < -40 && xb < -40) || (xa > w + 40 && xb > w + 40)) continue
            curve(p, id)
        }
        ctx.stroke()
    }
    // The search's current paths (root -> the node each worker is expanding), dashed gold, under the best line.
    const currentPath = new Set<number>()
    const heads = new Set(tree.currents)
    for (const head of tree.currents) for (let id = head < n ? head : -1; id >= 0; id = tree.parent[id]) currentPath.add(id)
    if (currentPath.size > 1) {
        ctx.strokeStyle = gold
        ctx.globalAlpha = 0.85
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        for (const id of currentPath) if (id > 0 && !tree.best.has(id)) curve(tree.parent[id], id)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
    }
    // Best path on top, gold.
    if (tree.best.size > 1) {
        ctx.strokeStyle = gold
        ctx.lineWidth = 2.5
        ctx.shadowColor = gold
        ctx.shadowBlur = 6
        ctx.beginPath()
        for (const id of tree.best) if (id > 0 && id < n) curve(tree.parent[id], id)
        ctx.stroke()
        ctx.shadowBlur = 0
    }
    // Hovered edge.
    if (hoverId > 0 && hover.value?.edge) {
        ctx.strokeStyle = tree.best.has(hoverId) ? gold : text
        ctx.lineWidth = 3
        ctx.beginPath()
        curve(tree.parent[hoverId], hoverId)
        ctx.stroke()
    }

    // Nodes.
    for (let id = 0; id < n; id++) {
        const x = sx(id)
        if (!visible(x)) continue
        const y = sy(id)
        if (y < -10 || y > h + 10) continue
        const s = st(id)
        const onBest = tree.best.has(id)
        ctx.beginPath()
        ctx.arc(x, y, onBest ? r + 1.5 : r, 0, Math.PI * 2)
        if (onBest) { ctx.fillStyle = gold; ctx.fill() }
        else if (s === 'open') { ctx.strokeStyle = GREY; ctx.lineWidth = 1.2; ctx.stroke() }
        else {
            ctx.fillStyle = s === 'win' ? success : s === 'checkpoint' ? info : s === 'lose' || s === 'error' ? danger : faint(s) ? GREY_FAINT : GREY
            ctx.globalAlpha = s === 'win' || s === 'checkpoint' || s === 'lose' || s === 'error' ? 0.6 : 1
            ctx.fill()
            ctx.globalAlpha = 1
        }
        if (heads.has(id)) {
            // Head of the current search: a gold ring.
            ctx.beginPath()
            ctx.arc(x, y, r + 4.5, 0, Math.PI * 2)
            ctx.strokeStyle = gold
            ctx.lineWidth = 2
            ctx.stroke()
        } else if (currentPath.has(id) && !onBest) {
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fillStyle = gold
            ctx.globalAlpha = 0.8
            ctx.fill()
            ctx.globalAlpha = 1
        }
        if (id === selectedId.value || id === hoverId) {
            ctx.beginPath()
            ctx.arc(x, y, (onBest ? r + 1.5 : r) + 3, 0, Math.PI * 2)
            ctx.strokeStyle = id === selectedId.value ? text : onBest ? gold : text
            ctx.lineWidth = 1.5
            ctx.stroke()
        }
    }
    // AV beside the best line's nodes, on a dark halo so it reads over the grey branches.
    ctx.font = '600 10.5px system-ui, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 4
    ctx.strokeStyle = cssVar(cv, '--panel-strong', '#141414')
    ctx.fillStyle = gold
    for (const id of tree.best) {
        if (id >= n) continue
        const x = sx(id), y = sy(id)
        if (!visible(x)) continue
        const t = fmtAv(tree.elapsed[id])
        ctx.strokeText(t, x + r + 6, y)
        ctx.fillText(t, x + r + 6, y)
    }
}

let resize: ResizeObserver | undefined
onMounted(() => {
    resize = new ResizeObserver(() => {
        width = pane.value?.clientWidth ?? width
        if (autoFit) fitView(false); else { clampView(); draw() }
    })
    if (pane.value) resize.observe(pane.value)
})
watch(treeVersion, () => nextTick(() => {
    width = pane.value?.clientWidth || width
    if (autoFit && !pointerInside) fitView(false); else { clampView(); draw() }
}))
onBeforeUnmount(() => { terminateAll(); resize?.disconnect(); if (frame) cancelAnimationFrame(frame) })
</script>

<style scoped>
.solver-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.6rem 1.1rem;
}

.field {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    font-size: 0.85rem;
}

.field-label {
    font-size: 0.74rem;
    color: var(--muted);
}

.field input {
    width: 5.5rem;
}

.check {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.82rem;
    color: var(--muted);
    cursor: pointer;
}

.solver-mode {
    text-align: center;
    margin: 0.4rem 0 0.6rem;
}

.muted {
    color: var(--muted);
}

.small {
    font-size: 0.78rem;
}

.center {
    text-align: center;
}

.solver-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
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
}

.btn-accent {
    background: var(--accent-glow);
    border-color: var(--border-strong);
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

.small-btn {
    padding: 0.3em 0.8em;
    font-size: 0.8rem;
}

.solver-error,
.solver-stale {
    text-align: center;
    font-size: 0.85rem;
    margin-bottom: 0.6rem;
}

.solver-error {
    color: var(--danger);
}

.solver-stale {
    color: var(--warning);
}

.option-groups {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
    margin: 0.6rem 0 0.2rem;
}

.option-group {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.35rem 0.8rem 0.55rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
    max-width: 640px;
    margin: 0;
}

.option-group legend {
    font-size: 0.75rem;
    color: var(--accent-soft);
    padding: 0 0.3rem;
}

input.tiny {
    width: 3.2rem;
    margin-left: 0.2rem;
}

.solver-info {
    text-align: center;
    margin: -0.4rem 0 0.6rem;
}

.solver-hint {
    text-align: center;
    margin: 0 auto 0.7rem;
    max-width: 720px;
    font-size: 0.82rem;
    color: var(--warning);
}

.solver-stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.4rem 0.9rem;
    margin-bottom: 0.8rem;
}

.result-pill {
    font-weight: 700;
    font-size: 0.85rem;
    padding: 0.2rem 0.8rem;
    border-radius: 999px;
    border: 1px solid currentColor;
}

.result-pill.win {
    color: var(--success);
}

.result-pill.lose {
    color: var(--danger);
}

.result-pill.waiting {
    color: var(--accent);
}

.best-av b {
    color: var(--accent);
}

/* ── tree ── */
.tree-wrap {
    margin-bottom: 0.8rem;
}

.tree-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.9rem;
    margin-bottom: 0.4rem;
    font-size: 0.78rem;
}

.tree-help {
    margin-left: auto;
}

.legend {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--muted);
}

.lg {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.lg.best {
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
}

.lg.current {
    border: 1.5px dashed var(--accent);
}

.lg.other {
    background: rgba(200, 192, 176, 0.42);
}

.lg.clear {
    background: var(--success);
    opacity: 0.55;
}

.lg.open {
    border: 1.2px solid rgba(200, 192, 176, 0.42);
}

.lg.checkpoint {
    background: var(--info);
    opacity: 0.6;
}

.lg.lose {
    background: var(--danger);
    opacity: 0.55;
}

.tree-pane {
    position: relative;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background:
        radial-gradient(ellipse at top, var(--accent-glow), transparent 60%),
        var(--bg-soft);
    overflow: hidden;
    user-select: none;
}

.tree-pane canvas {
    display: block;
    cursor: grab;
    touch-action: none;
}

.tree-pane canvas.pointing {
    cursor: pointer;
}

.tree-pane canvas.dragging {
    cursor: grabbing;
}

.tip {
    position: absolute;
    max-width: 250px;
    pointer-events: none;
    background: var(--panel-strong);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    padding: 0.45rem 0.6rem;
    font-size: 0.78rem;
    box-shadow: var(--shadow);
    z-index: 2;
}

.tip-title {
    color: var(--muted);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.tip-label {
    color: var(--text);
    font-weight: 600;
    margin: 0.15rem 0;
}

.tip-sub {
    color: var(--muted);
}

.tip-sub.win {
    color: var(--success);
}

.tip-sub.lose,
.tip-sub.error {
    color: var(--danger);
}

/* ── selected node ── */
.node-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.6rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.7rem 0.9rem;
    font-size: 0.85rem;
    background: var(--bg-soft);
    text-align: left;
}

.np-main {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 220px;
}

.np-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.np-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(200, 192, 176, 0.42);
}

.np-dot.win {
    background: var(--success);
}

.np-dot.lose,
.np-dot.error {
    background: var(--danger);
}

.np-dot.open {
    background: none;
    border: 1.2px solid rgba(200, 192, 176, 0.6);
}

.np-dot.best {
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
    border: none;
}

.best-tag {
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid var(--accent);
    border-radius: 999px;
    padding: 0 0.5rem;
}

.np-block {
    flex: 1 1 260px;
}

.np-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin-bottom: 0.15rem;
}

.np-picks {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.np-actors {
    line-height: 1.4;
}

.np-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.candidates {
    margin: 0 0 0.9rem;
}

.solver-file-buttons {
    display: inline-flex;
    gap: 0.5rem;
    margin-left: 1rem;
}

.hidden-file {
    display: none;
}

.solver-loaded {
    text-align: center;
    margin: 0.3rem 0 0.6rem;
}

.cand-route {
    margin-top: 0.4rem;
    font-size: 0.78rem;
}

.cand-route summary {
    cursor: pointer;
    color: var(--accent-soft);
}

.cand-route ol {
    max-height: 14rem;
    overflow-y: auto;
    margin: 0.3rem 0 0;
    padding-left: 1.6rem;
}

.cand-route li {
    margin: 0.1rem 0;
}

.cand-title {
    font-size: 0.95rem;
    color: var(--accent-soft);
    text-align: center;
    margin: 0 0 0.5rem;
    font-weight: 600;
}

.cand-title .muted {
    font-weight: 400;
    font-size: 0.8rem;
}

.cand-list {
    display: flex;
    gap: 0.6rem;
    overflow-x: auto;
    padding-bottom: 0.3rem;
}

.cand {
    flex: 0 0 auto;
    width: 250px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-soft);
    padding: 0.5rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.8rem;
    text-align: left;
}

.cand-legend span:nth-child(3) {
    text-align: right;
}

.cand-legend.with-magic span:nth-child(4) {
    text-align: right;
}

.cand-legend {
    font-size: 0.68rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.cand.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent) inset;
}

.cand-broken {
    color: var(--warning);
    font-weight: 600;
}

.cand-head {
    display: flex;
    flex-direction: column;
}

.cand-head b {
    color: var(--accent);
    font-size: 0.95rem;
}

.cand.win .cand-head b {
    color: var(--success);
}

.cand-allies {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.cand-ally {
    display: grid;
    grid-template-columns: 1fr 46px 40px 26px;
    gap: 0.35rem;
    align-items: center;
}

.cand-ally.with-magic {
    grid-template-columns: 1fr 40px 36px 38px 22px;
    gap: 0.3rem;
}

.cand-magic {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-size: 0.75rem;
    color: var(--accent-soft);
}

.cand-magic.full {
    color: var(--accent);
}

.cand-av {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--text);
    font-size: 0.75rem;
}

.cand-av.now {
    color: var(--accent);
}

.cand-note {
    color: var(--accent-soft);
    font-size: 0.75rem;
}

.cand-keys {
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.6rem;
    color: var(--muted);
}

.cand-keys b {
    color: var(--text);
    font-weight: 600;
}

.cand-ally.dead {
    opacity: 0.4;
    text-decoration: line-through;
}

.cand-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
}

.cand-name.prio {
    color: var(--accent);
}

.priority-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.75rem;
}

.prio-chip {
    font-size: 0.78rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-soft);
    color: var(--muted);
    cursor: pointer;
}

.prio-chip.on {
    border-color: var(--accent);
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.bar {
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
}

.bar i {
    display: block;
    height: 100%;
}

.bar.ep i {
    background: var(--info);
}

.bar.ep.full i {
    background: var(--accent);
    box-shadow: 0 0 4px var(--accent);
}

.bar.hp {
    height: 4px;
}

.bar.hp i {
    background: var(--success);
    opacity: 0.55;
}

.cand-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
}
.tactics {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.35rem 0.8rem;
    margin: 0 auto 0.75rem;
    max-width: 1100px;
    text-align: left;
}

.tactics summary {
    cursor: pointer;
    font-size: 0.82rem;
}

.tactics-title {
    color: var(--accent-soft);
    font-weight: 600;
}

.tactics[open] summary {
    margin-bottom: 0.5rem;
}

.tactic-group {
    max-width: none;
    flex-direction: column;
    flex-wrap: nowrap;
    margin-bottom: 0.6rem;
}

.tactic-empty {
    margin: 0.2rem 0;
}

.goal-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    padding: 0.15rem 0.3rem;
    border-radius: var(--radius-sm);
    background: var(--bg-soft);
    cursor: grab;
}

.goal-row.gone {
    opacity: 0.45;
}

.goal-rank {
    min-width: 1.2rem;
    text-align: right;
    color: var(--accent);
    font-weight: 600;
}

.goal-row select,
.strat-cell select {
    font-size: 0.78rem;
    max-width: 12rem;
}

.buff-input {
    width: 7rem;
    font-size: 0.78rem;
}

.goal-row .icon-btn {
    width: 1.6rem;
    height: 1.6rem;
    min-width: 0;
    font-size: 0.65rem;
    padding: 0;
    border-radius: 6px;
}

.goal-row input.tiny,
.strat-cell input.tiny {
    padding: 0.1rem 0.3rem;
    height: 1.6rem;
}

.tactic-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.2rem;
}

.strat-grid {
    display: grid;
    grid-template-columns: minmax(7rem, auto) auto auto auto;
    gap: 0.3rem 0.8rem;
    align-items: center;
    font-size: 0.8rem;
    overflow-x: auto;
}

.strat-head {
    font-size: 0.68rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.strat-name {
    white-space: nowrap;
    color: var(--muted);
}

.strat-name.on {
    color: var(--accent);
}

.strat-cell {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
}

.strat-cell input.tiny {
    margin-left: 0;
    width: 2.6rem;
}

.strict-select {
    color: var(--muted);
}

.cand-goals {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    font-size: 0.74rem;
    color: var(--muted);
}

.cand-goal.ok b {
    color: var(--success);
}

.cand-goal.miss {
    color: var(--danger);
}

.cand.miss {
    opacity: 0.7;
    border-style: dashed;
}

@media (max-width: 640px) {
    .strat-grid {
        grid-template-columns: 1fr;
    }

    .strat-head {
        display: none;
    }

    .strat-name {
        margin-top: 0.4rem;
        font-weight: 600;
    }
}
</style>
