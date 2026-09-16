"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { AdminOverviewCards } from "@/components/admin/AdminOverviewCards";
import { AdminTabsNav, type AdminTab } from "@/components/admin/AdminTabsNav";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ADMIN_HEADER_I18N } from "@/lib/adminI18n";
import { useAdminTelemetry } from "@/hooks/useAdminTelemetry";

function TabLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-ink-secondary gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
      <span className="text-sm font-semibold">Loading module...</span>
    </div>
  );
}

const AdminSurveillanceTab = dynamic(() => import("@/components/admin/tabs/AdminSurveillanceTab").then((m) => m.AdminSurveillanceTab), { loading: () => <TabLoading />, ssr: false });
const AdminRegionsTab = dynamic(() => import("@/components/admin/tabs/AdminRegionsTab").then((m) => m.AdminRegionsTab), { loading: () => <TabLoading />, ssr: false });
const AdminPredictiveTab = dynamic(() => import("@/components/admin/tabs/AdminPredictiveTab").then((m) => m.AdminPredictiveTab), { loading: () => <TabLoading />, ssr: false });
const AdminTeleManasTab = dynamic(() => import("@/components/admin/tabs/AdminTeleManasTab").then((m) => m.AdminTeleManasTab), { loading: () => <TabLoading />, ssr: false });
const AdminMedicationsTab = dynamic(() => import("@/components/admin/tabs/AdminMedicationsTab").then((m) => m.AdminMedicationsTab), { loading: () => <TabLoading />, ssr: false });
const AdminBurnoutTab = dynamic(() => import("@/components/admin/tabs/AdminBurnoutTab").then((m) => m.AdminBurnoutTab), { loading: () => <TabLoading />, ssr: false });
const AdminAlertsTab = dynamic(() => import("@/components/admin/tabs/AdminAlertsTab").then((m) => m.AdminAlertsTab), { loading: () => <TabLoading />, ssr: false });
const AdminIncentivesTab = dynamic(() => import("@/components/admin/tabs/AdminIncentivesTab").then((m) => m.AdminIncentivesTab), { loading: () => <TabLoading />, ssr: false });
const AdminBroadcastTab = dynamic(() => import("@/components/admin/tabs/AdminBroadcastTab").then((m) => m.AdminBroadcastTab), { loading: () => <TabLoading />, ssr: false });
const AdminPatientsTab = dynamic(() => import("@/components/admin/tabs/AdminPatientsTab").then((m) => m.AdminPatientsTab), { loading: () => <TabLoading />, ssr: false });
const AdminSessionsTab = dynamic(() => import("@/components/admin/tabs/AdminSessionsTab").then((m) => m.AdminSessionsTab), { loading: () => <TabLoading />, ssr: false });
const AdminAiTab = dynamic(() => import("@/components/admin/tabs/AdminAiTab").then((m) => m.AdminAiTab), { loading: () => <TabLoading />, ssr: false });
const AdminKiosksTab = dynamic(() => import("@/components/admin/tabs/AdminKiosksTab").then((m) => m.AdminKiosksTab), { loading: () => <TabLoading />, ssr: false });
const AdminCulturalTab = dynamic(() => import("@/components/admin/tabs/AdminCulturalTab").then((m) => m.AdminCulturalTab), { loading: () => <TabLoading />, ssr: false });
const AdminAuditTab = dynamic(() => import("@/components/admin/tabs/AdminAuditTab").then((m) => m.AdminAuditTab), { loading: () => <TabLoading />, ssr: false });
const AdminRevokeModal = dynamic(() => import("@/components/admin/AdminRevokeModal").then((m) => m.AdminRevokeModal), { ssr: false });

export default function AdminDashboardPage() {
  const locale = useLocale();
  const normLocale = locale?.split("-")[0].toLowerCase() || "en";
  const adm = ADMIN_HEADER_I18N[normLocale] || ADMIN_HEADER_I18N.en;

  const [activeTab, setActiveTab] = useState<AdminTab>("surveillance");

  const telemetry = useAdminTelemetry();

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-16 pt-6 select-none font-sans text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

        <AdminHeader
          headerTexts={adm}
          lastRefreshedAt={telemetry.lastRefreshedAt}
          autoRefresh={telemetry.autoRefresh}
          isRefreshing={telemetry.isRefreshing}
          onToggleAutoRefresh={() => telemetry.setAutoRefresh((prev) => !prev)}
          onRefreshTelemetry={() => void telemetry.fetchData(true)}
        />

        {telemetry.feedbackMessage && (
          <div
            className={`flex items-center justify-between rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0px_#000] animate-fade-in ${
              telemetry.feedbackMessage.type === "success" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              {telemetry.feedbackMessage.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-rose-700 shrink-0" />
              )}
              <span>{telemetry.feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => telemetry.setFeedbackMessage(null)}
              className="text-xs font-black underline cursor-pointer hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {telemetry.error && (
          <div className="flex items-center justify-between rounded-2xl border-3 border-black bg-amber-100 p-4 text-amber-950 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <AlertTriangle className="h-5 w-5 text-amber-800 shrink-0" />
              <span>Low-Bandwidth Offline Buffer Active: {telemetry.error}. Local data cached safely.</span>
            </div>
            <button
              type="button"
              onClick={() => void telemetry.fetchData(true)}
              className="btn-tactile rounded-xl border-2 border-black bg-surface px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        <AdminOverviewCards
          loading={telemetry.loading}
          overview={telemetry.overview}
          aiDiag={telemetry.aiDiag}
          offlineQueue={telemetry.offlineQueue}
        />

        <AdminTabsNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          surveillanceCount={telemetry.surveillance.length}
          districtsCount={telemetry.districts.length}
          teleManasCount={telemetry.teleManasQueue.length}
          medAdherenceCount={telemetry.medAdherence.length}
          caregiverBurnoutCount={telemetry.caregiverBurnout.length}
          unresolvedAlertsCount={telemetry.unresolvedAlertsCount}
          ashaIncentivesCount={telemetry.ashaIncentives.length}
          broadcastsCount={telemetry.broadcasts.length}
          patientsCount={telemetry.patients.length}
          sessionsCount={telemetry.sessions.length}
          kiosksCount={telemetry.kiosks.length}
          culturalAssetsCount={telemetry.culturalAssets.length}
        />

        {activeTab === "surveillance" && (
          <AdminSurveillanceTab
            surveillance={telemetry.surveillance}
            unresolvedAlertsCount={telemetry.unresolvedAlertsCount}
            onExportJson={telemetry.handleExportJson}
          />
        )}

        {activeTab === "regions" && (
          <AdminRegionsTab districts={telemetry.districts} />
        )}

        {activeTab === "predictive" && (
          <AdminPredictiveTab predictiveTrajectories={telemetry.predictiveTrajectories} />
        )}

        {activeTab === "telemanas" && (
          <AdminTeleManasTab teleManasQueue={telemetry.teleManasQueue} />
        )}

        {activeTab === "medications" && (
          <AdminMedicationsTab
            medAdherence={telemetry.medAdherence}
            onRemindMedication={telemetry.handleRemindMedication}
          />
        )}

        {activeTab === "burnout" && (
          <AdminBurnoutTab
            caregiverBurnout={telemetry.caregiverBurnout}
            onDispatchRespite={(district, name) =>
              telemetry.setFeedbackMessage({
                type: "success",
                text: `Community respite care request routed to ${district} PHC for ${name}.`,
              })
            }
          />
        )}

        {activeTab === "alerts" && (
          <AdminAlertsTab
            alerts={telemetry.alerts}
            ashaWorkers={telemetry.ashaWorkers}
            onResolveAlert={telemetry.handleResolveAlert}
          />
        )}

        {activeTab === "incentives" && (
          <AdminIncentivesTab
            ashaIncentives={telemetry.ashaIncentives}
            onApproveIncentive={telemetry.handleApproveIncentive}
          />
        )}

        {activeTab === "broadcast" && (
          <AdminBroadcastTab
            broadcasts={telemetry.broadcasts}
            newBroadcast={telemetry.newBroadcast}
            dispatchingBroadcast={telemetry.dispatchingBroadcast}
            onBroadcastChange={telemetry.setNewBroadcast}
            onDispatchBroadcast={telemetry.handleDispatchBroadcast}
          />
        )}

        {activeTab === "patients" && (
          <AdminPatientsTab
            patients={telemetry.patients}
            loading={telemetry.loading}
            reissuingId={telemetry.reissuingId}
            onReissueCard={telemetry.handleReissueCard}
            onRevokeCard={telemetry.setPatientToRevoke}
          />
        )}

        {activeTab === "sessions" && (
          <AdminSessionsTab sessions={telemetry.sessions} />
        )}

        {activeTab === "ai" && (
          <AdminAiTab
            aiTuning={telemetry.aiTuning}
            savingTuning={telemetry.savingTuning}
            testPrompt={telemetry.testPrompt}
            testResponse={telemetry.testResponse}
            testingAi={telemetry.testingAi}
            onTuningChange={telemetry.setAiTuning}
            onSaveTuning={telemetry.handleSaveAiTuning}
            onTestPromptChange={telemetry.setTestPrompt}
            onRunTestPrompt={telemetry.handleTestPrompt}
          />
        )}

        {activeTab === "kiosks" && (
          <AdminKiosksTab
            offlineQueue={telemetry.offlineQueue}
            kioskDevices={telemetry.kioskDevices}
          />
        )}

        {activeTab === "cultural" && (
          <AdminCulturalTab
            culturalAssets={telemetry.culturalAssets}
            newProverb={telemetry.newProverb}
            addingProverb={telemetry.addingProverb}
            onProverbChange={telemetry.setNewProverb}
            onAddProverb={telemetry.handleAddProverb}
          />
        )}

        {activeTab === "audit" && (
          <AdminAuditTab
            auditLogs={telemetry.auditLogs}
            onExportJson={telemetry.handleExportJson}
            onExportCsv={telemetry.handleExportCsv}
          />
        )}

        {telemetry.patientToRevoke && (
          <AdminRevokeModal
            patient={telemetry.patientToRevoke}
            revoking={telemetry.revoking}
            onCancel={() => telemetry.setPatientToRevoke(null)}
            onConfirm={telemetry.handleConfirmRevoke}
          />
        )}

      </div>
    </div>
  );
}
