import React, { useEffect, useMemo, useState } from 'react';
import { EXPEDITION_BOSSES, ExpeditionBoss } from '../../constants/expeditionBosses';

// Redesenho pedido pelo usuário, no mesmo espírito da própria calculadora
// de "Clan Expedition" do mir4tracker.xyz (100% client-side, sem API por
// trás — ver mapa-fontes-campos-publicos-mir4.md seção 20.5): em vez de só
// digitar o estoque e ver "quantas rodadas dá", agora dá pra marcar
// diretamente quais chefes o clã vai rodar hoje (normal ou re-run pago em
// ouro), os totais somam automaticamente, e dá pra controlar quem já
// pagou a parte do ouro, por qual meio, e quanto ainda falta cada um.
//
// Ajuste pedido pelo usuário (rodada 5): o clã NÃO guarda estátuas — elas
// só são ganhas ao selecionar o chefe pra rodar hoje (já mostrado em
// "Detalhes da rodada") — então "Estátuas" saiu do estoque atual do clã.

interface Resources {
  gold: number;
  copper: number;
  darksteel: number;
  energy: number;
}

interface RunDetails {
  clanName: string;
  runDate: string;
  runTime: string;
  note: string;
}

// Como o participante pagou a parte dele do ouro do re-run:
// - nao_pago: ainda não pagou nada
// - item_mercado: pagou entregando um item pelo mercado (equivalente ao valor devido)
// - ouro_direto: pagou em ouro direto pra outro personagem
// - ouro_gt: pagou via Ghost Trade (com a taxa configurada)
type PaymentMethod = 'nao_pago' | 'item_mercado' | 'ouro_direto' | 'ouro_gt';

interface Participant {
  id: string;
  name: string;
  method: PaymentMethod;
  amountPaid: number;
}

interface BossSelection {
  run: boolean;
  rerun: boolean;
}

const EMPTY_RESOURCES: Resources = { gold: 0, copper: 0, darksteel: 0, energy: 0 };
const EMPTY_RUN_DETAILS: RunDetails = { clanName: '', runDate: '', runTime: '', note: '' };

const STORAGE_KEYS = {
  resources: 'mir4_clan_expedition_resources',
  runDetails: 'mir4_clan_expedition_run_details',
  selection: 'mir4_clan_expedition_selection',
  participants: 'mir4_clan_expedition_participants',
  gtTax: 'mir4_clan_expedition_gt_tax',
};

const RESOURCE_LABELS: Record<keyof Resources, string> = {
  gold: 'Ouro',
  copper: 'Cobre',
  darksteel: 'Aço Negro',
  energy: 'Energia',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  nao_pago: 'Não pago',
  item_mercado: 'Item do mercado',
  ouro_direto: 'Ouro (direto)',
  ouro_gt: 'Ouro (via GT)',
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* modo privado etc — ignora */ }
}

// Participantes salvos antes desta rodada tinham só {id, name, paid} — ao
// carregar, converte pro formato novo em vez de perder o cadastro antigo.
function normalizeParticipant(raw: any): Participant {
  if (raw && typeof raw === 'object' && 'method' in raw) {
    return {
      id: raw.id,
      name: raw.name,
      method: raw.method ?? 'nao_pago',
      amountPaid: Number(raw.amountPaid) || 0,
    };
  }
  return {
    id: raw?.id ?? `${Date.now()}-${Math.random()}`,
    name: raw?.name ?? '',
    method: raw?.paid ? 'ouro_direto' : 'nao_pago',
    amountPaid: 0,
  };
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

export const ClanExpeditionPage: React.FC = () => {
  const [resources, setResources] = useState<Resources>(EMPTY_RESOURCES);
  const [runDetails, setRunDetails] = useState<RunDetails>(EMPTY_RUN_DETAILS);
  const [selection, setSelection] = useState<Record<string, BossSelection>>({});
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [gtTax, setGtTax] = useState(5);
  const [newParticipant, setNewParticipant] = useState('');

  useEffect(() => {
    setResources(loadJSON(STORAGE_KEYS.resources, EMPTY_RESOURCES));
    setRunDetails(loadJSON(STORAGE_KEYS.runDetails, EMPTY_RUN_DETAILS));
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.selection);
      if (raw) setSelection(JSON.parse(raw));
      const rawP = localStorage.getItem(STORAGE_KEYS.participants);
      if (rawP) setParticipants((JSON.parse(rawP) as unknown[]).map(normalizeParticipant));
      const rawTax = localStorage.getItem(STORAGE_KEYS.gtTax);
      if (rawTax) setGtTax(Number(rawTax) || 5);
    } catch { /* ignora */ }
  }, []);

  useEffect(() => saveJSON(STORAGE_KEYS.resources, resources), [resources]);
  useEffect(() => saveJSON(STORAGE_KEYS.runDetails, runDetails), [runDetails]);
  useEffect(() => saveJSON(STORAGE_KEYS.selection, selection), [selection]);
  useEffect(() => saveJSON(STORAGE_KEYS.participants, participants), [participants]);
  useEffect(() => saveJSON(STORAGE_KEYS.gtTax, gtTax), [gtTax]);

  const updateResource = (key: keyof Resources, value: string) => {
    const n = Number(value.replace(/\D/g, '')) || 0;
    setResources((prev) => ({ ...prev, [key]: n }));
  };

  const toggleBoss = (boss: ExpeditionBoss, field: 'run' | 'rerun') => {
    setSelection((prev) => {
      const current = prev[boss.name] ?? { run: false, rerun: false };
      return { ...prev, [boss.name]: { ...current, [field]: !current[field] } };
    });
  };

  const addParticipant = () => {
    const name = newParticipant.trim();
    if (!name) return;
    setParticipants((prev) => [...prev, { id: `${Date.now()}-${name}`, name, method: 'nao_pago', amountPaid: 0 }]);
    setNewParticipant('');
  };

  const updateParticipant = (id: string, patch: Partial<Participant>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const totals = useMemo(() => {
    let copper = 0, darksteel = 0, energy = 0, statuesEarned = 0, goldPool = 0;
    for (const boss of EXPEDITION_BOSSES) {
      const sel = selection[boss.name];
      if (sel?.run) {
        copper += boss.copper;
        darksteel += boss.darksteel;
        energy += boss.energy;
        statuesEarned += boss.statue;
      }
      if (sel?.rerun) {
        goldPool += boss.gold;
        // Corrigido (rodada 8): um Re-run também dá a estátua do chefe — não
        // era somado antes, só a run normal contava. Se o chefe estiver
        // marcado como Rodar E Re-run, conta a estátua das duas vezes (são
        // duas "corridas" separadas contra o mesmo chefe).
        statuesEarned += boss.statue;
      }
    }
    return { copper, darksteel, energy, statuesEarned, goldPool };
  }, [selection]);

  const shortfall = {
    copper: Math.max(0, totals.copper - resources.copper),
    darksteel: Math.max(0, totals.darksteel - resources.darksteel),
    energy: Math.max(0, totals.energy - resources.energy),
  };

  const participantCount = Math.max(1, participants.length);
  const goldPerPersonDirect = Math.ceil(totals.goldPool / participantCount);
  const goldPerPersonGT = Math.ceil((totals.goldPool * (1 + gtTax / 100)) / participantCount);

  // Quanto cada participante DEVERIA pagar depende de como ele escolheu
  // pagar: via GT paga o valor com a taxa embutida, os outros meios pagam
  // o valor "cheio" direto (item do mercado é tratado como equivalente ao
  // valor direto, já que não passa pela taxa do Ghost Trade).
  const expectedShare = (method: PaymentMethod) => (method === 'ouro_gt' ? goldPerPersonGT : goldPerPersonDirect);

  const participantRows = participants.map((p) => {
    const expected = expectedShare(p.method);
    const remaining = Math.max(0, expected - p.amountPaid);
    // Bug corrigido (rodada 6): quando não há nenhum chefe marcado como
    // "Re-run" (goldPool = 0), o valor devido de todo mundo é 0 — e a regra
    // antiga só dava "pago" quando `expected > 0`, então ninguém nunca
    // chegava a "pago" e ficava travado em "parcial"/"deve" pra sempre,
    // mesmo sem dever nada. Agora: se não há nada devido, está "pago"
    // (nada a cobrar); senão, compara o valor pago normalmente.
    const status: 'pago' | 'parcial' | 'deve' =
      expected === 0 ? 'pago' : p.amountPaid >= expected ? 'pago' : p.amountPaid > 0 ? 'parcial' : 'deve';
    return { ...p, expected, remaining, status };
  });

  const totalReceived = participantRows.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalRemaining = Math.max(0, totals.goldPool - totalReceived);
  const pendingCount = participantRows.filter((p) => p.status !== 'pago').length;

  // Aviso pra colar no Discord (pedido do usuário, rodada 7): reproduz o
  // formato do exemplo que ele mandou de outro clã ("CLAN EXPEDITION w/...",
  // "RUNS:", "RERUNS:", lista numerada de participante com ✓ se pago ou
  // "(c/o X)" — carried over, valor que ainda falta — se pendente). Tudo
  // preenchido automaticamente a partir do estado atual da página, pra só
  // copiar e colar no Discord/WhatsApp e cobrar o pessoal.
  const runNames = EXPEDITION_BOSSES.filter((b) => selection[b.name]?.run).map((b) => b.name);
  const rerunNames = EXPEDITION_BOSSES.filter((b) => selection[b.name]?.rerun).map((b) => b.name);
  const weekdayFmt = runDetails.runDate
    ? new Date(`${runDetails.runDate}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' })
    : '';
  const dateFmt = runDetails.runDate
    ? new Date(`${runDetails.runDate}T00:00:00`).toLocaleDateString('pt-BR')
    : '(sem data)';
  const timeFmt = runDetails.runTime || '(sem horário)';

  const discordMessage = useMemo(() => {
    const lines: string[] = [];
    lines.push(`EXPEDIÇÃO DE CLÃ w/ ${runDetails.clanName || '(clã)'}`);
    lines.push(`DATA: ${dateFmt}${weekdayFmt ? ` (${weekdayFmt})` : ''}`);
    lines.push(`HORÁRIO: ${timeFmt} (horário do servidor)`);
    if (runNames.length) lines.push(`RUNS: ${runNames.join(' - ')}`);
    if (rerunNames.length) lines.push(`RE-RUNS: ${rerunNames.join(' - ')}`);
    lines.push(`ESTÁTUAS GANHAS: ${fmt(totals.statuesEarned)}`);
    lines.push(`OURO: ${fmt(totalReceived)} / ${fmt(totals.goldPool)} recebido`);
    if (runDetails.note.trim()) lines.push(runDetails.note.trim());
    lines.push('');
    lines.push('Confirmem presença respondendo esta mensagem. Avisem o quanto antes se não puderem ir, pra liberar a vaga.');
    lines.push('');
    participantRows.forEach((p, i) => {
      // Corrigido (rodada 8): mostrar só o que a pessoa JÁ pagou, nunca o
      // quanto "falta" — o usuário reportou que "falta X" dava a impressão
      // de dívida, o que não é a intenção do aviso.
      const marker = p.status === 'pago' ? '✓ pago' : p.amountPaid > 0 ? `(pagou ${fmt(p.amountPaid)})` : '';
      lines.push(`${i + 1}. ${p.name}${marker ? ' ' + marker : ''}`);
    });
    return lines.join('\n');
  }, [runDetails, dateFmt, weekdayFmt, timeFmt, runNames, rerunNames, totals.statuesEarned, totalReceived, totals.goldPool, participantRows]);

  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const copyDiscordMessage = async () => {
    try {
      await navigator.clipboard.writeText(discordMessage);
      setCopiedDiscord(true);
      setTimeout(() => setCopiedDiscord(false), 1800);
    } catch { /* clipboard indisponível — usuário pode selecionar e copiar manualmente */ }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Expedição do Clã</h1>
      <p className="text-slate-400 text-sm mb-6">
        Marque os chefes que o clã vai rodar hoje (normal ou re-run pago em ouro), controle o estoque
        do cofre e quem já pagou a parte do ouro, por qual meio e quanto ainda falta. Tudo fica salvo
        só neste navegador.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Detalhes da rodada</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={runDetails.clanName}
              onChange={(e) => setRunDetails((d) => ({ ...d, clanName: e.target.value }))}
              placeholder="Nome do clã"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={runDetails.runDate}
                onChange={(e) => setRunDetails((d) => ({ ...d, runDate: e.target.value }))}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="time"
                value={runDetails.runTime}
                onChange={(e) => setRunDetails((d) => ({ ...d, runTime: e.target.value }))}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <textarea
              value={runDetails.note}
              onChange={(e) => setRunDetails((d) => ({ ...d, note: e.target.value }))}
              placeholder="Observação (ex.: doações de ouro aceitas até 23h de quinta)"
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <p className="text-slate-500 text-xs">
              Estátuas ganhas (auto, pelos chefes marcados como "rodar"): <span className="text-cyan-400 font-bold">{totals.statuesEarned}</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Recursos atuais do clã</h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(EMPTY_RESOURCES) as (keyof Resources)[]).map((key) => (
              <div key={key}>
                <label className="block text-[11px] text-slate-500 mb-1">{RESOURCE_LABELS[key]}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={resources[key] ? resources[key].toLocaleString('pt-BR') : ''}
                  onChange={(e) => updateResource(key, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-[11px] mt-2">
            O clã não guarda estátuas — elas só são ganhas ao selecionar o chefe pra rodar (ver "Detalhes da rodada").
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Ouro (re-runs)</h2>
          <label className="block text-[11px] text-slate-500 mb-1">Taxa do Ghost Trade (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={gtTax}
            onChange={(e) => setGtTax(Number(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 mb-3 focus:outline-none focus:border-cyan-500"
          />
          <div className="bg-slate-800/60 rounded-lg p-3 text-xs space-y-1">
            <p className="text-slate-400">Reserva total de ouro: <span className="text-amber-400 font-bold">{fmt(totals.goldPool)}</span></p>
            <p className="text-slate-400">Por pessoa (direto): <span className="text-cyan-400 font-bold">{fmt(goldPerPersonDirect)}</span></p>
            <p className="text-slate-400">Por pessoa (via GT, +{gtTax}%): <span className="text-cyan-400 font-bold">{fmt(goldPerPersonGT)}</span></p>
            <p className="text-slate-400">Já recebido: <span className="text-emerald-400 font-bold">{fmt(totalReceived)}</span></p>
            <p className="text-slate-400">Falta receber: <span className={`font-bold ${totalRemaining > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{fmt(totalRemaining)}</span></p>
            <p className="text-slate-500">{participants.length} participante{participants.length === 1 ? '' : 's'} cadastrado{participants.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Chefes de expedição</h2>
          <p className="text-slate-500 text-[11px]">Marque "Rodar" pra runs normais e "Re-run" pra runs extras pagas em ouro</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-800/60 text-slate-400">
              <tr>
                <th className="text-left px-3 py-2">Chefe</th>
                <th className="px-3 py-2">Cobre</th>
                <th className="px-3 py-2">Aço Negro</th>
                <th className="px-3 py-2">Energia</th>
                <th className="px-3 py-2">Ouro (re-run)</th>
                <th className="px-3 py-2">Estátua</th>
                <th className="px-3 py-2">Rodar</th>
                <th className="px-3 py-2">Re-run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {EXPEDITION_BOSSES.map((boss) => {
                const sel = selection[boss.name] ?? { run: false, rerun: false };
                return (
                  <tr key={boss.name} className={sel.run || sel.rerun ? 'bg-cyan-500/5' : ''}>
                    <td className="px-3 py-2 text-slate-200 font-medium whitespace-nowrap">{boss.name}</td>
                    <td className="px-3 py-2 text-center text-slate-400">{fmt(boss.copper)}</td>
                    <td className="px-3 py-2 text-center text-slate-400">{fmt(boss.darksteel)}</td>
                    <td className="px-3 py-2 text-center text-slate-400">{fmt(boss.energy)}</td>
                    <td className="px-3 py-2 text-center text-amber-400">{fmt(boss.gold)}</td>
                    <td className="px-3 py-2 text-center text-slate-400">{boss.statue}</td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={sel.run} onChange={() => toggleBoss(boss, 'run')} className="w-4 h-4 accent-cyan-500" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={sel.rerun} onChange={() => toggleBoss(boss, 'rerun')} className="w-4 h-4 accent-amber-500" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <p className="text-slate-500 text-xs mb-1">Custo em recursos (runs normais)</p>
          <p className="text-slate-200 text-sm">Cobre: <span className="font-bold">{fmt(totals.copper)}</span>{shortfall.copper > 0 && <span className="text-red-400 ml-2">faltam {fmt(shortfall.copper)}</span>}</p>
          <p className="text-slate-200 text-sm">Aço Negro: <span className="font-bold">{fmt(totals.darksteel)}</span>{shortfall.darksteel > 0 && <span className="text-red-400 ml-2">faltam {fmt(shortfall.darksteel)}</span>}</p>
          <p className="text-slate-200 text-sm">Energia: <span className="font-bold">{fmt(totals.energy)}</span>{shortfall.energy > 0 && <span className="text-red-400 ml-2">faltam {fmt(shortfall.energy)}</span>}</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <p className="text-slate-500 text-xs mb-1">Custo em ouro (re-runs)</p>
          <p className="text-amber-400 text-2xl font-bold">{fmt(totals.goldPool)}</p>
          <p className="text-slate-500 text-xs mt-1">dividido por {participants.length || 1} pessoa(s)</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <p className="text-slate-500 text-xs mb-1">Pagamentos</p>
          <p className="text-slate-200 text-sm"><span className="text-emerald-400 font-bold">{participants.length - pendingCount}</span> pagaram tudo</p>
          <p className="text-slate-200 text-sm"><span className="text-red-400 font-bold">{pendingCount}</span> ainda devem (parcial ou nada)</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Participantes</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); addParticipant(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="Nome do membro"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">Adicionar</button>
          </form>
        </div>
        {participantRows.length === 0 ? (
          <p className="text-slate-500 text-sm italic p-4">Nenhum participante cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-800/60 text-slate-400">
                <tr>
                  <th className="text-left px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Pagou via</th>
                  <th className="px-3 py-2">Valor pago</th>
                  <th className="px-3 py-2">Devido</th>
                  <th className="px-3 py-2">Falta</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {participantRows.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-slate-200 font-medium whitespace-nowrap">{p.name}</td>
                    <td className="px-3 py-2">
                      <select
                        value={p.method}
                        onChange={(e) => updateParticipant(p.id, { method: e.target.value as PaymentMethod })}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
                          <option key={m} value={m}>{METHOD_LABELS[m]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={p.amountPaid ? p.amountPaid.toLocaleString('pt-BR') : ''}
                        placeholder="0"
                        onChange={(e) => updateParticipant(p.id, { amountPaid: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-center text-slate-400">{fmt(p.expected)}</td>
                    <td className="px-3 py-2 text-center">
                      {p.remaining > 0 ? <span className="text-red-400 font-semibold">{fmt(p.remaining)}</span> : <span className="text-emerald-400">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.status === 'pago' ? 'bg-emerald-500/20 text-emerald-400'
                        : p.status === 'parcial' ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                        {p.status === 'pago' ? 'PAGOU' : p.status === 'parcial' ? 'PARCIAL' : 'DEVE'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => removeParticipant(p.id)} className="text-slate-500 hover:text-red-400">Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Aviso pro Discord</h2>
          <button
            type="button"
            onClick={copyDiscordMessage}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {copiedDiscord ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <div className="p-4">
          <p className="text-slate-500 text-[11px] mb-2">
            Preenchido automaticamente com a rodada e a lista de participantes (✓ quem já pagou tudo, ou o valor já pago por quem ainda não completou) — copie e cole no Discord/WhatsApp pra cobrar o pessoal.
          </p>
          <textarea
            readOnly
            value={discordMessage}
            rows={Math.min(20, discordMessage.split('\n').length + 1)}
            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono resize-none"
            onFocus={(e) => e.target.select()}
          />
        </div>
      </div>
    </div>
  );
};

export default ClanExpeditionPage;
