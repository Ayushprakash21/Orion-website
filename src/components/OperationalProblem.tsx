import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ProblemItem {
  id: string;
  number: string;
  title: string;
  symptom: string;
  consequence: string;
  reconciliation: string;
}

const operationalProblems: ProblemItem[] = [
  {
    id: 'p-1',
    number: '01',
    title: 'Fragmented Transactional Silos',
    symptom:
      'Core ERPs, warehouse management (WMS), and transportation platforms (TMS) maintain isolated data schemas.',
    consequence:
      'Discrepancies between purchase order states, physical warehouse inventory, and carrier manifests create ghost stock.',
    reconciliation:
      'Orion-9 canonical ontology binds disparate schemas into a synchronized real-time operational graph.',
  },
  {
    id: 'p-2',
    number: '02',
    title: 'Blind Intermodal Handoffs',
    symptom:
      'Freight transfers between ocean container berths, rail ramps, and drayage trucks rely on batch EDI messages.',
    consequence:
      'Port dwell spikes and missed container pickups compound into severe detention fees and delayed assembly lines.',
    reconciliation:
      'Automated milestone telemetry triggers proactive gate appointments before vessel berthing.',
  },
  {
    id: 'p-3',
    number: '03',
    title: 'Latent Upstream Risk Signals',
    symptom:
      'Tier-2 factory delays, raw material shortages, and weather events surface only after shipments fail to depart.',
    consequence:
      'Operations teams are forced into expensive emergency air freight expeditions with zero preparation lead time.',
    reconciliation:
      'Continuous multi-tier supplier monitoring detects anomalies 5–7 business days prior to impact.',
  },
  {
    id: 'p-4',
    number: '04',
    title: 'Uncoordinated Local Firefighting',
    symptom:
      'Logistics, procurement, and manufacturing teams execute contradictory manual workarounds via email and spreadsheets.',
    consequence:
      'Expediting one shipment steals components from another critical order, triggering cascading SLA failures.',
    reconciliation:
      'Systemic multi-objective solvers model global trade-offs to protect overarching enterprise commitments.',
  },
];

export const OperationalProblem: React.FC = () => {
  return (
    <section id="problem" className="py-24 bg-[#EAF4F8] border-b border-[#D5E1E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-[11px] font-mono uppercase tracking-widest text-[#294D6B] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>THE SYSTEMIC OPERATIONAL CHALLENGE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-[#111827] leading-tight">
            The Cost of Fragmented Operations.
          </h2>
          <p className="text-sm sm:text-base text-[#566575] leading-relaxed">
            Modern supply chains span thousands of suppliers, transit routes, and systems. When these layers operate in isolation, routine variances spiral into systemic gridlock.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {operationalProblems.map((prob) => (
            <div
              key={prob.id}
              className="p-7 sm:p-8 rounded-3xl bg-white border border-[#D5E1E8] hover:border-[#294D6B]/45 transition-all shadow-[0_12px_32px_rgba(16,24,32,0.04)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#D5E1E8] mb-5 text-[11px] font-mono text-[#566575]">
                  <span>PROBLEM ARCHITECTURE // {prob.number}</span>
                  <span className="text-[#294D6B] font-bold">LEGACY BOTTLENECK</span>
                </div>

                <h3 className="text-xl font-bold text-[#111827] tracking-tight mb-4">
                  {prob.title}
                </h3>

                <div className="space-y-3.5 text-xs leading-relaxed">
                  <div>
                    <span className="text-[#566575] font-mono block text-[10px] uppercase mb-0.5">
                      Operational Symptom:
                    </span>
                    <p className="text-[#111827]">{prob.symptom}</p>
                  </div>

                  <div>
                    <span className="text-red-700 font-mono block text-[10px] uppercase font-bold mb-0.5">
                      Compounded Consequence:
                    </span>
                    <p className="text-[#566575]">{prob.consequence}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D5E1E8] text-xs bg-[#F5F9FB] -mx-7 -mb-7 sm:-mx-8 sm:-nb-8 p-6 rounded-b-3xl">
                <div className="flex items-center gap-1.5 text-[#294D6B] font-mono text-[10px] uppercase font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Orion-9 Architectural Resolution:</span>
                </div>
                <p className="text-[#111827] font-medium mt-1">{prob.reconciliation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
