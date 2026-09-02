"use client";

import React from "react";
import { Sliders, Send } from "lucide-react";
import type { AdminAiTuning } from "@/types/admin";

interface AdminAiTabProps {
  aiTuning: AdminAiTuning | null;
  savingTuning: boolean;
  testPrompt: string;
  testResponse: string | null;
  testingAi: boolean;
  onTuningChange: (tuning: AdminAiTuning) => void;
  onSaveTuning: () => void;
  onTestPromptChange: (prompt: string) => void;
  onRunTestPrompt: () => void;
}

export function AdminAiTab({
  aiTuning,
  savingTuning,
  testPrompt,
  testResponse,
  testingAi,
  onTuningChange,
  onSaveTuning,
  onTestPromptChange,
  onRunTestPrompt,
}: AdminAiTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Parameter Sliders */}
      <div className="lg:col-span-2 rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <Sliders className="h-5 w-5 text-purple-700" />
            ML Adaptive Difficulty Calibration Engine
          </h2>
          <span className="rounded-full bg-purple-100 border border-purple-400 px-3 py-0.5 text-[11px] font-black text-purple-950">
            Real-Time Engine Hook
          </span>
        </div>

        {aiTuning && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-1">
                <span>Baseline Motor Reaction Threshold:</span>
                <span className="font-mono font-black text-purple-900">
                  {aiTuning.baselineReactionLatencyMs} ms
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={1600}
                step={50}
                value={aiTuning.baselineReactionLatencyMs}
                onChange={(e) =>
                  onTuningChange({
                    ...aiTuning,
                    baselineReactionLatencyMs: Number(e.target.value),
                  })
                }
                className="w-full accent-purple-700 cursor-pointer"
              />
              <span className="text-[10px] text-ink-secondary">
                Games dynamically pace speed if patient reaction latency exceeds this threshold.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-1">
                <span>Hesitation Scaffolding Trigger:</span>
                <span className="font-mono font-black text-purple-900">
                  After {aiTuning.hesitationThreshold} Hesitations
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={aiTuning.hesitationThreshold}
                onChange={(e) =>
                  onTuningChange({
                    ...aiTuning,
                    hesitationThreshold: Number(e.target.value),
                  })
                }
                className="w-full accent-purple-700 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 rounded-2xl border-2 border-black bg-purple-50/60 p-3 text-xs font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiTuning.errorlessScaffolding}
                  onChange={(e) =>
                    onTuningChange({
                      ...aiTuning,
                      errorlessScaffolding: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-purple-700 rounded"
                />
                <span>Errorless Scaffolding (Frustration Shield)</span>
              </label>

              <label className="flex items-center gap-2 rounded-2xl border-2 border-black bg-purple-50/60 p-3 text-xs font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiTuning.sundowningProtectionMode}
                  onChange={(e) =>
                    onTuningChange({
                      ...aiTuning,
                      sundowningProtectionMode: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-purple-700 rounded"
                />
                <span>Sundowning Acoustic Mode (Post 4 PM)</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onSaveTuning}
                disabled={savingTuning}
                className="btn-tactile rounded-xl border-2 border-black bg-purple-600 px-5 py-2.5 text-xs font-black text-white shadow-[3px_3px_0px_#000] hover:bg-purple-700 cursor-pointer disabled:opacity-50"
              >
                {savingTuning ? "Saving Calibration..." : "Apply Calibration Parameters"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Prompt Benchmark Console */}
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2 mb-2">
            <Send className="h-4 w-4 text-tea" />
            Live ASHA Prompt Benchmark
          </h3>
          <p className="text-xs font-medium text-ink-secondary mb-3">
            Evaluate local LLM response speed for generating community health summaries.
          </p>

          <textarea
            rows={3}
            value={testPrompt}
            onChange={(e) => onTestPromptChange(e.target.value)}
            className="w-full rounded-2xl border-2 border-black bg-[#FAF6F0] p-3 text-xs font-bold text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-tea"
          />

          <button
            type="button"
            onClick={onRunTestPrompt}
            disabled={testingAi}
            className="mt-2 w-full btn-tactile rounded-xl border-2 border-black bg-purple-200 py-2 text-xs font-black text-purple-950 shadow-[2px_2px_0px_#000] hover:bg-purple-300 cursor-pointer disabled:opacity-50"
          >
            {testingAi ? "Evaluating with Ollama..." : "Run Benchmark Prompt ⚡"}
          </button>
        </div>

        {testResponse && (
          <div className="rounded-2xl border-2 border-black bg-purple-100/70 p-3.5 text-xs text-purple-950 font-medium animate-fade-in">
            <span className="font-black text-[10px] uppercase text-purple-900 block mb-1">
              Generated ASHA Observation:
            </span>
            <p className="italic leading-relaxed">&ldquo;{testResponse}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
