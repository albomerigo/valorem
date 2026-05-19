"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  X,
  Download,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import { importTransactions } from "./actions";

// ─── Tipi ─────────────────────────────────────────────────────────────────────

type ParsedRow = {
  merchant: string;
  amount: number;
  type: "expense" | "income";
  transaction_date: string;
  category: string | null;
  notes: string | null;
  recurring: boolean;
  _valid: boolean;
  _errors: string[];
};

type ColumnMap = {
  transaction_date: string;
  merchant: string;
  amount: string;
  type: string;
  category: string;
  notes: string;
  recurring: string;
};

type Step = "upload" | "map" | "preview" | "success";

// ─── Auto-detect header ────────────────────────────────────────────────────────

const AUTO_DETECT: Record<keyof ColumnMap, string[]> = {
  transaction_date: ["data", "date", "Data", "DATA", "transaction_date", "data transazione"],
  merchant: ["merchant", "descrizione", "description", "nome", "Merchant", "Descrizione", "Description"],
  amount: ["importo", "amount", "Amount", "Importo", "valore", "Valore", "Importo (€)"],
  type: ["tipo", "type", "Type", "Tipo"],
  category: ["categoria", "category", "Category", "Categoria"],
  notes: ["note", "notes", "Notes", "Note", "descrizione aggiuntiva"],
  recurring: ["ricorrente", "recurring", "Ricorrente", "Recurring"],
};

function autoDetectColumns(headers: string[]): ColumnMap {
  const result: ColumnMap = {
    transaction_date: "",
    merchant: "",
    amount: "",
    type: "",
    category: "",
    notes: "",
    recurring: "",
  };
  for (const [field, candidates] of Object.entries(AUTO_DETECT)) {
    for (const candidate of candidates) {
      if (headers.includes(candidate)) {
        result[field as keyof ColumnMap] = candidate;
        break;
      }
    }
  }
  return result;
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────

function parseDate(raw: string): string {
  const s = String(raw).trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // DD/MM/YYYY or DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  // Try native parse as fallback
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "";
}

function parseAmount(raw: string | number): number {
  if (typeof raw === "number") return Math.abs(raw);
  const s = String(raw).trim().replace(/[€$\s]/g, "");
  // European format: 1.234,56 → 1234.56
  if (/\d+\.\d{3},\d+/.test(s)) {
    return Math.abs(parseFloat(s.replace(/\./g, "").replace(",", ".")));
  }
  // Remove thousand separators (comma), keep decimal dot
  const normalised = s.replace(/,(?=\d{3})/g, "").replace(",", ".");
  return Math.abs(parseFloat(normalised));
}

function parseType(raw: string, amount: number): "expense" | "income" {
  const s = String(raw).toLowerCase().trim();
  if (["entrata", "income", "+", "credito", "credit"].includes(s)) return "income";
  if (["uscita", "expense", "spesa", "-", "debito", "debit"].includes(s)) return "expense";
  // Fall back to sign of original amount
  if (typeof amount === "number" && amount < 0) return "expense";
  return "expense";
}

function parseRecurring(raw: string): boolean {
  return ["si", "sì", "yes", "true", "1"].includes(String(raw).toLowerCase().trim());
}

function buildRow(
  raw: Record<string, string>,
  colMap: ColumnMap,
  rawAmountForSign: string | number
): ParsedRow {
  const errors: string[] = [];

  const dateStr = colMap.transaction_date ? parseDate(raw[colMap.transaction_date] ?? "") : "";
  if (!dateStr) errors.push("Data mancante o non valida");

  const merchantStr = (colMap.merchant ? raw[colMap.merchant] : "") ?? "";
  if (!merchantStr.trim()) errors.push("Merchant/descrizione mancante");

  const rawAmt = colMap.amount ? raw[colMap.amount] ?? "" : "";
  const amount = parseAmount(rawAmt || String(rawAmountForSign));
  if (isNaN(amount) || amount <= 0) errors.push("Importo non valido");

  const rawType = colMap.type ? raw[colMap.type] ?? "" : "";
  const originalAmount = typeof rawAmountForSign === "number" ? rawAmountForSign : parseFloat(String(rawAmountForSign));
  const type = parseType(rawType, originalAmount);

  const category = colMap.category ? (raw[colMap.category] || null) : null;
  const notes = colMap.notes ? (raw[colMap.notes] || null) : null;
  const recurring = colMap.recurring ? parseRecurring(raw[colMap.recurring] ?? "") : false;

  return {
    merchant: merchantStr.trim(),
    amount,
    type,
    transaction_date: dateStr,
    category: category?.trim() || null,
    notes: notes?.trim() || null,
    recurring,
    _valid: errors.length === 0,
    _errors: errors,
  };
}

// ─── Componente principale ────────────────────────────────────────────────────

export function ImportView({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [colMap, setColMap] = useState<ColumnMap>({
    transaction_date: "",
    merchant: "",
    amount: "",
    type: "",
    category: "",
    notes: "",
    recurring: "",
  });
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File parsing ─────────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      const Papa = (await import("papaparse")).default;
      const text = await file.text();
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      const hs = result.meta.fields ?? [];
      setHeaders(hs);
      setRawRows(result.data.slice(0, 500));
      setColMap(autoDetectColumns(hs));
      setStep("map");
    } else if (ext === "xlsx" || ext === "xls") {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
      if (data.length === 0) return;
      const hs = Object.keys(data[0]);
      setHeaders(hs);
      setRawRows(data.slice(0, 500));
      setColMap(autoDetectColumns(hs));
      setStep("map");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // ── Preview ──────────────────────────────────────────────────────────────────

  const buildPreview = () => {
    const rows = rawRows.map((r) => buildRow(r, colMap, r[colMap.amount] ?? ""));
    setParsedRows(rows);
    setStep("preview");
  };

  // ── Import ───────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    setIsImporting(true);
    setImportError("");
    const validRows = parsedRows
      .filter((r) => r._valid)
      .map(({ _valid: _v, _errors: _e, ...rest }) => rest);

    const result = await importTransactions(validRows);
    setIsImporting(false);

    if (result.success) {
      setImportedCount(result.count ?? 0);
      setStep("success");
    } else {
      setImportError(result.error ?? "Errore sconosciuto");
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────

  const reset = () => {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setParsedRows([]);
    setImportError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validCount = parsedRows.filter((r) => r._valid).length;
  const errorCount = parsedRows.filter((r) => !r._valid).length;

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="import" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={userName} section="Importa" />

          <header className="mb-8 mt-8">
            <p className="eyebrow mb-2">Importa dati</p>
            <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
              Importa le tue transazioni
            </h1>
            <p className="mt-2 max-w-[560px] text-[14px] leading-[1.6] text-ink-secondary">
              Carica un file CSV o Excel con le tue transazioni passate
            </p>
          </header>

          {step === "upload" && (
            <UploadZone
              isDragging={isDragging}
              fileName={fileName}
              fileInputRef={fileInputRef}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onChange={handleFileChange}
            />
          )}

          {step === "map" && (
            <MapStep
              headers={headers}
              rawRows={rawRows}
              colMap={colMap}
              fileName={fileName}
              onColMapChange={setColMap}
              onBack={reset}
              onNext={buildPreview}
            />
          )}

          {step === "preview" && (
            <PreviewStep
              parsedRows={parsedRows}
              validCount={validCount}
              errorCount={errorCount}
              isImporting={isImporting}
              importError={importError}
              onBack={() => setStep("map")}
              onImport={handleImport}
            />
          )}

          {step === "success" && (
            <SuccessStep
              count={importedCount}
              onReset={reset}
              onDashboard={() => router.push("/")}
            />
          )}
        </div>
      </div>

      <BottomBar activeRoute="dashboard" />
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
  isDragging,
  fileName,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onChange,
}: {
  isDragging: boolean;
  fileName: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-[20px] p-12 text-center transition-all duration-300"
        style={{
          border: `2px dashed ${isDragging ? "rgba(168,139,250,0.7)" : "rgba(168,139,250,0.3)"}`,
          background: isDragging ? "rgba(168,139,250,0.06)" : "rgba(168,139,250,0.02)",
        }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-iri-violet/25 bg-iri-violet/[0.08]">
          <Upload className="h-7 w-7 text-iri-pale" strokeWidth={1.6} />
        </div>
        <p className="mb-1 text-[16px] font-medium text-ink-primary">
          {fileName ? fileName : "Trascina il file qui"}
        </p>
        <p className="text-[13px] text-ink-secondary">
          oppure clicca per selezionare · CSV, XLSX, XLS
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={onChange}
        />
      </div>

      {/* Template download */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-2 rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.06] px-4 py-2 text-[12px] font-medium text-iri-pale transition-all hover:border-iri-violet/45 hover:bg-iri-violet/[0.12]"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
          Scarica template CSV
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { title: "CSV", desc: "Qualsiasi file .csv con intestazioni" },
          { title: "Excel", desc: "File .xlsx o .xls dal tuo foglio di calcolo" },
          { title: "Qualsiasi formato", desc: "Mappiamo le colonne per te" },
        ].map((item) => (
          <div
            key={item.title}
            className="glass-panel rounded-[14px] p-4 text-center"
          >
            <FileText className="mx-auto mb-2 h-5 w-5 text-iri-pale" strokeWidth={1.6} />
            <p className="text-[12px] font-medium text-ink-primary">{item.title}</p>
            <p className="mt-0.5 text-[11px] text-ink-secondary">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadTemplate() {
  const csv = [
    "Data,Descrizione,Categoria,Tipo,Importo,Ricorrente,Note",
    "2026-01-15,Caffè Centrale,Ristorazione,expense,2.50,No,Colazione di lavoro",
    "2026-01-16,Stipendio,Altro,income,1800.00,Si,Stipendio gennaio",
    "2026-01-20,Esselunga,Alimentari,expense,45.30,No,",
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "valorem-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Map Step ─────────────────────────────────────────────────────────────────

const MAP_FIELDS: { key: keyof ColumnMap; label: string; required: boolean }[] = [
  { key: "transaction_date", label: "Data transazione", required: true },
  { key: "merchant", label: "Descrizione / Merchant", required: true },
  { key: "amount", label: "Importo", required: true },
  { key: "type", label: "Tipo (entrata/uscita)", required: false },
  { key: "category", label: "Categoria", required: false },
  { key: "notes", label: "Note", required: false },
  { key: "recurring", label: "Ricorrente", required: false },
];

function MapStep({
  headers,
  rawRows,
  colMap,
  fileName,
  onColMapChange,
  onBack,
  onNext,
}: {
  headers: string[];
  rawRows: Record<string, string>[];
  colMap: ColumnMap;
  fileName: string;
  onColMapChange: (m: ColumnMap) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const previewRows = rawRows.slice(0, 3);
  const requiredMapped = colMap.transaction_date && colMap.merchant && colMap.amount;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* File info */}
      <div className="glass-panel flex items-center gap-3 rounded-[14px] px-4 py-3">
        <FileText className="h-4 w-4 flex-shrink-0 text-iri-pale" strokeWidth={1.6} />
        <p className="text-[13px] text-ink-primary">{fileName}</p>
        <span className="ml-auto text-[11px] text-ink-secondary">{rawRows.length} righe rilevate</span>
      </div>

      {/* Preview tabella */}
      <div>
        <p className="eyebrow mb-2 px-1">Anteprima file (prime 3 righe)</p>
        <div className="overflow-x-auto rounded-[14px] border border-white/[0.06]">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-ink-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.03] last:border-0">
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-2 text-ink-primary">
                      {row[h] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mappatura colonne */}
      <div>
        <p className="eyebrow mb-3 px-1">Mappa le colonne</p>
        <div className="glass-panel rounded-[16px] divide-y divide-white/[0.04]">
          {MAP_FIELDS.map(({ key, label, required }) => (
            <div key={key} className="flex items-center gap-4 px-5 py-3">
              <div className="w-48 flex-shrink-0">
                <p className="text-[13px] text-ink-primary">
                  {label}
                  {required && <span className="ml-1 text-iri-pale">*</span>}
                </p>
              </div>
              <select
                value={colMap[key]}
                onChange={(e) => onColMapChange({ ...colMap, [key]: e.target.value })}
                className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-ink-primary outline-none focus:border-iri-violet/40"
              >
                <option value="">— Non presente —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              {colMap[key] ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" strokeWidth={2} />
              ) : (
                <div className="h-4 w-4 flex-shrink-0 rounded-full border border-white/[0.12]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-[13px] text-ink-secondary transition-colors hover:border-white/20 hover:text-ink-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          Cambia file
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!requiredMapped}
          className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-iri-violet to-iri-magenta px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
        >
          Avanti — Anteprima
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── Preview Step ─────────────────────────────────────────────────────────────

function PreviewStep({
  parsedRows,
  validCount,
  errorCount,
  isImporting,
  importError,
  onBack,
  onImport,
}: {
  parsedRows: ParsedRow[];
  validCount: number;
  errorCount: number;
  isImporting: boolean;
  importError: string;
  onBack: () => void;
  onImport: () => void;
}) {
  const preview = parsedRows.slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Contatori */}
      <div className="flex gap-3">
        <div className="glass-panel flex items-center gap-2 rounded-[12px] px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={2} />
          <span className="text-[13px] text-ink-primary">
            <span className="font-medium text-emerald-400">{validCount}</span> transazioni valide
          </span>
        </div>
        {errorCount > 0 && (
          <div className="glass-panel flex items-center gap-2 rounded-[12px] px-4 py-2.5">
            <AlertCircle className="h-4 w-4 text-amber-400" strokeWidth={2} />
            <span className="text-[13px] text-ink-primary">
              <span className="font-medium text-amber-400">{errorCount}</span> con errori (verranno saltate)
            </span>
          </div>
        )}
      </div>

      {/* Tabella preview */}
      <div>
        <p className="eyebrow mb-2 px-1">Anteprima import (prime 10 righe)</p>
        <div className="overflow-x-auto rounded-[16px] border border-white/[0.06]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {["Data", "Merchant", "Importo", "Tipo", "Categoria", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-medium text-ink-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-white/[0.03] last:border-0 ${
                    !row._valid ? "bg-red-500/[0.04]" : ""
                  }`}
                >
                  <td className="px-3 py-2.5 text-ink-secondary">{row.transaction_date}</td>
                  <td className="px-3 py-2.5 font-medium text-ink-primary">{row.merchant}</td>
                  <td
                    className={`px-3 py-2.5 font-mono ${
                      row.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {row.type === "income" ? "+" : "−"}
                    {row.amount.toFixed(2)}€
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {row.type === "income" ? "Entrata" : "Uscita"}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">{row.category ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    {!row._valid && (
                      <span title={row._errors.join(", ")}>
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400" strokeWidth={2} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {parsedRows.length > 10 && (
          <p className="mt-2 px-1 text-[11px] text-ink-muted">
            + altri {parsedRows.length - 10} in coda
          </p>
        )}
      </div>

      {importError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/[0.06] px-4 py-3">
          <X className="h-4 w-4 flex-shrink-0 text-red-400" strokeWidth={2} />
          <p className="text-[13px] text-red-300">{importError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-[13px] text-ink-secondary transition-colors hover:border-white/20 hover:text-ink-primary"
        >
          ← Indietro
        </button>
        <button
          type="button"
          onClick={onImport}
          disabled={isImporting || validCount === 0}
          className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-iri-violet to-iri-magenta px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
        >
          {isImporting ? "Importazione in corso…" : `Importa ${validCount} transazioni`}
        </button>
      </div>
    </div>
  );
}

// ─── Success Step ─────────────────────────────────────────────────────────────

function SuccessStep({
  count,
  onReset,
  onDashboard,
}: {
  count: number;
  onReset: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="glass-panel-strong rounded-[24px] p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/[0.08] text-[40px]">
          🎉
        </div>
        <h2 className="mb-2 font-serif text-[28px] italic text-ink-primary">
          Import completato!
        </h2>
        <p className="mb-8 text-[15px] text-ink-secondary">
          <span className="font-medium text-emerald-400">{count} transazioni</span> importate con successo
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onDashboard}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-iri-violet to-iri-magenta px-4 py-3 text-[13px] font-medium text-white transition-all hover:opacity-90"
          >
            Vai alla dashboard
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-white/[0.08] px-4 py-3 text-[13px] text-ink-secondary transition-colors hover:border-white/20 hover:text-ink-primary"
          >
            Importa altri file
          </button>
        </div>
      </div>
    </div>
  );
}
