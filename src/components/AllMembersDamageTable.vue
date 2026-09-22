<template>
  <div class="all-members-dmg">
    <p v-if="!members" class="all-members-dmg-empty">Fill out the full team to see this breakdown.</p>

    <div v-else class="all-members-dmg-sections">
      <div v-for="group in dmgGroups" :key="group.key" class="all-members-dmg-section">
        <div class="all-members-dmg-header" :title="group.title">{{ group.label }}</div>

        <div class="all-members-dmg-grid">
          <div v-for="m in members" :key="m.index" class="all-members-dmg-slot">
            <h4 class="all-members-dmg-slot-title">{{ m.name }}</h4>
            <div class="all-members-dmg-value">
              <div class="all-members-dmg-max">{{ dmgStat(m, group.key).max.toLocaleString() }}</div>
              <template v-if="dmgStat(m, group.key).avg !== 0">
                <div class="all-members-dmg-avg">avg {{ dmgStat(m, group.key).avg.toLocaleString() }}</div>
                <div class="all-members-dmg-crit">{{ dmgStat(m, group.key).crit }}% crit</div>
              </template>
              <div v-else-if="group.key === 'skill'" class="all-members-dmg-crit">Swap skills (Akumura BS, Sumire BS etc is currently bugged, coming soon)</div>
            </div>
          </div>
        </div>

        <template v-if="group.noConsumeKey">
          <div class="all-members-dmg-subheader" :title="group.noConsumeTitle">without 1 time buffs</div>

          <div class="all-members-dmg-grid">
            <div v-for="m in members" :key="m.index" class="all-members-dmg-slot all-members-dmg-slot-compact">
              <div class="all-members-dmg-value">
                <div class="all-members-dmg-max">{{ dmgStat(m, group.noConsumeKey).max.toLocaleString() }}</div>
                <template v-if="dmgStat(m, group.key).avg !== 0">
                  <div class="all-members-dmg-avg">avg {{ dmgStat(m, group.noConsumeKey).avg.toLocaleString() }}</div>
                  <div class="all-members-dmg-crit">{{ dmgStat(m, group.noConsumeKey).crit }}% crit</div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="all-members-dmg-header">Follow Up Damage</div>
      <div class="all-members-dmg-subheader">Coming soon</div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface DmgPair {
  max: number
  avg: number
  crit: string
}

export interface MemberDmgBreakdown {
  index: number
  name: string
  special: DmgPair
  specialNoConsume: DmgPair
  skill: DmgPair
  skillNoConsume: DmgPair
  followUp: DmgPair
  followUpNoConsume: DmgPair
}

defineProps<{
  members: MemberDmgBreakdown[] | undefined
}>()

type DmgStatKey = 'special' | 'specialNoConsume' | 'skill' | 'skillNoConsume' | 'followUp' | 'followUpNoConsume'

interface DmgGroup {
  key: DmgStatKey
  label: string
  title: string
  noConsumeKey: DmgStatKey | null
  noConsumeTitle: string
}

const dmgGroups: DmgGroup[] = [
  {
    key: 'special',
    label: 'Special dmg',
    title: "Damage dealt by this member's Special, if they were the one attacking",
    noConsumeKey: 'specialNoConsume',
    noConsumeTitle:
      "Same as Special dmg, but without any one-turn buffs (e.g. 'One Turn ATK%+') that get used up",
  },
  {
    key: 'skill',
    label: 'Skill dmg',
    title: "Damage dealt by this member's Skill, if they were the one attacking",
    noConsumeKey: 'skillNoConsume',
    noConsumeTitle:
      "Same as Skill dmg, but without any one-turn buffs (e.g. 'One Turn ATK%+') that get used up",
  },
  /*{ TODO: Implement for fua
    key: 'followUp',
    label: 'Follow-up dmg',
    title: "Damage dealt by this member's Follow-up Attack, if they were the one attacking",
    noConsumeKey: 'followUpNoConsume',
    noConsumeTitle:
      "Same as Follow-up dmg, but without any one-turn buffs (e.g. 'One Turn ATK%+') that get used up",
  },*/
]

const dmgStat = (m: MemberDmgBreakdown, key: DmgStatKey): DmgPair => m[key]
</script>

<style scoped>
.all-members-dmg {
  width: 100%;
  margin-top: 0.75rem;
}

.all-members-dmg-empty {
  font-size: 0.85rem;
  color: var(--muted);
  text-align: center;
  margin: 0.5rem 0 0;
}

.all-members-dmg-sections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.all-members-dmg-section {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.all-members-dmg-header {
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.85rem;
  font-weight: 600;
}

.all-members-dmg-subheader {
  padding: 0.3rem 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.75rem;
  font-style: italic;
  color: var(--muted);
}

.all-members-dmg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
}

.all-members-dmg-slot {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.5rem 0.75rem;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  min-width: 0;
}

.all-members-dmg-slot:last-child {
  border-right: none;
}

.all-members-dmg-slot-compact {
  padding-top: 0.35rem;
}

.all-members-dmg-slot-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
}

.all-members-dmg-value {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-variant-numeric: tabular-nums;
}

.all-members-dmg-max {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.8rem;
}

.all-members-dmg-avg,
.all-members-dmg-crit {
  color: var(--muted);
  font-weight: 500;
  font-size: 0.72rem;
}
</style>
