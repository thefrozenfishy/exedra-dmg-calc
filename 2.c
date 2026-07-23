
/* WARNING: Unknown calling convention -- yet parameter storage is locked */

ReDriveBattleCore_AffectedUnitNotice_DamageInfo_o *
ReDriveBattleCore.BattleDamageCalculator$$GetBreakDamage
          (ReDriveBattleCore_BattleUnit_o *attackUnit,ReDriveBattleCore_BattleUnit_o *defenseUnit,
          int32_t attackElement,MethodInfo *method)

{
  int iVar1;
  byte bVar2;
  long lVar3;
  undefined *puVar4;
  undefined *puVar5;
  int32_t iVar6;
  System_Decimal_o *damage;
  System_Decimal_o *damage_00;
  System_Decimal_o *damage_01;
  System_Decimal_o *damage_02;
  ReDriveBattleCore_BattleUnit_o *attackUnit_00;
  System_Decimal_o *d1;
  ReDriveBattleCore_CorrelationEffect_o *__this;
  MethodInfo *method_00;
  System_Decimal_o *pSVar7;
  System_Decimal_o *value;
  bool doForceToNormal;
  int32_t damageBaseType;
  int32_t attackElement_00;
  MethodInfo *method_01;
  MethodInfo *method_02;
  System_Decimal_o *d2;
  MethodInfo *method_03;
  MethodInfo *pMVar8;
  ReDriveBattleCore_BattleParameter_o *pRVar9;
  System_Decimal_o *pSVar10;
  System_Decimal_o *extraout_x8;
  System_Decimal_o *extraout_x8_00;
  System_Decimal_o *__return_storage_ptr__;
  System_Decimal_o *__return_storage_ptr___00;
  System_Decimal_o *__return_storage_ptr___01;
  System_Decimal_o *__return_storage_ptr___02;
  System_Decimal_o *__return_storage_ptr___03;
  System_Decimal_o *extraout_x8_01;
  ReDriveBattleCore_BreakPoint_o *pRVar11;
  ReDriveBattleCore_AffectedUnitNotice_DamageInfo_o *__this_00;
  int iVar12;
  undefined1 local_78 [24];
  undefined8 uStack_60;
  long local_58;
  
  pMVar8 = (MethodInfo *)(ulong)(uint)attackElement;
  lVar3 = tpidr_el0;
  local_58 = *(long *)(lVar3 + 0x28);
  if ((DAT_7b9c0d87b9 & 1) == 0) {
    FUN_7b966d56ec(PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200);
    FUN_7b966d56ec(PTR_ReDriveBattleCore.CharacterParameter_TypeInfo_7b9bae2280);
    FUN_7b966d56ec(PTR_ReDriveBattleCore.CorrelationEffect_TypeInfo_7b9bae2208);
    FUN_7b966d56ec(PTR_ReDriveBattleCore.AffectedUnitNotice.DamageInfo_TypeInfo_7b9bae1ea8);
    FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
    FUN_7b966d56ec(PTR_DAT_7b9bab8678);
    DAT_7b9c0d87b9 = 1;
  }
  puVar4 = PTR_System.Decimal_TypeInfo_7b9babf060;
  if (attackUnit == (ReDriveBattleCore_BattleUnit_o *)0x0) goto LAB_7b96e31c5c;
  pRVar9 = (attackUnit->fields)._BattleParameter_k__BackingField;
  if (pRVar9 != (ReDriveBattleCore_BattleParameter_o *)0x0) {
    bVar2 = ((*(Il2CppClass **)PTR_ReDriveBattleCore.CharacterParameter_TypeInfo_7b9bae2280)->_2).
            naturalAligment;
    if ((bVar2 <= (pRVar9->klass->_2).naturalAligment) &&
       ((pRVar9->klass->_2).typeHierarchy[(ulong)bVar2 - 1] ==
        *(Il2CppClass **)PTR_ReDriveBattleCore.CharacterParameter_TypeInfo_7b9bae2280)) {
      if ((defenseUnit == (ReDriveBattleCore_BattleUnit_o *)0x0) ||
         (pRVar11 = (defenseUnit->fields)._BreakPoint_k__BackingField,
         pRVar11 == (ReDriveBattleCore_BreakPoint_o *)0x0)) {
LAB_7b96e31c5c:
                    /* WARNING: Subroutine does not return */
        FUN_7b966d5988();
      }
      iVar12 = (pRVar11->fields).maxPointValue;
      iVar1 = *(int *)((long)&pRVar9[1].klass + 4);
      pSVar10 = (System_Decimal_o *)
                (ulong)*(uint *)(*(long *)PTR_System.Decimal_TypeInfo_7b9babf060 + 0xe0);
      if (*(uint *)(*(long *)PTR_System.Decimal_TypeInfo_7b9babf060 + 0xe0) == 0) {
        thunk_FUN_7b9673f810();
        pSVar10 = extraout_x8;
      }
      System.Decimal$$op_Explicit
                (pSVar10,((float)iVar1 / 10.0) * (((float)iVar12 + 0.5) / 360.0),(MethodInfo *)0x0);
      puVar5 = PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200;
      pSVar10 = (System_Decimal_o *)
                (ulong)*(uint *)(*(long *)
                                  PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200 +
                                0xe0);
      if (*(uint *)(*(long *)PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200 + 0xe0
                   ) == 0) {
        thunk_FUN_7b9673f810();
        pSVar10 = extraout_x8_00;
      }
      ReDriveBattleCore.BattleDamageCalculator$$GetAddedBreakDamage
                (pSVar10,attackUnit,damage,method_01);
      ReDriveBattleCore.BattleDamageCalculator$$GetAppliedDamageOfBreakSituation
                (__return_storage_ptr__,defenseUnit,damage_00,doForceToNormal,(MethodInfo *)0x1);
      ReDriveBattleCore.BattleDamageCalculator$$GetDefenseCorrectedDamage
                (*(System_Decimal_o **)(*(long *)puVar5 + 0xb8),attackUnit,defenseUnit,damage_01,
                 damageBaseType,
                 (MethodInfo *)
                 (ulong)(uint)((*(System_Decimal_o **)(*(long *)puVar5 + 0xb8))->fields).flags);
      ReDriveBattleCore.BattleDamageCalculator$$GetProcessedReceiveDamage
                (__return_storage_ptr___00,attackUnit,defenseUnit,damage_02,method_02);
      ReDriveBattleCore.BattleDamageCalculator$$GetElementResistDamage
                (__return_storage_ptr___01,attackUnit_00,defenseUnit,
                 (System_Decimal_o *)attackUnit_00,attackElement_00,pMVar8);
      __this = (ReDriveBattleCore_CorrelationEffect_o *)
               thunk_FUN_7b9675b2f8
                         (*(undefined8 *)PTR_ReDriveBattleCore.CorrelationEffect_TypeInfo_7b9bae2208
                         );
      ReDriveBattleCore.CorrelationEffect$$.ctor(__this,attackUnit,defenseUnit,attackElement,pMVar8)
      ;
      if (__this == (ReDriveBattleCore_CorrelationEffect_o *)0x0) goto LAB_7b96e31c5c;
      System.Decimal$$op_Explicit
                (__return_storage_ptr___02,(__this->fields)._ElementDamageRatio_k__BackingField,
                 (MethodInfo *)0x0);
      System.Decimal$$op_Multiply(__return_storage_ptr___03,d1,d2,method_00);
      local_78._16_8_ = *(uint64_t *)(*(long *)(*(long *)puVar4 + 0xb8) + 0x10);
      uStack_60 = *(undefined8 *)(*(long *)(*(long *)puVar4 + 0xb8) + 0x18);
      if (*(int *)(*(long *)PTR_DAT_7b9bab8678 + 0xe0) == 0) {
        thunk_FUN_7b9673f810();
      }
      if (DAT_7b9c0d8860 == '\0') {
        FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
        DAT_7b9c0d8860 = '\x01';
      }
      if (*(int *)(*(long *)puVar4 + 0xe0) == 0) {
        thunk_FUN_7b9673f810();
      }
      pSVar7 = System.Decimal$$Max((System_Decimal_o *)(local_78 + 0x10),
                                   (System_Decimal_o *)local_78,(MethodInfo *)0x0);
      pSVar10 = *(System_Decimal_o **)&pSVar7->fields;
      pMVar8 = *(MethodInfo **)&(pSVar7->fields).lo;
      if (DAT_7b9c0d8861 == '\0') {
        FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
        DAT_7b9c0d8861 = '\x01';
      }
      pSVar7 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar4 + 0xe0);
      if (*(uint *)(*(long *)puVar4 + 0xe0) == 0) {
        thunk_FUN_7b9673f810();
        pSVar7 = extraout_x8_01;
      }
      System.Decimal$$Ceiling(pSVar7,pSVar10,pMVar8);
      iVar6 = System.Decimal$$op_Explicit(value,method_03);
      __this_00 = (ReDriveBattleCore_AffectedUnitNotice_DamageInfo_o *)
                  thunk_FUN_7b9675b2f8
                            (*(undefined8 *)
                              PTR_ReDriveBattleCore.AffectedUnitNotice.DamageInfo_TypeInfo_7b9bae1ea 8
                            );
      System.Object$$.ctor((Il2CppObject *)__this_00,(MethodInfo *)0x0);
      (__this_00->fields)._DamageValue_k__BackingField = iVar6;
      (__this_00->fields)._AttackElement_k__BackingField = attackElement;
      (__this_00->fields)._IsCritical_k__BackingField = false;
      (__this_00->fields)._IsBreakBonusApplied_k__BackingField = false;
      (__this_00->fields)._CorrelationDamageType_k__BackingField = 2;
      (__this_00->fields)._IsBarrierDamage_k__BackingField = false;
      (__this_00->fields)._IsReflectionDamage_k__BackingField = false;
      goto LAB_7b96e319e4;
    }
  }
  __this_00 = (ReDriveBattleCore_AffectedUnitNotice_DamageInfo_o *)0x0;
LAB_7b96e319e4:
  if (*(long *)(lVar3 + 0x28) == local_58) {
    return __this_00;
  }
                    /* WARNING: Subroutine does not return */
  thunk_EXT_FUN_7ce7b83514();
}

