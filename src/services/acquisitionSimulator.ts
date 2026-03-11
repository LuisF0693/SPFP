/**
 * acquisitionSimulator.ts — STY-014
 * Cálculos comparativos: Financiamento (SAC/PRICE), Consórcio, Investimento
 */

export interface SimulatorInput {
  assetValue: number;       // Valor do bem
  downPayment: number;      // Entrada disponível (%)
  term: number;             // Prazo (meses)
  interestRate: number;     // Taxa juros a.a. (financiamento)
  adminRate: number;        // Taxa adm total (consórcio %)
  returnRate: number;       // Rentabilidade investimento a.a. (SELIC/CDI)
  system: 'PRICE' | 'SAC'; // Sistema de amortização
}

export interface SimulationResult {
  type: 'financiamento' | 'consorcio' | 'investimento';
  label: string;
  totalCost: number;
  monthlyPayment: number;   // parcela média
  term: number;             // meses
  pros: string[];
  cons: string[];
  detail?: string;
}

/** PRICE: parcela fixa com juros compostos */
export function calcFinanciamentoPRICE(pv: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return pv / months;
  return pv * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** SAC: amortização constante, juros decrescentes */
export function calcFinanciamentoSAC(pv: number, annualRate: number, months: number): {
  firstPayment: number;
  lastPayment: number;
  totalPaid: number;
} {
  const r = annualRate / 100 / 12;
  const amort = pv / months;
  let total = 0;
  let balance = pv;
  for (let i = 0; i < months; i++) {
    const juros = balance * r;
    total += amort + juros;
    balance -= amort;
  }
  const firstPayment = amort + pv * r;
  const lastPayment = amort + amort * r;
  return { firstPayment, lastPayment, totalPaid: total };
}

/** Consórcio: sem juros, apenas taxa de administração */
export function calcConsorcio(
  assetValue: number,
  adminRateTotal: number,
  months: number,
): { monthly: number; totalCost: number } {
  const totalCost = assetValue * (1 + adminRateTotal / 100);
  const monthly = totalCost / months;
  return { monthly, totalCost };
}

/** Investimento: quanto tempo para acumular investindo mensalmente
 *  Usa FV = PMT × [(1+r)^n − 1] / r   →  resolve n para FV = assetValue
 */
export function calcInvestimento(
  assetValue: number,
  downPayment: number,
  annualReturn: number,
): { months: number; monthlyContribution: number; totalContributed: number } {
  const r = annualReturn / 100 / 12;
  const target = assetValue - downPayment;

  if (r === 0 || target <= 0) {
    // Sem rendimento: só acumular
    const months = 60; // default 5 anos
    return {
      months,
      monthlyContribution: target / months,
      totalContributed: target,
    };
  }

  // Tentar PMT que gera o target em 60 meses (fixar prazo padrão)
  // n = 60 meses e encontrar PMT
  const n = 60;
  // FV = PMT * [(1+r)^n - 1] / r
  // PMT = FV * r / [(1+r)^n - 1]
  const pmt = target * r / (Math.pow(1 + r, n) - 1);
  const totalContributed = pmt * n;

  return { months: n, monthlyContribution: pmt, totalContributed: totalContributed + downPayment };
}

// Cache SELIC
let selicCache: { rate: number; ts: number } | null = null;
const SELIC_TTL = 6 * 60 * 60 * 1000; // 6 horas

/** Busca SELIC via API BACEN — fallback 10.5% a.a. */
export async function fetchSELIC(): Promise<number> {
  try {
    if (selicCache && Date.now() - selicCache.ts < SELIC_TTL) {
      return selicCache.rate;
    }

    const res = await fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) throw new Error('BACEN API error');
    const data = await res.json() as Array<{ valor: string }>;
    const monthlyRate = parseFloat(data[0].valor);   // % ao mês
    const annualRate = (Math.pow(1 + monthlyRate / 100, 12) - 1) * 100;

    selicCache = { rate: parseFloat(annualRate.toFixed(2)), ts: Date.now() };
    return selicCache.rate;
  } catch {
    return 10.5; // fallback
  }
}

/** Executa as 3 simulações e retorna resultados ordenados por custo total */
export function simularAquisicao(input: SimulatorInput): SimulationResult[] {
  const downPaymentValue = input.assetValue * (input.downPayment / 100);
  const financingPrincipal = input.assetValue - downPaymentValue;

  const results: SimulationResult[] = [];

  // 1. Financiamento
  let financingMonthly: number;
  let financingTotal: number;
  let financingDetail: string;

  if (input.system === 'SAC') {
    const sac = calcFinanciamentoSAC(financingPrincipal, input.interestRate, input.term);
    financingMonthly = sac.firstPayment;
    financingTotal = downPaymentValue + sac.totalPaid;
    financingDetail = `SAC — 1ª parcela ${sac.firstPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · última ${sac.lastPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  } else {
    financingMonthly = calcFinanciamentoPRICE(financingPrincipal, input.interestRate, input.term);
    financingTotal = downPaymentValue + financingMonthly * input.term;
    financingDetail = `PRICE — ${input.term} parcelas fixas`;
  }

  results.push({
    type: 'financiamento',
    label: 'Financiamento',
    totalCost: financingTotal,
    monthlyPayment: financingMonthly,
    term: input.term,
    detail: financingDetail,
    pros: ['Bem imediato', 'Parcelas previsíveis', input.assetValue > 100000 ? 'Pode usar FGTS (imóveis)' : 'Parcelas curtas'],
    cons: ['Juros elevados', 'Bem como garantia', 'Spread bancário'],
  });

  // 2. Consórcio
  const consorcio = calcConsorcio(input.assetValue, input.adminRate, input.term);
  results.push({
    type: 'consorcio',
    label: 'Consórcio',
    totalCost: consorcio.totalCost,
    monthlyPayment: consorcio.monthly,
    term: input.term,
    detail: `Taxa adm ${input.adminRate}% · contemplação por sorteio ou lance`,
    pros: ['Sem juros', 'Apenas taxa adm', 'Disciplina financeira'],
    cons: ['Sem bem imediato', 'Depende de sorteio/lance', 'Prazo longo'],
  });

  // 3. Investimento
  const inv = calcInvestimento(input.assetValue, downPaymentValue, input.returnRate);
  results.push({
    type: 'investimento',
    label: 'Investir e Comprar',
    totalCost: inv.totalContributed,
    monthlyPayment: inv.monthlyContribution,
    term: inv.months,
    detail: `Investe mensalmente com ${input.returnRate}% a.a. · acumula em ${inv.months} meses`,
    pros: ['Rendimento real', 'Sem dívida', 'Flexibilidade total'],
    cons: ['Bem não imediato', 'Disciplina necessária', 'Risco de inflação do bem'],
  });

  // Ordenar por custo total
  const maxCost = Math.max(...results.map(r => r.totalCost));
  results.forEach(r => { (r as any).savings = maxCost - r.totalCost; });
  return results.sort((a, b) => a.totalCost - b.totalCost);
}
