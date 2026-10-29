// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { ActiveSkill } from "./ActiveSkill";
import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { AdditionalSkill } from "./AdditionalSkill";
import type { NormalAttack } from "./NormalAttack";
import type { SpecialAttack } from "./SpecialAttack";

// ---- ReDriveBattleCore.BattleUnitSkillSet  (TypeDefIndex 293, public class) ----
export class BattleUnitSkillSet {
    /** 0x10 private ActiveSkill[] <ActiveSkills>k__BackingField */
    _ActiveSkills: ActiveSkill[] = null!;
    /** 0x18 private SpecialAttack <SpecialAttack>k__BackingField */
    _SpecialAttack: SpecialAttack = null!;
    /** 0x20 private NormalAttack <NormalAttack>k__BackingField */
    _NormalAttack: NormalAttack = null!;
    /** 0x28 private AdditionalSkill[] <AdditionalSkills>k__BackingField */
    _AdditionalSkills: AdditionalSkill[] = null!;
    /** 0x30 private ActiveSkillBase[] <SwitchableSkills>k__BackingField */
    _SwitchableSkills: ActiveSkillBase[] = null!;
    /** 0x38 private ActiveSkillBase[] <StepUpSkills>k__BackingField */
    _StepUpSkills: ActiveSkillBase[] = null!;
    /** 0x40 private int[] activeSkillMstIds */
    activeSkillMstIds: int[] = null!;
    /** 0x48 private int[] activeSkillWeightValues */
    activeSkillWeightValues: int[] = null!;
    /** 0x50 private int[] activeSkillHpGaugeValues */
    activeSkillHpGaugeValues: int[] = null!;
    /** 0x58 private int specialAttackMstId */
    specialAttackMstId: int = 0;
    /** 0x5C private int normalAttackMstId */
    normalAttackMstId: int = 0;
    /** 0x60 private int[] additionalSkillMstIds */
    additionalSkillMstIds: int[] = null!;
    /** 0x68 private int[] switchableSkillMstIds */
    switchableSkillMstIds: int[] = null!;
    /** 0x70 private int[] switchableNormalAttackMstIds */
    switchableNormalAttackMstIds: int[] = null!;
    /** 0x78 private int[] stepUpSkillMstIds */
    stepUpSkillMstIds: int[] = null!;
    get ActiveSkills(): ActiveSkill[] { return this.get_ActiveSkills(); }
    set ActiveSkills(v: ActiveSkill[]) { this.set_ActiveSkills(v); }
    get SpecialAttack(): SpecialAttack { return this.get_SpecialAttack(); }
    set SpecialAttack(v: SpecialAttack) { this.set_SpecialAttack(v); }
    get NormalAttack(): NormalAttack { return this.get_NormalAttack(); }
    set NormalAttack(v: NormalAttack) { this.set_NormalAttack(v); }
    get AdditionalSkills(): AdditionalSkill[] { return this.get_AdditionalSkills(); }
    set AdditionalSkills(v: AdditionalSkill[]) { this.set_AdditionalSkills(v); }
    get SwitchableSkills(): ActiveSkillBase[] { return this.get_SwitchableSkills(); }
    set SwitchableSkills(v: ActiveSkillBase[]) { this.set_SwitchableSkills(v); }
    set StepUpSkills(v: ActiveSkillBase[]) { this.set_StepUpSkills(v); }
    get StepUpSkills(): ActiveSkillBase[] { return this.get_StepUpSkills(); }
    /** @rva 0x730C50  public ActiveSkill[] get_ActiveSkills() { } */
    get_ActiveSkills(): ActiveSkill[] { return this._ActiveSkills; /* auto-property */ }
    /** @rva 0x730C60  public void set_ActiveSkills(ActiveSkill[] value) { } */
    set_ActiveSkills(value: ActiveSkill[]): void { this._ActiveSkills = value; /* auto-property */ }
    /** @rva 0x733E90  public SpecialAttack get_SpecialAttack() { } */
    get_SpecialAttack(): SpecialAttack { return this._SpecialAttack; /* auto-property */ }
    /** @rva 0x736AB0  public void set_SpecialAttack(SpecialAttack value) { } */
    set_SpecialAttack(value: SpecialAttack): void { this._SpecialAttack = value; /* auto-property */ }
    /** @rva 0x7369E0  public NormalAttack get_NormalAttack() { } */
    get_NormalAttack(): NormalAttack { return this._NormalAttack; /* auto-property */ }
    /** @rva 0x736A50  public void set_NormalAttack(NormalAttack value) { } */
    set_NormalAttack(value: NormalAttack): void { this._NormalAttack = value; /* auto-property */ }
    /** @rva 0x736EA0  public AdditionalSkill[] get_AdditionalSkills() { } */
    get_AdditionalSkills(): AdditionalSkill[] { return this._AdditionalSkills; /* auto-property */ }
    /** @rva 0x736F10  public void set_AdditionalSkills(AdditionalSkill[] value) { } */
    set_AdditionalSkills(value: AdditionalSkill[]): void { this._AdditionalSkills = value; /* auto-property */ }
    /** @rva 0x736F00  public ActiveSkillBase[] get_SwitchableSkills() { } */
    get_SwitchableSkills(): ActiveSkillBase[] { return this._SwitchableSkills; /* auto-property */ }
    /** @rva 0x736F30  public void set_SwitchableSkills(ActiveSkillBase[] value) { } */
    set_SwitchableSkills(value: ActiveSkillBase[]): void { this._SwitchableSkills = value; /* auto-property */ }
    /** @rva 0x736A30  public void set_StepUpSkills(ActiveSkillBase[] value) { } */
    set_StepUpSkills(value: ActiveSkillBase[]): void { this._StepUpSkills = value; /* auto-property */ }
    /** @rva 0x736970  public ActiveSkillBase[] get_StepUpSkills() { } */
    get_StepUpSkills(): ActiveSkillBase[] { return this._StepUpSkills; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x13941B0  public void .ctor(ActiveSkill[] activeSkills, SpecialAttack specialAttack, NormalAttack normalAttack, AdditionalSkill[] additionalSkills, ActiveSkillBase[] switchableSkills, ActiveSkillBase[] stepUpSkills) { } */
    ctor$ActiveSkill_SpecialAttack_NormalAttack_AdditionalSkill_ActiveSkillBase_ActiveSkillBase(activeSkills: ActiveSkill[], specialAttack: SpecialAttack, normalAttack: NormalAttack, additionalSkills: AdditionalSkill[], switchableSkills: ActiveSkillBase[], stepUpSkills: ActiveSkillBase[]): this {
        this._ActiveSkills = activeSkills;
        this._SpecialAttack = specialAttack;
        this._NormalAttack = normalAttack;
        this._AdditionalSkills = additionalSkills;
        this._SwitchableSkills = switchableSkills;
        this._StepUpSkills = stepUpSkills ?? []; // [UNCERTAIN] the store goes through a helper call (Array.Empty when null?)
        return this;
    }
    /** @rva 0x1392C00  public List<ActiveSkillBase> GetList() { } */
    GetList(): List<ActiveSkillBase> {
        const list: ActiveSkillBase[] = [];
        if (this.ActiveSkills != null) for (const s of this.ActiveSkills) list.push(s);
        if (this.NormalAttack != null) list.push(this.NormalAttack);
        if (this.SpecialAttack != null) list.push(this.SpecialAttack);
        for (const s of this.AdditionalSkills) list.push(s); // no null check (NRE when null)
        if (this.SwitchableSkills != null) for (const s of this.SwitchableSkills) list.push(s);
        if (this._StepUpSkills != null) for (const s of this._StepUpSkills) list.push(s); // 3.21.0
        return list;
    }
    /** @rva 0x1392FE0  public ActiveSkillBase GetSkill(int skillMstId) { } */
    GetSkill(skillMstId: int): ActiveSkillBase {
        return this.GetList().find(skill => skill.Id === skillMstId) ?? null!; // DisplayClass23_0 <GetSkill>b__0
    }
    /** @rva 0x13938D0  public void OnSerializing(StreamingContext _) { } */
    OnSerializing(_: any /* StreamingContext */): void { return notPorted("BattleUnitSkillSet.OnSerializing", 0x13938D0); }
    /** @rva 0x13930B0  public void OnDeserialized(StreamingContext _) { } */
    OnDeserialized(_: any /* StreamingContext */): void { return notPorted("BattleUnitSkillSet.OnDeserialized", 0x13930B0); }
}
