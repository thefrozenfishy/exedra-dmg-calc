
/* WARNING: Unknown calling convention -- yet parameter storage is locked */

int32_t ReDriveBattleCore.BattleDamageCalculator$$GetSlipDamageValue
                  (ReDriveBattleCore_BattleUnit_o *attackUnit,
                  ReDriveBattleCore_BattleUnit_o *defenseUnit,System_Decimal_o *damageBase,
                  int32_t attackElement,int32_t damageBaseType,int32_t battleType,MethodInfo *method
                  )

{
  uint64_t uVar1;
  undefined8 uVar2;
  uint uVar3;
  long lVar4;
  undefined *puVar5;
  undefined *puVar6;
  int32_t iVar7;
  System_Decimal_o *damage;
  System_Decimal_o *damage_00;
  System_Decimal_o *damage_01;
  ReDriveBattleCore_BattleUnit_o *attackUnit_00;
  System_Decimal_o *d1;
  ReDriveBattleCore_CorrelationEffect_o *__this;
  MethodInfo *method_00;
  System_Decimal_o *damage_02;
  System_Decimal_o *damage_03;
  long lVar8;
  System_Decimal_o *pSVar9;
  System_Decimal_o *value;
  int32_t damageBaseType_00;
  int32_t attackElement_00;
  int32_t attackElement_01;
  MethodInfo *method_01;
  System_Decimal_o *d2;
  MethodInfo *method_02;
  MethodInfo *method_03;
  MethodInfo *method_04;
  MethodInfo *pMVar10;
  System_Decimal_o *pSVar11;
  System_Decimal_o *extraout_x8;
  System_Decimal_o *__return_storage_ptr__;
  System_Decimal_o *__return_storage_ptr___00;
  System_Decimal_o *__return_storage_ptr___01;
  System_Decimal_o *__return_storage_ptr___02;
  System_Decimal_o *extraout_x8_00;
  System_Decimal_o *__return_storage_ptr___03;
  System_Decimal_o *__return_storage_ptr___04;
  System_Decimal_o *extraout_x8_01;
  System_Decimal_o *extraout_x8_02;
  float value_00;
  undefined1 local_88 [24];
  undefined8 uStack_70;
  long local_68;
  
  puVar5 = PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200;
  pMVar10 = (MethodInfo *)(ulong)(uint)damageBaseType;
  lVar4 = tpidr_el0;
  local_68 = *(long *)(lVar4 + 0x28);
  if ((DAT_7b9c0d87ba & 1) == 0) {
    FUN_7b966d56ec(PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200);
    FUN_7b966d56ec(PTR_ReDriveBattleCore.CorrelationEffect_TypeInfo_7b9bae2208);
    FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
    FUN_7b966d56ec(PTR_DAT_7b9bab8678);
    DAT_7b9c0d87ba = 1;
  }
  puVar6 = PTR_ReDriveBattleCore.CorrelationEffect_TypeInfo_7b9bae2208;
  uVar3 = *(uint *)(*(long *)puVar5 + 0xe0);
  pSVar11 = (System_Decimal_o *)(ulong)uVar3;
  if (uVar3 == 0) {
    thunk_FUN_7b9673f810();
    pSVar11 = extraout_x8;
  }
  ReDriveBattleCore.BattleDamageCalculator$$GetAppliedDamageOfBreakSituation
            (pSVar11,defenseUnit,damageBase,SUB41(attackElement,0),(MethodInfo *)0x0);
  ReDriveBattleCore.BattleDamageCalculator$$GetDefenseCorrectedDamage
            (__return_storage_ptr__,attackUnit,defenseUnit,damage,damageBaseType_00,
             (MethodInfo *)(ulong)(uint)battleType);
  ReDriveBattleCore.BattleDamageCalculator$$GetProcessedGiveDamage
            (__return_storage_ptr___00,attackUnit,defenseUnit,damage_00,attackElement_00,pMVar10);
  ReDriveBattleCore.BattleDamageCalculator$$GetProcessedReceiveDamage
            (__return_storage_ptr___01,attackUnit,defenseUnit,damage_01,method_01);
  ReDriveBattleCore.BattleDamageCalculator$$GetElementResistDamage
            (__return_storage_ptr___02,attackUnit_00,defenseUnit,(System_Decimal_o *)attackUnit_00,
             attackElement_01,pMVar10);
  __this = (ReDriveBattleCore_CorrelationEffect_o *)thunk_FUN_7b9675b2f8(*(undefined8 *)puVar6);
  ReDriveBattleCore.CorrelationEffect$$.ctor(__this,attackUnit,defenseUnit,damageBaseType,pMVar10);
  puVar6 = PTR_System.Decimal_TypeInfo_7b9babf060;
  if (__this == (ReDriveBattleCore_CorrelationEffect_o *)0x0) {
                    /* WARNING: Subroutine does not return */
    FUN_7b966d5988();
  }
  value_00 = (__this->fields)._ElementDamageRatio_k__BackingField;
  pSVar11 = (System_Decimal_o *)
            (ulong)*(uint *)(*(long *)PTR_System.Decimal_TypeInfo_7b9babf060 + 0xe0);
  if (*(uint *)(*(long *)PTR_System.Decimal_TypeInfo_7b9babf060 + 0xe0) == 0) {
    thunk_FUN_7b9673f810();
    pSVar11 = extraout_x8_00;
  }
  System.Decimal$$op_Explicit(pSVar11,value_00,(MethodInfo *)0x0);
  System.Decimal$$op_Multiply(__return_storage_ptr___03,d1,d2,method_00);
  ReDriveBattleCore.BattleDamageCalculator$$GetDifficultyCorrectedDamage
            (__return_storage_ptr___04,attackUnit,defenseUnit,damage_02,method_02);
  if (((int)method == 4) || ((int)method == 2)) {
    uVar3 = *(uint *)(*(long *)puVar5 + 0xe0);
    pSVar11 = (System_Decimal_o *)(ulong)uVar3;
    if (uVar3 == 0) {
      thunk_FUN_7b9673f810();
      pSVar11 = extraout_x8_01;
    }
    ReDriveBattleCore.BattleDamageCalculator$$SlipDamageCutByPvpOrGvgSuppression
              (pSVar11,damage_03,method_03);
  }
  puVar5 = PTR_DAT_7b9bab8678;
  lVar8 = *(long *)puVar6;
  if (*(int *)(lVar8 + 0xe0) == 0) {
    thunk_FUN_7b9673f810();
    lVar8 = *(long *)puVar6;
  }
  uVar1 = *(uint64_t *)(*(long *)(lVar8 + 0xb8) + 0x10);
  uVar2 = *(undefined8 *)(*(long *)(lVar8 + 0xb8) + 0x18);
  if (*(int *)(*(long *)puVar5 + 0xe0) == 0) {
    thunk_FUN_7b9673f810(*(long *)puVar5);
  }
  local_88._16_8_ = uVar1;
  uStack_70 = uVar2;
  if (DAT_7b9c0d8860 == '\0') {
    FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
    DAT_7b9c0d8860 = '\x01';
  }
  if (*(int *)(*(long *)puVar6 + 0xe0) == 0) {
    thunk_FUN_7b9673f810();
  }
  pSVar9 = System.Decimal$$Max((System_Decimal_o *)(local_88 + 0x10),(System_Decimal_o *)local_88,
                               (MethodInfo *)0x0);
  pSVar11 = *(System_Decimal_o **)&pSVar9->fields;
  pMVar10 = *(MethodInfo **)&(pSVar9->fields).lo;
  if (DAT_7b9c0d8861 == '\0') {
    FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
    DAT_7b9c0d8861 = '\x01';
  }
  pSVar9 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar6 + 0xe0);
  if (*(uint *)(*(long *)puVar6 + 0xe0) == 0) {
    thunk_FUN_7b9673f810();
    pSVar9 = extraout_x8_02;
  }
  System.Decimal$$Ceiling(pSVar9,pSVar11,pMVar10);
  iVar7 = System.Decimal$$op_Explicit(value,method_04);
  if (*(long *)(lVar4 + 0x28) == local_68) {
    return iVar7;
  }
                    /* WARNING: Subroutine does not return */
  thunk_EXT_FUN_7ce7b83514();
}

