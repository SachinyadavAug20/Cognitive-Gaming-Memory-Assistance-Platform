"use client";

import { useState } from "react";
import { Wrench, AlertTriangle } from "lucide-react";
import { useLocale } from "next-intl";
import { IntakeWizardClient } from "@/components/intake/IntakeWizardClient";
import { Spinner } from "@/components/ui/Spinner";
import { mapSampleJsonToFormData } from "@/lib/sampleData";
import type { IntakeFormData } from "@/types/intake";

const DEV_IMPORT_I18N: Record<string, {
  summary: string;
  apply: string;
  loading: string;
  clear: string;
  emptyError: string;
  failedError: string;
}> = {
  en: {
    summary: "Developer Tools: Import Sample Patient JSON",
    apply: "Apply Data",
    loading: "Loading images…",
    clear: "Clear import",
    emptyError: "Nothing to import — the textarea is empty. Open one of the files in Data/Patient/example_json/ and paste its contents above.",
    failedError: "Failed to import JSON.",
  },
  as: {
    summary: "ডেভেলপাৰ সঁজুলি: নমুনা ৰোগী JSON আমদানি কৰক",
    apply: "তথ্য প্ৰয়োগ কৰক",
    loading: "ছবিসমূহ লোড হৈ আছে…",
    clear: "আমদানি মচি পেলাওক",
    emptyError: "আমদানি কৰিবলৈ একো নাই — স্থানটো খালী। অনুগ্ৰহ কৰি Data/Patient/example_json/ ৰ পৰা JSON পেষ্ট কৰক।",
    failedError: "JSON আমদানি বিফল হ'ল।",
  },
  hi: {
    summary: "डेवलपर टूल्स: नमूना रोगी JSON आयात करें",
    apply: "डेटा लागू करें",
    loading: "चित्र लोड हो रहे हैं…",
    clear: "आयात साफ़ करें",
    emptyError: "आयात करने के लिए कुछ नहीं है — बॉक्स खाली है। कृपया Data/Patient/example_json/ से JSON चिपकाएं।",
    failedError: "JSON आयात विफल रहा।",
  },
  bn: {
    summary: "ডেভেলপার টুলস: নমুনা রোগীর JSON আমদানি করুন",
    apply: "তথ্য প্রয়োগ করুন",
    loading: "ছবি লোড হচ্ছে…",
    clear: "আমদানি সাফ করুন",
    emptyError: "আমদানি করার জন্য কিছু নেই — ঘরটি খালি। Data/Patient/example_json/ থেকে JSON পেস্ট করুন।",
    failedError: "JSON আমদানি ব্যর্থ হয়েছে।",
  },
  mr: {
    summary: "डेव्हलपर टूल्स: नमुना रुग्ण JSON आयात करा",
    apply: "माहिती लागू करा",
    loading: "चित्रे लोड होत आहेत…",
    clear: "आयात साफ करा",
    emptyError: "आयात करण्यासाठी काहीही नाही — बॉक्स रिकामा आहे. कृपया Data/Patient/example_json/ मधील JSON पेस्ट करा.",
    failedError: "JSON आयात अयशस्वी.",
  },
  ne: {
    summary: "डेभलपर उपकरणहरू: नमूना बिरामी JSON आयात गर्नुहोस्",
    apply: "तथ्याङ्क लागू गर्नुहोस्",
    loading: "तस्बिरहरू लोड हुँदैछन्…",
    clear: "आयात खाली गर्नुहोस्",
    emptyError: "आयात गर्न केही छैन — बाकस खाली छ। कृपया Data/Patient/example_json/ बाट JSON टाँस्नुहोस्।",
    failedError: "JSON आयात असफल भयो।",
  },
  mni: {
    summary: "দিভেলপর তুলস: অনাবগী স্যাম্পল JSON ইম্পোর্ট তৌবিয়ু",
    apply: "পাউ শিজিন্নবিয়ু",
    loading: "ফোতো লোড তৌরি…",
    clear: "ইম্পোর্ট তৌখিবা শেংদোকপা",
    emptyError: "ইম্পোর্ট তৌনবা অমত্তা লৈতে — বক্স অসিমক হাংই। Data/Patient/example_json/ দগী JSON পেস্ট তৌবিয়ু।",
    failedError: "JSON ইম্পোর্ট তৌবা ঙমদে।",
  },
  brx: {
    summary: "डेभेलपर टुलस: सानेनि स्यामपोल JSON लाबो",
    apply: "डेटा बाहाय",
    loading: "फोटो लोड जाबाय थादों…",
    clear: "लाबोनायखौ खोमोर",
    emptyError: "लाबोनो थाखाय जेबो गैया — बाक्स'आ लांदां। Data/Patient/example_json/ निफ्राय JSON होना हो।",
    failedError: "JSON लाबोनो हायाखिसै।",
  },
  grt: {
    summary: "Developer Tools: Sample Patient JSON Ra·bo",
    apply: "Data Ra·gata",
    loading: "Noksa gapatenga…",
    clear: "Ra·baako rongtalatbo",
    emptyError: "Ra·bana mamungba dongja — baksho bangbanga. Data/Patient/example_json/ oni JSON-ko paste ka·bo.",
    failedError: "JSON-ko ra·bana amja.",
  },
  kha: {
    summary: "Developer Tools: Wanrah ia ka Sample Patient JSON",
    apply: "Pyntrei kam ia ka Data",
    loading: "Dang pynbiang dur…",
    clear: "Pynkhuid ia ka jingwanrah",
    emptyError: "Ym don eiei ban wanrah — ka jaka thoh ka thylli. Sngewbha thep ia ka JSON na Data/Patient/example_json/.",
    failedError: "Jingwanrah JSON ka la pulom.",
  },
  lus: {
    summary: "Developer Hmanrua: Damlo Entirna JSON Dahna",
    apply: "Data Hman Rawh",
    loading: "Thlalak dah mek a ni…",
    clear: "Thian fai rawh",
    emptyError: "Dah tur a awm lo — a ruak vek e. Data/Patient/example_json/ ami JSON chu a chunga hmun ruakah hian paste rawh.",
    failedError: "JSON dah theih a ni lo.",
  },
};

export function DevImportTools() {
  const locale = useLocale();
  const d18n = DEV_IMPORT_I18N[locale] || DEV_IMPORT_I18N.en;
  const [jsonInput, setJsonInput] = useState("");
  const [prefill, setPrefill] = useState<IntakeFormData | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleApply = async () => {
    if (jsonInput.trim() === "") {
      setImportError(d18n.emptyError);
      return;
    }
    setIsImporting(true);
    setImportError(null);
    try {
      const data = await mapSampleJsonToFormData(jsonInput);
      setPrefill(data);
      setPrefillKey((k) => k + 1);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : d18n.failedError);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setPrefill(null);
    setPrefillKey((k) => k + 1);
    setImportError(null);
  };

  return (
    <>
      <details
        className="mb-4 rounded-xl border-2 border-dashed border-border-soft bg-surface/60 backdrop-blur-sm transition-colors open:border-border"
      >
        <summary className="inline-flex items-center gap-1.5 cursor-pointer select-none px-4 py-2.5 font-bold text-sm text-ink-secondary hover:text-ink">
          <Wrench className="h-4 w-4 text-tea" />
          <span>{d18n.summary}</span>
        </summary>
        <div className="px-4 pb-4 pt-2 space-y-3">
          <p className="text-xs text-ink-secondary leading-snug">
            Paste one of the sample patient JSONs ({" "}
            <code className="font-mono text-ink">
              Data/Patient/example_json/example_patient_1_biren_borah.json
            </code>{" "}
            …{" "}
            <code className="font-mono text-ink">
              example_patient_5_kevichusa_angami.json
            </code>
            ) and click &quot;Apply Data&quot; to pre-fill the wizard. Bundled
            relative and place photos load automatically (via{" "}
            <code className="font-mono text-ink">/sample-images/</code>). If any
            photo is missing, select one to attach it manually.
          </p>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            spellCheck={false}
            disabled={isImporting}
            placeholder='{ "step_1_about_patient": { ... } }'
            className="w-full font-mono text-xs rounded-lg border-3 border-border-soft bg-surface p-3 text-ink placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors resize-y disabled:opacity-60"
          />
          {importError && (
            <p role="alert" className="flex items-center gap-1.5 text-brick text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{importError}</span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              disabled={isImporting}
              className="btn-tactile bg-tea text-ink border-2 min-h-[40px] px-5 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="scale-[0.35] -mx-2">
                    <Spinner label={d18n.loading} />
                  </span>
                  {d18n.loading}
                </span>
              ) : (
                d18n.apply
              )}
            </button>
            {prefill && (
              <button
                type="button"
                onClick={handleClear}
                className="min-h-[40px] px-4 rounded-lg border-2 border-border-soft bg-surface text-ink-secondary font-bold text-sm hover:bg-surface-muted transition-colors cursor-pointer"
              >
                {d18n.clear}
              </button>
            )}
          </div>
        </div>
      </details>

      <IntakeWizardClient key={prefillKey} prefill={prefill ?? undefined} />
    </>
  );
}