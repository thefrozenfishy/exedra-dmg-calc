
/* WARNING: Unknown calling convention -- yet parameter storage is locked */

ReDriveBattleCore_AffectedUnitNotice_o *
ReDriveBattleCore.BattleDamageCalculator$$GetAttackDamageResult
          (ReDriveBattleCore_BattleUnit_o *attackUnit,ReDriveBattleCore_BattleUnit_o *defenseUnit,
          System_Decimal_o *damageBase,int32_t attackElement,int32_t damageBaseType,
          ReDriveBattleCore_ActiveSkillBase_o *attackSkill,int32_t battleType,MethodInfo *method)

{
  uint64_t uVar1;
  undefined8 uVar2;
  int iVar3;
  int32_t affectedUnitId;
  long lVar4;
  undefined *puVar5;
  undefined *puVar6;
  undefined *puVar7;
  undefined *puVar8;
  bool bVar9;
  bool isCritical;
  int32_t iVar10;
  System_Collections_Generic_HashSet_T__o *__this;
  System_Decimal_o *damage;
  System_Decimal_o *damage_00;
  System_Decimal_o *damage_01;
  ReDriveBattleCore_BattleUnit_o *attackUnit_00;
  System_Decimal_o *d1;
  ReDriveBattleCore_CorrelationEffect_o *__this_00;
  MethodInfo *method_00;
  System_Decimal_o *damage_02;
  System_Decimal_o *extraout_x0;
  System_Decimal_o *damage_03;
  System_Decimal_o *damage_04;
  System_Decimal_o *extraout_x0_00;
  long lVar11;
  System_Decimal_o *value;
  ReDriveBattleCore_AffectedUnitNotice_o *pRVar12;
  System_Collections_Generic_List_string__o *pSVar13;
  ReDriveBattleCore_AffectedUnitNotice_o *pRVar14;
  int32_t damageBaseType_00;
  int32_t attackElement_00;
  int32_t attackElement_01;
  MethodInfo *method_02;
  System_Decimal_o *d2;
  MethodInfo *method_03;
  MethodInfo *extraout_x1;
  MethodInfo *attackSkill_00;
  ReDriveBattleCore_BattleUnit_o *method_04;
  ReDriveBattleCore_BattleUnit_o *extraout_x1_00;
  MethodInfo *method_05;
  MethodInfo *pMVar15;
  MethodInfo *pMVar16;
  System_Decimal_o *pSVar17;
  System_Decimal_o *extraout_x8;
  System_Decimal_o *__return_storage_ptr__;
  System_Decimal_o *__return_storage_ptr___00;
  System_Decimal_o *__return_storage_ptr___01;
  System_Decimal_o *__return_storage_ptr___02;
  System_Decimal_o *extraout_x8_00;
  System_Decimal_o *__return_storage_ptr___03;
  System_Decimal_o *extraout_x8_01;
  System_Decimal_o *pSVar18;
  System_Decimal_o *extraout_x8_02;
  System_Decimal_o *__return_storage_ptr___04;
  System_Decimal_o *extraout_x8_03;
  System_Decimal_o *extraout_x8_04;
  System_Decimal_o *extraout_x8_05;
  ReDriveBattleCore_BreakPoint_o *pRVar19;
  ReDriveBattleCore_BattleParameter_o *pRVar20;
  ReDriveBattleCore_AffectedUnitNotice_DamageInfo_array *pRVar21;
  int iVar22;
  int iVar23;
  bool isBreakBonusApplied;
  ReDriveBattleCore_BattleUnit_o *defenseUnit_00;
  float value_00;
  System_ValueTuple_AffectedUnitNotice__int__int__o SVar24;
  MethodInfo *in_stack_ffffffffffffff40;
  undefined1 local_98 [24];
  undefined8 uStack_80;
  long local_78;
  MethodInfo *method_01;
  
  puVar7 = PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200;
  puVar5 = PTR_System.Collections.Generic.HashSet<string>_TypeInfo_7b9bac0288;
  puVar6 = PTR_Method$System.Collections.Generic.HashSet<string>..ctor()_7b9bac0280;
  pMVar16 = (MethodInfo *)(ulong)(uint)damageBaseType;
  lVar4 = tpidr_el0;
  local_78 = *(long *)(lVar4 + 0x28);
  if ((DAT_7b9c0d87b8 & 1) == 0) {
    FUN_7b966d56ec(PTR_ReDriveBattleCore.AffectedUnitNotice_TypeInfo_7b9bae1ea0);
    FUN_7b966d56ec(PTR_ReDriveBattleCore.BattleDamageCalculator_TypeInfo_7b9bae2200);
    FUN_7b966d56ec(PTR_ReDriveBattleCore.CorrelationEffect_TypeInfo_7b9bae2208);
    FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
    FUN_7b966d56ec(PTR_Method$System.Linq.Enumerable.ToList<string>()_7b9bac6940);
    FUN_7b966d56ec(PTR_Method$System.Collections.Generic.HashSet<string>..ctor()_7b9bac0280);
    FUN_7b966d56ec(PTR_System.Collections.Generic.HashSet<string>_TypeInfo_7b9bac0288);
    FUN_7b966d56ec(PTR_DAT_7b9bab8678);
    DAT_7b9c0d87b8 = 1;
  }
  puVar8 = PTR_ReDriveBattleCore.CorrelationEffect_TypeInfo_7b9bae2208;
  __this = (System_Collections_Generic_HashSet_T__o *)thunk_FUN_7b9675b2f8(*(undefined8 *)puVar5);
  System.Collections.Generic.HashSet<object>$$.ctor(__this,*(MethodInfo_5CE77DC **)puVar6);
  pSVar17 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar7 + 0xe0);
  if (*(uint *)(*(long *)puVar7 + 0xe0) == 0) {
    thunk_FUN_7b9673f810();
    pSVar17 = extraout_x8;
  }
  ReDriveBattleCore.BattleDamageCalculator$$GetAppliedDamageOfBreakSituation
            (pSVar17,defenseUnit,damageBase,SUB41(attackElement,0),(MethodInfo *)0x0);
  ReDriveBattleCore.BattleDamageCalculator$$GetDefenseCorrectedDamage
            (__return_storage_ptr__,attackUnit,defenseUnit,damage,damageBaseType_00,
             (MethodInfo *)((ulong)attackSkill & 0xffffffff));
  ReDriveBattleCore.BattleDamageCalculator$$GetProcessedGiveDamage
            (__return_storage_ptr___00,attackUnit,defenseUnit,damage_00,attackElement_00,pMVar16);
  ReDriveBattleCore.BattleDamageCalculator$$GetProcessedReceiveDamage
            (__return_storage_ptr___01,attackUnit,defenseUnit,damage_01,method_02);
  ReDriveBattleCore.BattleDamageCalculator$$GetElementResistDamage
            (__return_storage_ptr___02,attackUnit_00,defenseUnit,(System_Decimal_o *)attackUnit_00,
             attackElement_01,pMVar16);
  __this_00 = (ReDriveBattleCore_CorrelationEffect_o *)thunk_FUN_7b9675b2f8(*(undefined8 *)puVar8);
  ReDriveBattleCore.CorrelationEffect$$.ctor
            (__this_00,attackUnit,defenseUnit,damageBaseType,pMVar16);
  puVar6 = PTR_System.Decimal_TypeInfo_7b9babf060;
  if (__this_00 != (ReDriveBattleCore_CorrelationEffect_o *)0x0) {
    iVar3 = (__this_00->fields)._DamageType_k__BackingField;
    value_00 = (__this_00->fields)._ElementDamageRatio_k__BackingField;
    pSVar17 = (System_Decimal_o *)
              (ulong)*(uint *)(*(long *)PTR_System.Decimal_TypeInfo_7b9babf060 + 0xe0);
    if (*(uint *)(*(long *)PTR_System.Decimal_TypeInfo_7b9babf060 + 0xe0) == 0) {
      thunk_FUN_7b9673f810();
      pSVar17 = extraout_x8_00;
    }
    System.Decimal$$op_Explicit(pSVar17,value_00,(MethodInfo *)0x0);
    pMVar16 = method_00;
    System.Decimal$$op_Multiply(__return_storage_ptr___03,d1,d2,method_00);
    isCritical = ReDriveBattleCore.BattleDamageCalculator$$IsCriticalDamage
                           (attackUnit,defenseUnit,pMVar16);
    method_01 = (MethodInfo *)(ulong)isCritical;
    pSVar17 = damage_02;
    pMVar16 = method_03;
    if (isCritical) {
      pSVar17 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar7 + 0xe0);
      if (*(uint *)(*(long *)puVar7 + 0xe0) == 0) {
        thunk_FUN_7b9673f810();
        pSVar17 = extraout_x8_01;
      }
      ReDriveBattleCore.BattleDamageCalculator$$GetAddedCriticalDamage
                (pSVar17,attackUnit,damage_02,method_03);
      pSVar17 = extraout_x0;
      pMVar16 = extraout_x1;
    }
    pSVar18 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar7 + 0xe0);
    if (*(uint *)(*(long *)puVar7 + 0xe0) == 0) {
      thunk_FUN_7b9673f810();
      pSVar18 = extraout_x8_02;
    }
    ReDriveBattleCore.BattleDamageCalculator$$GetDifficultyCorrectedDamage
              (pSVar18,attackUnit,defenseUnit,pSVar17,pMVar16);
    pMVar16 = attackSkill_00;
    ReDriveBattleCore.BattleDamageCalculator$$GetProcessedFinalGiveDamage
              (__return_storage_ptr___04,attackUnit,defenseUnit,damage_03,
               (ReDriveBattleCore_ActiveSkillBase_o *)attackSkill_00,
               (MethodInfo *)(ulong)(uint)battleType);
    if (((int)method == 4) || (pSVar17 = damage_04, defenseUnit_00 = method_04, (int)method == 2)) {
      pSVar17 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar7 + 0xe0);
      if (*(uint *)(*(long *)puVar7 + 0xe0) == 0) {
        thunk_FUN_7b9673f810();
        pSVar17 = extraout_x8_03;
      }
      ReDriveBattleCore.BattleDamageCalculator$$DamageCutByPvpOrGvgSuppression
                (pSVar17,damage_04,(MethodInfo *)method_04);
      pSVar17 = extraout_x0_00;
      defenseUnit_00 = extraout_x1_00;
    }
    pSVar18 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar7 + 0xe0);
    if (*(uint *)(*(long *)puVar7 + 0xe0) == 0) {
      thunk_FUN_7b9673f810();
      pSVar18 = extraout_x8_04;
    }
    puVar5 = PTR_DAT_7b9bab8678;
    ReDriveBattleCore.BattleDamageCalculator$$DamageCutByShield
              (pSVar18,pSVar17,defenseUnit_00,(MethodInfo *)defenseUnit);
    lVar11 = *(long *)puVar6;
    if (*(int *)(lVar11 + 0xe0) == 0) {
      thunk_FUN_7b9673f810();
      lVar11 = *(long *)puVar6;
    }
    uVar1 = *(uint64_t *)(*(long *)(lVar11 + 0xb8) + 0x10);
    uVar2 = *(undefined8 *)(*(long *)(lVar11 + 0xb8) + 0x18);
    if (*(int *)(*(long *)puVar5 + 0xe0) == 0) {
      thunk_FUN_7b9673f810(*(long *)puVar5);
    }
    local_98._16_8_ = uVar1;
    uStack_80 = uVar2;
    if (DAT_7b9c0d8860 == '\0') {
      FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
      DAT_7b9c0d8860 = '\x01';
    }
    if (*(int *)(*(long *)puVar6 + 0xe0) == 0) {
      thunk_FUN_7b9673f810();
    }
    pSVar18 = System.Decimal$$Max((System_Decimal_o *)(local_98 + 0x10),(System_Decimal_o *)local_98
                                  ,(MethodInfo *)0x0);
    pSVar17 = *(System_Decimal_o **)&pSVar18->fields;
    pMVar15 = *(MethodInfo **)&(pSVar18->fields).lo;
    if (DAT_7b9c0d8861 == '\0') {
      FUN_7b966d56ec(PTR_System.Decimal_TypeInfo_7b9babf060);
      DAT_7b9c0d8861 = '\x01';
    }
    pSVar18 = (System_Decimal_o *)(ulong)*(uint *)(*(long *)puVar6 + 0xe0);
    if (*(uint *)(*(long *)puVar6 + 0xe0) == 0) {
      thunk_FUN_7b9673f810();
      pSVar18 = extraout_x8_05;
    }
    System.Decimal$$Ceiling(pSVar18,pSVar17,pMVar15);
    pMVar15 = (MethodInfo *)0x0;
    iVar10 = System.Decimal$$op_Explicit(value,method_05);
    if (defenseUnit != (ReDriveBattleCore_BattleUnit_o *)0x0) {
      affectedUnitId = (defenseUnit->fields)._Id_k__BackingField;
      pRVar12 = (ReDriveBattleCore_AffectedUnitNotice_o *)
                thunk_FUN_7b9675b2f8
                          (*(undefined8 *)
                            PTR_ReDriveBattleCore.AffectedUnitNotice_TypeInfo_7b9bae1ea0);
      ReDriveBattleCore.AffectedUnitNotice$$.ctor(pRVar12,affectedUnitId,pMVar15);
      if (pRVar12 != (ReDriveBattleCore_AffectedUnitNotice_o *)0x0) {
        (pRVar12->fields)._IsWeakElementAttacked_k__BackingField = iVar3 == 2;
        SVar24 = ReDriveBattleCore.BattleDamageCalculator$$DamageCutByBarrier
                           (iVar10,defenseUnit,pRVar12,pMVar16);
        puVar6 = PTR_Method$System.Linq.Enumerable.ToList<string>()_7b9bac6940;
        pRVar12 = SVar24.fields.Item1;
        pRVar19 = (defenseUnit->fields)._BreakPoint_k__BackingField;
        if (pRVar19 != (ReDriveBattleCore_BreakPoint_o *)0x0) {
          if ((pRVar19->fields).maxPointValue < 1) {
            isBreakBonusApplied = false;
          }
          else {
            isBreakBonusApplied = (pRVar19->fields)._PointValue_k__BackingField < 1;
          }
          iVar10 = (defenseUnit->fields)._Id_k__BackingField;
          pSVar13 = (System_Collections_Generic_List_string__o *)
                    System.Linq.Enumerable$$ToList<object>
                              ((System_Collections_Generic_IEnumerable_TSource__o *)__this,
                               *(MethodInfo_562AAA8 **)
                                PTR_Method$System.Linq.Enumerable.ToList<string>()_7b9bac6940);
          pRVar14 = ReDriveBattleCore.AffectedUnitNotice$$CreateByDamage
                              (iVar10,SVar24.fields.Item3,isCritical,iVar3,pSVar13,damageBaseType,
                               isBreakBonusApplied,false,in_stack_ffffffffffffff40);
          pRVar19 = (defenseUnit->fields)._BreakPoint_k__BackingField;
          if (pRVar19 != (ReDriveBattleCore_BreakPoint_o *)0x0) {
            if (((pRVar19->fields).maxPointValue < 1) ||
               (0 < (pRVar19->fields)._PointValue_k__BackingField)) {
              bVar9 = false;
            }
            else {
              pRVar20 = (defenseUnit->fields)._BattleParameter_k__BackingField;
              if (pRVar20 == (ReDriveBattleCore_BattleParameter_o *)0x0) goto LAB_7b96e2f0e8;
              bVar9 = (defenseUnit->fields)._BreakedDamageReceiveRate_k__BackingField ==
                      (pRVar20->fields)._MaxBreakedDamageReceiveRate_k__BackingField / 10;
            }
            if ((pRVar14 != (ReDriveBattleCore_AffectedUnitNotice_o *)0x0) &&
               (pRVar21 = (pRVar14->fields).Damages,
               pRVar21 != (ReDriveBattleCore_AffectedUnitNotice_DamageInfo_array *)0x0)) {
              iVar23 = (int)pRVar21->max_length;
              if (0 < iVar23) {
                iVar22 = 0;
                do {
                  if (iVar23 == iVar22) goto LAB_7b96e2f0ec;
                  lVar11 = (long)iVar22;
                  if (pRVar21->m_Items[lVar11] ==
                      (ReDriveBattleCore_AffectedUnitNotice_DamageInfo_o *)0x0) goto LAB_7b96e2f0e8;
                  iVar22 = iVar22 + 1;
                  (pRVar21->m_Items[lVar11]->fields)._IsMaxBreakBonusWhenHit_k__BackingField = bVar9
                  ;
                } while (iVar23 != iVar22);
              }
              iVar23 = SVar24.fields.Item2;
              if ((SVar24.fields.Item3 != 0) || (iVar23 < 1)) {
                pRVar12 = ReDriveBattleCore.AffectedUnitNotice$$op_Addition
                                    (pRVar12,pRVar14,method_01);
              }
              if (0 < iVar23) {
                iVar10 = (defenseUnit->fields)._Id_k__BackingField;
                pSVar13 = (System_Collections_Generic_List_string__o *)
                          System.Linq.Enumerable$$ToList<object>
                                    ((System_Collections_Generic_IEnumerable_TSource__o *)__this,
                                     *(MethodInfo_562AAA8 **)puVar6);
                pMVar16 = (MethodInfo *)(ulong)isCritical;
                pRVar14 = ReDriveBattleCore.AffectedUnitNotice$$CreateByBarrierDamage
                                    (iVar10,iVar23,isCritical,iVar3,pSVar13,damageBaseType,
                                     isBreakBonusApplied,false,in_stack_ffffffffffffff40);
                if ((pRVar14 == (ReDriveBattleCore_AffectedUnitNotice_o *)0x0) ||
                   (pRVar21 = (pRVar14->fields).BarrierDamages,
                   pRVar21 == (ReDriveBattleCore_AffectedUnitNotice_DamageInfo_array *)0x0))
                goto LAB_7b96e2f0e8;
                iVar3 = (int)pRVar21->max_length;
                if (0 < iVar3) {
                  iVar23 = 0;
                  do {
                    if (iVar3 == iVar23) {
LAB_7b96e2f0ec:
                    /* WARNING: Subroutine does not return */
                      FUN_7b966d5990();
                    }
                    lVar11 = (long)iVar23;
                    if (pRVar21->m_Items[lVar11] ==
                        (ReDriveBattleCore_AffectedUnitNotice_DamageInfo_o *)0x0)
                    goto LAB_7b96e2f0e8;
                    iVar23 = iVar23 + 1;
                    (pRVar21->m_Items[lVar11]->fields)._IsMaxBreakBonusWhenHit_k__BackingField =
                         bVar9;
                  } while (iVar3 != iVar23);
                }
                pRVar12 = ReDriveBattleCore.AffectedUnitNotice$$op_Addition(pRVar12,pRVar14,pMVar16)
                ;
              }
              if (*(long *)(lVar4 + 0x28) == local_78) {
                return pRVar12;
              }
                    /* WARNING: Subroutine does not return */
              thunk_EXT_FUN_7ce7b83514();
            }
          }
        }
      }
    }
  }
LAB_7b96e2f0e8:
                    /* WARNING: Subroutine does not return */
  FUN_7b966d5988();
}

