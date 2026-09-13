"use client";

import React from "react";
import { useLocale } from "next-intl";
import {
  ShieldAlert,
  MapPin,
  TrendingUp,
  Video,
  Pill,
  HeartHandshake,
  HeartPulse,
  Coins,
  Megaphone,
  Users,
  Gamepad2,
  Sliders,
  Radio,
  BookOpen,
  History,
  LucideIcon,
} from "lucide-react";

export type AdminTab =
  | "surveillance"
  | "regions"
  | "predictive"
  | "telemanas"
  | "medications"
  | "burnout"
  | "alerts"
  | "incentives"
  | "broadcast"
  | "patients"
  | "sessions"
  | "ai"
  | "kiosks"
  | "cultural"
  | "audit";

const ADMIN_TABS_I18N: Record<string, Record<AdminTab, string>> = {
  en: {
    surveillance: "NER Dementia & MCI Surveillance Matrix",
    regions: "NER Heatmap & GIS",
    predictive: "Predictive AI Trajectories",
    telemanas: "Tele-MANAS Neurology Hub",
    medications: "Medication & Care",
    burnout: "Caregiver Burden Index",
    alerts: "Clinical Escalations & ASHA",
    incentives: "ASHA DBT Ledger",
    broadcast: "Emergency Siren Broadcast",
    patients: "Patients & QR Passkeys",
    sessions: "Games Audit Trail",
    ai: "ML Engine Calibration",
    kiosks: "PHC Fleet & 2G Sync",
    cultural: "Cultural Assets Bank",
    audit: "ABDM / Security Audit",
  },
  as: {
    surveillance: "উত্তৰ-পূব ডিমেনচিয়া আৰু MCI নিৰীক্ষণ মেট্ৰিক্স",
    regions: "উত্তৰ-পূব তাপমান মানচিত্ৰ আৰু GIS",
    predictive: "ভৱিষ্যদ্বাণীমূলক AI গতিপথ",
    telemanas: "টেলি-মানস স্নায়ুৰোগ হাব",
    medications: "ঔষধ আৰু পৰিচৰ্যা",
    burnout: "যত্নকৰ্তাৰ মানসিক চাপ সূচক",
    alerts: "ক্লিনিকেল সতৰ্কতা আৰু আশা",
    incentives: "আশা DBT লেজাৰ",
    broadcast: "জৰুৰীকালীন চাইৰেন সম্প্ৰচাৰ",
    patients: "ৰোগী আৰু QR পাছকী",
    sessions: "খেলৰ পৰীক্ষা লিপি",
    ai: "ML ইঞ্জিন কেলিব্ৰেচন",
    kiosks: "PHC নেটৱৰ্ক আৰু 2G সমকালীনকৰণ",
    cultural: "সাংস্কৃতিক সম্পদ ভঁৰাল",
    audit: "ABDM / সুৰক্ষা অডিট",
  },
  hi: {
    surveillance: "पूर्वोत्तर डिमेंशिया एवं MCI निगरानी मैट्रिक्स",
    regions: "पूर्वोत्तर हीटमैप एवं GIS",
    predictive: "भविष्यसूचक AI प्रक्षेपवक्र",
    telemanas: "टेली-मानस न्यूरोलॉजी हब",
    medications: "दवा एवं देखभाल",
    burnout: "देखभालकर्ता तनाव सूचकांक",
    alerts: "नैदानिक चेतावनी एवं आशा कार्यकर्ता",
    incentives: "आशा DBT बहीखाता",
    broadcast: "आपातकालीन सायरन प्रसारण",
    patients: "रोगी एवं QR पासकी",
    sessions: "खेल ऑडिट ट्रेल",
    ai: "ML इंजन अंशांकन",
    kiosks: "PHC बेड़ा एवं 2G सिंक",
    cultural: "सांस्कृतिक संपदा बैंक",
    audit: "ABDM / सुरक्षा ऑडिट",
  },
  bn: {
    surveillance: "উত্তর-পূর্ব ডিমেনশিয়া ও MCI নজরদারি ম্যাট্রিক্স",
    regions: "উত্তর-পূর্ব হিটম্যাপ ও GIS",
    predictive: "ভবিষ্যদ্বাণীমূলক AI গতিপথ",
    telemanas: "টেলি-মানস নিউরোলজি হাব",
    medications: "ওষুধ ও পরিচর্যা",
    burnout: "পরিচর্যাকারী ক্লান্তি সূচক",
    alerts: "ক্লিনিকাল সতর্কতা ও আশা কর্মী",
    incentives: "আশা DBT খতিয়ান",
    broadcast: "জরুরি সাইরেন সম্প্রচার",
    patients: "রোগী ও QR পাসকি",
    sessions: "গেম অডিট ট্রেইল",
    ai: "ML ইঞ্জিন ক্যালিব্রেশন",
    kiosks: "PHC ফ্লিট ও 2G সিঙ্ক",
    cultural: "সাংস্কৃতিক সম্পদ ব্যাংক",
    audit: "ABDM / নিরাপত্তা অডিট",
  },
  mr: {
    surveillance: "ईशान्य डिमेंशिया व MCI पाळत मॅट्रिक्स",
    regions: "ईशान्य हीटमॅप व GIS",
    predictive: "पूर्वानुमान AI प्रक्षेपपथ",
    telemanas: "टेलि-मानस न्यूरोलॉजी केंद्र",
    medications: "औषधे आणि काळजी",
    burnout: "काळजीवाहक ताण निर्देशांक",
    alerts: "क्लिनिकल इशारे आणि आशा",
    incentives: "आशा DBT खातेवही",
    broadcast: "आपत्कालीन सायरन प्रसारण",
    patients: "रुग्ण आणि QR पासकी",
    sessions: "खेळ ऑडिट ट्रेल",
    ai: "ML इंजिन कॅलिब्रेशन",
    kiosks: "PHC संच आणि 2G सिंक",
    cultural: "सांस्कृतिक संपदा बँक",
    audit: "ABDM / सुरक्षा ऑडिट",
  },
  ne: {
    surveillance: "पूर्वोत्तर डिमेन्सिया तथा MCI निगरानी म्याट्रिक्स",
    regions: "पूर्वोत्तर हिटम्याप तथा GIS",
    predictive: "पूर्वानुमानित AI मार्ग",
    telemanas: "टेलि-मानस न्युरोलोजी केन्द्र",
    medications: "औषधि तथा हेरचाह",
    burnout: "हेरचाहकर्ता बोझ सूचकाङ्क",
    alerts: "क्लिनिकल सतर्कता र आशा",
    incentives: "आशा DBT खाता",
    broadcast: "आपतकालीन साइरन प्रसारण",
    patients: "बिरामी तथा QR पासकी",
    sessions: "खेल अडिट विवरण",
    ai: "ML इन्जिन क्यालिब्रेसन",
    kiosks: "PHC सञ्जाल तथा 2G सिङ्क",
    cultural: "सांस्कृतिक सम्पदा बैंक",
    audit: "ABDM / सुरक्षा अडिट",
  },
  mni: {
    surveillance: "NER দিমেন্সিয়া অমসুং MCI সর্ভিলেন্স মেত্রিক্স",
    regions: "NER হিৎমেপ অমসুং GIS",
    predictive: "মমাংদা খঙদোকপা AI ত্রাজেক্তরি",
    telemanas: "তেলি-মানাস নিউরোলোজি হব",
    medications: "হিদাক-লাংথক অমসুং শেন্নবা",
    burnout: "শেন্নবগী থৱায় ৱাবা ইনদেক্স",
    alerts: "ক্লিনিকল এলার্ত অমসুং আশা",
    incentives: "আশা DBT লেজর",
    broadcast: "অকুপ্পা মতমগী সাইরেন ব্রোদকাস্ত",
    patients: "অনাবা অমসুং QR পাসকী",
    sessions: "শান-খোৎনবগী ওদিত ত্রেল",
    ai: "ML ইঞ্জিন কেলিগ্রেসন",
    kiosks: "PHC ফ্লীৎ অমসুং 2G সিংহ্ক",
    cultural: "নাৎকী লন-থুম বেংক",
    audit: "ABDM / সেক্যুরিতি ওদিত",
  },
  brx: {
    surveillance: "NER डिमेन्सिया आरो MCI नोजोर मैट्रिक्स",
    regions: "NER गुदुं मानसिथ आरो GIS",
    predictive: "सिगां फोरमायग्रा AI लामा",
    telemanas: "टेलि-मानस निउर'लजि मिरु",
    medications: "मुलि आरो सामलायनाय",
    burnout: "सामलायग्रानि गोसोनि थाखो",
    alerts: "क्लिनिकेल हुसियार आरो आशा",
    incentives: "आशा DBT लेजार",
    broadcast: "गोनांथार साइरेन फोसावनाय",
    patients: "बिरामीफोर आरो QR पासकि",
    sessions: "गेलेमूनि नायबिजिरनाय",
    ai: "ML इन्जिन सामलायनाय",
    kiosks: "PHC हानजा आरो 2G सिंक",
    cultural: "हारिमुआरि सम्पद बेंक",
    audit: "ABDM / रैखाथि आनजाद",
  },
  grt: {
    surveillance: "NER Dementia aro MCI Niani Matrix",
    regions: "NER Heatmap aro GIS",
    predictive: "Predictive AI Trajectory-rang",
    telemanas: "Tele-MANAS Neurology Hub",
    medications: "Sam aro Sanni Kam",
    burnout: "Sanigipani Neng·ani Index",
    alerts: "Clinical Alerts aro ASHA",
    incentives: "ASHA DBT Ledger",
    broadcast: "Emergency Siren Gakani",
    patients: "Bimangrang aro QR Passkey",
    sessions: "Kal·ani Audit Trail",
    ai: "ML Engine Calibration",
    kiosks: "PHC Fleet aro 2G Sync",
    cultural: "Dakkobol Ramani Bank",
    audit: "ABDM / Chelchakani Audit",
  },
  kha: {
    surveillance: "NER Dementia & MCI Surveillance Matrix",
    regions: "NER Heatmap & GIS",
    predictive: "Ki Buit AI ba iohi lpa",
    telemanas: "Tele-MANAS Neurology Hub",
    medications: "Dawai & Jingpeit Jingkhiah",
    burnout: "Jingkit Khia u Nongsumar",
    alerts: "Jingmaham Dawai & ASHA",
    incentives: "ASHA DBT Ledger",
    broadcast: "Pynbna Siren ba Kyndit",
    patients: "Ki Nongpang & QR Passkey",
    sessions: "Jingbishar Jingialehkai",
    ai: "Pynbeit Bor ML",
    kiosks: "PHC Fleet & 2G Sync",
    cultural: "Kynja Jingtip Tynrai",
    audit: "ABDM / Jingiada Audit",
  },
  lus: {
    surveillance: "NER Dementia & MCI Endikna Matrix",
    regions: "NER Heatmap leh GIS",
    predictive: "AI Hmahmurna Kawng",
    telemanas: "Tele-MANAS Neurology Hub",
    medications: "Damdawi leh Enkawlna",
    burnout: "Enkawltu Harsatna Index",
    alerts: "Damdawi Vênna leh ASHA",
    incentives: "ASHA DBT Ledger",
    broadcast: "Thil Thut Siren Puanchhuah",
    patients: "Damlo leh QR Passkey",
    sessions: "Infiamna Endikna",
    ai: "ML Engine Siamremna",
    kiosks: "PHC Kiosk leh 2G Sync",
    cultural: "Ziarang Ropui Vawnthatna",
    audit: "ABDM / Himna Endikna",
  },
};

interface TabItem {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  count?: number;
  alertBadge?: boolean;
}

interface AdminTabsNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  surveillanceCount: number;
  districtsCount: number;
  teleManasCount: number;
  medAdherenceCount: number;
  caregiverBurnoutCount: number;
  unresolvedAlertsCount: number;
  ashaIncentivesCount: number;
  broadcastsCount: number;
  patientsCount: number;
  sessionsCount: number;
  kiosksCount: number;
  culturalAssetsCount: number;
}

export function AdminTabsNav({
  activeTab,
  onTabChange,
  surveillanceCount,
  districtsCount,
  teleManasCount,
  medAdherenceCount,
  caregiverBurnoutCount,
  unresolvedAlertsCount,
  ashaIncentivesCount,
  broadcastsCount,
  patientsCount,
  sessionsCount,
  kiosksCount,
  culturalAssetsCount,
}: AdminTabsNavProps) {
  const locale = useLocale();
  const normLocale = locale?.split("-")[0].toLowerCase() || "en";
  const tabDict = ADMIN_TABS_I18N[normLocale] || ADMIN_TABS_I18N.en;

  const tabs: TabItem[] = [
    { id: "surveillance", label: tabDict.surveillance, icon: ShieldAlert, count: surveillanceCount || 8, alertBadge: true },
    { id: "regions", label: tabDict.regions, icon: MapPin, count: districtsCount },
    { id: "predictive", label: tabDict.predictive, icon: TrendingUp },
    { id: "telemanas", label: tabDict.telemanas, icon: Video, count: teleManasCount },
    { id: "medications", label: tabDict.medications, icon: Pill, count: medAdherenceCount },
    { id: "burnout", label: tabDict.burnout, icon: HeartHandshake, count: caregiverBurnoutCount },
    { id: "alerts", label: tabDict.alerts, icon: HeartPulse, count: unresolvedAlertsCount, alertBadge: unresolvedAlertsCount > 0 },
    { id: "incentives", label: tabDict.incentives, icon: Coins, count: ashaIncentivesCount },
    { id: "broadcast", label: tabDict.broadcast, icon: Megaphone, count: broadcastsCount },
    { id: "patients", label: tabDict.patients, icon: Users, count: patientsCount },
    { id: "sessions", label: tabDict.sessions, icon: Gamepad2, count: sessionsCount },
    { id: "ai", label: tabDict.ai, icon: Sliders },
    { id: "kiosks", label: tabDict.kiosks, icon: Radio, count: kiosksCount },
    { id: "cultural", label: tabDict.cultural, icon: BookOpen, count: culturalAssetsCount },
    { id: "audit", label: tabDict.audit, icon: History },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b-3 border-black pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`btn-tactile flex items-center gap-1.5 rounded-2xl border-2 border-black px-3 py-1.5 text-[11px] font-black cursor-pointer transition-all ${
              isActive
                ? "bg-black text-white shadow-[3px_3px_0px_#000] -translate-y-0.5"
                : "bg-surface text-ink hover:bg-amber-100/60 shadow-[2px_2px_0px_#000]"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-300" : "text-tea"}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                  tab.alertBadge
                    ? "bg-rose-500 text-white animate-bounce"
                    : isActive
                    ? "bg-white/20 text-white"
                    : "bg-black/10 text-ink"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
