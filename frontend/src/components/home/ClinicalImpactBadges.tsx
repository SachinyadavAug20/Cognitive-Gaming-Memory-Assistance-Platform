"use client";

import { Activity, ShieldCheck, Cpu, Globe2, Check } from "lucide-react";
import { useLocale } from "next-intl";

const PILLARS_I18N: Record<string, {
  p1Title: string; p1Desc: string; p1Tag: string;
  p2Title: string; p2Desc: string; p2Tag: string;
  p3Title: string; p3Desc: string; p3Tag: string;
  p4Title: string; p4Desc: string; p4Tag: string;
}> = {
  as: {
    p1Title: "১৮ দৈনিক মগজুৰ খেল",
    p1Desc: "৫ টা জ্ঞানীয় ক্ষেত্ৰ, মৃদু হাতৰ সঞ্চালন আৰু দৈনিক স্মৃতিৰ ওপৰত ভিত্তি কৰি কেলিব্ৰেট কৰা।",
    p1Tag: "স্মৃতি • মনোযোগ • মটৰ",
    p2Title: "১০০% অফলাইন এজ এআই",
    p2Desc: "ডিভাইচৰ বাহিৰলৈ তথ্য নোযোৱাকৈ স্থানীয় Ollama এআই-এ ১৭ টা ক্লিনিকেল ক্ষেত্ৰ বিশ্লেষণ কৰে।",
    p2Tag: "ব্যক্তিগত • ডিভাইচত • অফলাইন",
    p3Title: "১১ টা থলুৱা ভাষা",
    p3Desc: "৮ খন উত্তৰ-পূব ৰাজ্যৰ বাবে স্থানীয় মাত আৰু দৃশ্য সমৰ্থনৰ সুবিধা।",
    p3Tag: "৮ উত্তৰ-পূব ৰাজ্য • সহজ অডিঅ'",
    p4Title: "ABDM আৰু MDoNER জিআইএছ",
    p4Desc: "আয়ুশ্মান ভাৰত ABHA হেল্থ আইডি আৰু ৮ খন ৰাজ্যৰ নিৰন্তৰ স্বাস্থ্য নিৰীক্ষণ।",
    p4Tag: "ABHA আইডি • জিআইএছ টেলিমেট্ৰি",
  },
  hi: {
    p1Title: "18 दैनिक दिमागी खेल",
    p1Desc: "5 संज्ञानात्मक क्षेत्रों, कोमल हाथ की हरकतों और दैनिक याददाश्त के लिए नैदानिक रूप से प्रमाणित।",
    p1Tag: "स्मृति • एकाग्रता • मोटर",
    p2Title: "100% ऑफलाइन एज एआई",
    p2Desc: "डिवाइस से बिना डेटा बाहर भेजे स्थानीय Ollama मॉडल 17 चिकित्सीय क्षेत्रों का विश्लेषण करता है।",
    p2Tag: "निजी • ऑन-डिवाइस • एज",
    p3Title: "11 स्वदेशी भाषाएँ",
    p3Desc: "सभी 8 पूर्वोत्तर राज्यों के लिए मूल ध्वनि एवं दृश्य सहायता की निरंतर सुविधा।",
    p3Tag: "8 पूर्वोत्तर राज्य • सहज ऑडियो",
    p4Title: "ABDM एवं MDoNER जीआईएस",
    p4Desc: "आयुष्मान भारत ABHA हेल्थ आईडी एकीकरण और निरंतर 8-राज्यीय सार्वजनिक स्वास्थ्य निगरानी।",
    p4Tag: "ABHA आईडी • जीआईएस टेलीमेट्री",
  },
  en: {
    p1Title: "18 Daily Brain Games",
    p1Desc: "Culturally calibrated across 5 cognitive domains, gentle hand movements, and daily memory recall.",
    p1Tag: "Memory • Attention • Motor",
    p2Title: "100% Offline Edge AI",
    p2Desc: "Local Ollama LLM extracts 17 clinical report domains with zero patient data leaving the device.",
    p2Tag: "Private • On-Device • Edge",
    p3Title: "11 Indigenous Languages",
    p3Desc: "Native voice & visual support across all 8 North Eastern states with seamless language transitions.",
    p3Tag: "8 NES States • Seamless Audio",
    p4Title: "ABDM & MDoNER GIS",
    p4Desc: "Ayushman Bharat ABHA Health ID integration with continuous 8-state public health telemetry.",
    p4Tag: "ABHA ID • GIS Telemetry",
  },
  bn: {
    p1Title: "১৮টি দৈনিক মস্তিষ্কের খেলা",
    p1Desc: "৫টি জ্ঞানীয় ক্ষেত্র, মৃদু হাতের নড়াচড়া এবং দৈনিক স্মৃতিচর্চার জন্য ক্যালিব্রেট করা।",
    p1Tag: "স্মৃতি • মনোযোগ • মোটর",
    p2Title: "১০০% অফলাইন এজ এআই",
    p2Desc: "যন্ত্র থেকে কোনো তথ্য বাইরে না পাঠিয়ে স্থানীয় Ollama এআই ১৭টি ক্ষেত্র বিশ্লেষণ করে।",
    p2Tag: "ব্যক্তিগত • অন-ডিভাইস • এজ",
    p3Title: "১১টি আঞ্চলিক ভাষা",
    p3Desc: "উত্তর-পূর্বের ৮টি রাজ্যের জন্য স্থানীয় কণ্ঠ ও দৃশ্যমান সহায়তার সুবিধা।",
    p3Tag: "৮টি রাজ্য • নিরবচ্ছিন্ন অডিও",
    p4Title: "ABDM ও MDoNER জিআইএস",
    p4Desc: "আয়ুষ্মান ভারত ABHA হেলথ আইডি ও ৮টি রাজ্যের নিরবচ্ছিন্ন জনস্বাস্থ্য নজরদারি।",
    p4Tag: "ABHA আইডি • জিআইএস টেলিমেট্রি",
  },
  mr: {
    p1Title: "18 दैनिक मेंदूचे खेळ",
    p1Desc: "5 संज्ञानात्मक क्षेत्रे, कोमल हालचाली आणि दैनंदिन स्मृतीसाठी प्रमाणित.",
    p1Tag: "स्मृती • लक्ष • मोटर",
    p2Title: "100% ऑफलाइन एज एआय",
    p2Desc: "माहिती बाहेर न पाठवता स्थानिक Ollama एआय 17 क्लिनिकल क्षेत्रांचे विश्लेषण करते.",
    p2Tag: "खाजगी • डिव्हाइसवर • ऑफलाइन",
    p3Title: "11 प्रादेशिक भाषा",
    p3Desc: "ईशान्येकडील सर्व 8 राज्यांसाठी स्थानिक आवाज आणि दृश्य साहाय्य.",
    p3Tag: "8 राज्ये • सुलभ ऑडिओ",
    p4Title: "ABDM व MDoNER जीआयएस",
    p4Desc: "आयुष्मान भारत ABHA आयडी आणि 8 राज्यांचे सातत्यपूर्ण आरोग्य निरीक्षण.",
    p4Tag: "ABHA आयडी • जीआयएस टेलिमेट्री",
  },
  ne: {
    p1Title: "१८ दैनिक मस्तिष्क खेलहरू",
    p1Desc: "५ संज्ञानात्मक क्षेत्रहरू, कोमल हातका चालहरू र दैनिक स्मृतिका लागि प्रमाणित।",
    p1Tag: "स्मृति • ध्यान • मोटर",
    p2Title: "१००% अफलाइन एज एआई",
    p2Desc: "यन्त्रबाट डेटा बाहिर नपठाई स्थानीय Ollama मोडेलले १७ क्लिनिकल क्षेत्रहरू विश्लेषण गर्दछ।",
    p2Tag: "निजी • यन्त्रमै • अफलाइन",
    p3Title: "११ स्थानीय भाषाहरू",
    p3Desc: "पूर्वोत्तरका ८ वटै राज्यहरूका लागि स्थानीय आवाज र दृश्य सहायता।",
    p3Tag: "८ पूर्वोत्तर राज्य • सहज अडियो",
    p4Title: "ABDM र MDoNER जीआईएस",
    p4Desc: "आयुष्मान भारत ABHA हेल्थ आईडी र ८ राज्यहरूको निरन्तर स्वास्थ्य टेलिमेट्री।",
    p4Tag: "ABHA आईडी • जीआईएस टेलिमेट्री",
  },
  mni: {
    p1Title: "১৮ নুমিৎ খুদিংগী শান্নপোৎ",
    p1Desc: "ৱাখলগী হীরম ৫, খুৎকী ইরাং অমসুং নুমিৎ খুদিংগী নিংশিংবদা য়ুম্ফম ওইবা।",
    p1Tag: "নিংশিংবা • মীৎয়েং • মটর",
    p2Title: "১০০% অফলাইন এজ এআই",
    p2Desc: "লোকেল Ollama এআই না খুৎলাইদগী মপান চৎহন্দনা হীরম ১৭ য়েংশিল্লি।",
    p2Tag: "মশাগী • দিভাইসতা • অফলাইন",
    p3Title: "১১ লমদমগী লোলশিং",
    p3Desc: "রাজ্য ৮ গীদমক লমদমগী খোন্থোক অমসুং য়েংবগী মতেং।",
    p3Tag: "রাজ্য ৮ • সো অপ ওদিও",
    p4Title: "ABDM অমসুং MDoNER GIS",
    p4Desc: "আয়ুষ্মান ভারত ABHA আইদি অমসুং রাজ্য ৮ গী হকশেল য়েংশিনবা।",
    p4Tag: "ABHA আইদি • GIS তেলিমেত্রি",
  },
  brx: {
    p1Title: "१८ सानफ्रोमबोनि गेलेनाय",
    p1Desc: "५ टा गोसोनि बिफान आरो आखायनि लासै दावबायनायनि सायाव बिथोन होनाय।",
    p1Tag: "गोसोखांथि • गोसो होनाय • मट'र",
    p2Title: "१००% अफलाइन एज एआई",
    p2Desc: "गावनि देभाइसनिफ्राय दाथा बाहेराव थाङाजासे Ollama जों १७ टा बिफान आनजाद खालामो।",
    p2Tag: "गावनि • देभाइसआव • अफलाइन",
    p3Title: "११ टा हारिमुयारि राव",
    p3Desc: "सानजा-सा राज्योफोरनि थाखाय गावनि रावजों हेफाजात।",
    p3Tag: "८ सानजा-सा राज्यो • अदिअ'",
    p4Title: "ABDM आरो MDoNER GIS",
    p4Desc: "आयुष्मान भारत ABHA कार्ड आरो ८ राज्योनि सावस्रि नायदिंनाय।",
    p4Tag: "ABHA कार्ड • GIS टेलिमेट्रि",
  },
  grt: {
    p1Title: "Salanti Gisik Kal·anirang 18",
    p1Desc: "Cognitive domains 5, jak chetanirang aro salanti gisik ra·anirangna tarigimin.",
    p1Tag: "Gisik • Miksongani • Jak",
    p2Title: "100% Offline Edge AI",
    p2Desc: "Ollama LLM local dake mandeni datako watgija clinical domains 17-ko am·a.",
    p2Tag: "Privat • On-Device • Edge",
    p3Title: "Indigenous Ku·sikrang 11",
    p3Desc: "North East state 8-na native voice & visual support.",
    p3Tag: "State 8 • Seamless Audio",
    p4Title: "ABDM & MDoNER GIS",
    p4Desc: "Ayushman Bharat ABHA Health ID aro state 8 public health telemetry.",
    p4Tag: "ABHA ID • GIS Telemetry",
  },
  kha: {
    p1Title: "18 Tylli ki Jingialehkai Jingmut",
    p1Desc: "5 tylli ki bynta ka jingmut, ka jingkhih kti bad ka jingkynmaw man ka sngi.",
    p1Tag: "Jingkynmaw • Jingmut • Kti",
    p2Title: "100% Offline Edge AI",
    p2Desc: "Ka Ollama LLM ha ka device khlem phah ia ki data sha shabar.",
    p2Tag: "Rieh • Ha Device • Offline",
    p3Title: "11 Tylli ki Ktien Tynrai",
    p3Desc: "Ka sur ktien tynrai na ka bynta ki 8 tylli ki state ka North East.",
    p3Tag: "8 State • Sur Ktien",
    p4Title: "ABDM & MDoNER GIS",
    p4Desc: "Ayushman Bharat ABHA ID bad ka jingpeit koit khiah ha ki 8 state.",
    p4Tag: "ABHA ID • GIS Telemetry",
  },
  lus: {
    p1Title: "Ni Tin Hriatna Game 18",
    p1Desc: "Cognitive domains 5, kut chetzauna leh ni tin hriat rengna tihchak nan.",
    p1Tag: "Hriatna • Ngaihtuahna • Kut",
    p2Title: "100% Offline Edge AI",
    p2Desc: "Tualchhung Ollama AI hmangin data chhuah tir lova clinical report endikna.",
    p2Tag: "Fimkhur • Device-ah • Offline",
    p3Title: "Tualchhung Tawng 11",
    p3Desc: "North East state 8 tana mahni tawnga aw leh hmuh theih puihna.",
    p3Tag: "State 8 • Aw Mawi",
    p4Title: "ABDM & MDoNER GIS",
    p4Desc: "Ayushman Bharat ABHA Health ID leh state 8 hriselna thlithlai zui zelna.",
    p4Tag: "ABHA ID • GIS Telemetry",
  }
};

export function ClinicalImpactBadges() {
  const locale = useLocale();
  const p18n = PILLARS_I18N[locale] || PILLARS_I18N.en;

  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Pillar 1: 18 Serious CDTx Games */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-tea-light border-2 border-black flex items-center justify-center text-tea mb-2.5 shadow-xs">
            <Activity className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            {p18n.p1Title}
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            {p18n.p1Desc}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-tea uppercase tracking-wider flex items-center gap-1">
          <Check className="h-3 w-3 stroke-[3]" />
          <span>{p18n.p1Tag}</span>
        </div>
      </div>

      {/* Pillar 2: Edge Ollama LLM */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-marigold-light border-2 border-black flex items-center justify-center text-marigold-dark mb-2.5 shadow-xs">
            <Cpu className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            {p18n.p2Title}
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            {p18n.p2Desc}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-marigold-dark uppercase tracking-wider flex items-center gap-1">
          <Check className="h-3 w-3 stroke-[3]" />
          <span>{p18n.p2Tag}</span>
        </div>
      </div>

      {/* Pillar 3: 11 Regional Dialects */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-sky-100 border-2 border-black flex items-center justify-center text-sky-800 mb-2.5 shadow-xs">
            <Globe2 className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            {p18n.p3Title}
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            {p18n.p3Desc}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-sky-800 uppercase tracking-wider flex items-center gap-1">
          <Check className="h-3 w-3 stroke-[3]" />
          <span>{p18n.p3Tag}</span>
        </div>
      </div>

      {/* Pillar 4: ABDM & MDoNER Telemetry */}
      <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
        <div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border-2 border-black flex items-center justify-center text-emerald-800 mb-2.5 shadow-xs">
            <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-black text-base text-ink leading-tight">
            {p18n.p4Title}
          </h3>
          <p className="text-xs text-ink-secondary mt-1 font-medium leading-relaxed">
            {p18n.p4Desc}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
          <Check className="h-3 w-3 stroke-[3]" />
          <span>{p18n.p4Tag}</span>
        </div>
      </div>
    </section>
  );
}
