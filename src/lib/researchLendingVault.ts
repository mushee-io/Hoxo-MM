import { assertResearchPrice, researchCollateralRisk, type ResearchPrice } from './riskResearch'

/**
 * M15–M17 exact integer, PURE, non-custodial lending research model.
 * USD debt and supplied liquidity use USD E8 integer fixtures. Collateral is
 * a fictional token with 9 decimals. Neither side is wallet-backed. Every
 * returned state is a new local object. No deposits or loan disbursements occur.
 */
export type VaultAccount = Readonly<{
  suppliedE8: bigint; debtE8: bigint; collateralAtomic: bigint
}>
export type VaultResearchState = Readonly<{
  cashE8: bigint
  suppliedE8: bigint
  debtE8: bigint
  collateralAtomic: bigint
  accruedInterestE8: bigint
  accounts: Readonly<Record<string, VaultAccount>>
  settlement: 'simulated-only'
}>
export type VaultAction = 'supply' | 'withdraw-supply' | 'deposit-collateral' | 'withdraw-collateral' | 'borrow' | 'repay'
const ZERO: VaultAccount = Object.freeze({ suppliedE8:0n, debtE8:0n, collateralAtomic:0n })
const MAX_LTV_BPS=7000
const LIQUIDATION_LTV_BPS=8000
const COLLATERAL_DECIMALS=9
const ownerValid=(s:string)=>/^[a-zA-Z0-9._-]{3,64}$/.test(s)
const integerPositive=(n:bigint)=>typeof n==='bigint'&&n>0n

export function emptyResearchVault(): VaultResearchState {
  return { cashE8:0n,suppliedE8:0n,debtE8:0n,collateralAtomic:0n,accruedInterestE8:0n,
    accounts:{},settlement:'simulated-only' }
}
/** Invariant: all recorded balances sum to the vault and cash+debt=supply+interest. */
export function assertResearchVaultInvariant(v: VaultResearchState): void {
  if (v.settlement!=='simulated-only' ||
      ![v.cashE8,v.suppliedE8,v.debtE8,v.collateralAtomic,v.accruedInterestE8].every(n=>typeof n==='bigint'&&n>=0n)) {
    throw new Error('Invalid non-custodial vault ledger')
  }
  let supplied=0n,debt=0n,collateral=0n
  for(const [owner,a] of Object.entries(v.accounts)) {
    if(!ownerValid(owner)||![a.suppliedE8,a.debtE8,a.collateralAtomic].every(n=>typeof n==='bigint'&&n>=0n)){
      throw new Error('Invalid research account')
    }
    supplied+=a.suppliedE8;debt+=a.debtE8;collateral+=a.collateralAtomic
  }
  if(supplied!==v.suppliedE8||debt!==v.debtE8||collateral!==v.collateralAtomic||
      v.cashE8+v.debtE8!==v.suppliedE8+v.accruedInterestE8){
    throw new Error('Research vault conservation invariant failed')
  }
}
function risk(collateralAtomic:bigint,debtE8:bigint,price:ResearchPrice,now:number){
  return researchCollateralRisk({amountAtomic:collateralAtomic,decimals:COLLATERAL_DECIMALS,
    price,debtUsdE8:debtE8,maxLtvBps:MAX_LTV_BPS,liquidationLtvBps:LIQUIDATION_LTV_BPS},now)
}
export function applyResearchVaultAction(
  vault:VaultResearchState,owner:string,action:VaultAction,amount:bigint,
  price?:ResearchPrice,now?:number,
):VaultResearchState{
  assertResearchVaultInvariant(vault)
  if(!ownerValid(owner)||!integerPositive(amount))throw new Error('Invalid owner or amount')
  const account=vault.accounts[owner]??ZERO
  let cash=vault.cashE8,supplied=vault.suppliedE8,debt=vault.debtE8,collateral=vault.collateralAtomic
  let next:VaultAccount=account
  if(action==='supply'){
    cash+=amount;supplied+=amount;next={...account,suppliedE8:account.suppliedE8+amount}
  }else if(action==='withdraw-supply'){
    if(account.suppliedE8<amount||cash<amount)throw new Error('Insufficient supplied research liquidity')
    cash-=amount;supplied-=amount;next={...account,suppliedE8:account.suppliedE8-amount}
  }else if(action==='deposit-collateral'){
    collateral+=amount;next={...account,collateralAtomic:account.collateralAtomic+amount}
  }else if(action==='withdraw-collateral'){
    if(account.collateralAtomic<amount)throw new Error('Insufficient fictional collateral')
    if(!price||now===undefined)throw new Error('Fresh research fixture price required to withdraw collateral')
    const remaining=account.collateralAtomic-amount
    if(risk(remaining,account.debtE8,price,now).maximumDebtUsdE8<account.debtE8){
      throw new Error('Withdrawal would violate maximum collateral loan-to-value')
    }
    collateral-=amount;next={...account,collateralAtomic:remaining}
  }else if(action==='borrow'){
    if(!price||now===undefined)throw new Error('Fresh research fixture price required to borrow')
    if(cash<amount)throw new Error('Research vault has insufficient supplied cash')
    const newDebt=account.debtE8+amount
    if(risk(account.collateralAtomic,newDebt,price,now).maximumDebtUsdE8<newDebt){
      throw new Error('Research borrowing exceeds collateral loan-to-value')
    }
    cash-=amount;debt+=amount;next={...account,debtE8:newDebt}
  }else if(action==='repay'){
    if(account.debtE8<amount)throw new Error('Repayment exceeds simulated outstanding debt')
    cash+=amount;debt-=amount;next={...account,debtE8:account.debtE8-amount}
  }else throw new Error('Unknown research vault action')
  const result:VaultResearchState={...vault,cashE8:cash,suppliedE8:supplied,debtE8:debt,
    collateralAtomic:collateral,accounts:{...vault.accounts,[owner]:next}}
  assertResearchVaultInvariant(result)
  return result
}
/** Simple annual rate increment fixture (0..100% of account debt per step). */
export function accrueResearchVaultInterest(vault:VaultResearchState,annualizedStepBps:number):VaultResearchState {
  assertResearchVaultInvariant(vault)
  if(!Number.isInteger(annualizedStepBps)||annualizedStepBps<0||annualizedStepBps>10000){
    throw new Error('Invalid research interest step')
  }
  const accounts:Record<string,VaultAccount>={}
  let added=0n
  for(const [owner,account] of Object.entries(vault.accounts)){
    const charge=account.debtE8*BigInt(annualizedStepBps)/10000n
    accounts[owner]={...account,debtE8:account.debtE8+charge}
    added+=charge
  }
  const updated:VaultResearchState={...vault,debtE8:vault.debtE8+added,
    accruedInterestE8:vault.accruedInterestE8+added,accounts}
  assertResearchVaultInvariant(updated)
  return updated
}
/** Fictitious keeper action: no payment, token confiscation or liquidation tx. */
export function simulateResearchLiquidation(
  vault:VaultResearchState,owner:string,repaymentE8:bigint,
  price:ResearchPrice,now:number,closeFactorBps=5000,bonusBps=500,
):{vault:VaultResearchState;seizedCollateralAtomic:bigint;repaymentE8:bigint;execution:'simulated-only'}{
  assertResearchVaultInvariant(vault)
  assertResearchPrice(price,now)
  if(!ownerValid(owner)||!integerPositive(repaymentE8)||
      !Number.isInteger(closeFactorBps)||closeFactorBps<1||closeFactorBps>10000||
      !Number.isInteger(bonusBps)||bonusBps<0||bonusBps>2000){
    throw new Error('Invalid research liquidation request')
  }
  const account=vault.accounts[owner]
  if(!account||account.debtE8<=0n||!risk(account.collateralAtomic,account.debtE8,price,now).liquidatable){
    throw new Error('Research position is not eligible for liquidation')
  }
  const closeCap=account.debtE8*BigInt(closeFactorBps)/10000n
  if(repaymentE8>closeCap||repaymentE8>account.debtE8)throw new Error('Research liquidation close factor exceeded')
  const numerator=repaymentE8*BigInt(10000+bonusBps)*10n**BigInt(COLLATERAL_DECIMALS)
  const denominator=price.priceUsdE8*10000n
  const seized=(numerator+denominator-1n)/denominator // ceil; avoid underpaying liquidator in research model
  if(seized<=0n||seized>account.collateralAtomic)throw new Error('Research collateral cannot cover modeled seizure')
  const updated:VaultResearchState={
    ...vault,cashE8:vault.cashE8+repaymentE8,debtE8:vault.debtE8-repaymentE8,
    collateralAtomic:vault.collateralAtomic-seized,
    accounts:{...vault.accounts,[owner]:{...account,debtE8:account.debtE8-repaymentE8,collateralAtomic:account.collateralAtomic-seized}},
  }
  assertResearchVaultInvariant(updated)
  return {vault:updated,seizedCollateralAtomic:seized,repaymentE8,execution:'simulated-only'}
}
