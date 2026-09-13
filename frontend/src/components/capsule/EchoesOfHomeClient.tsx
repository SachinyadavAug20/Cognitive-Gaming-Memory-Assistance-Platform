"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Sparkles,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Headphones,
  Compass,
  Eye,
} from "lucide-react";
import type {
  MemoryCapsule,
  AmbientSoundType,
  MemoryHotspot,
  MemoryColorFilter,
} from "@/types/capsule";
import {
  getAllCapsulesForPatient,
  saveCapsuleSessionLog,
  getFutureTimeCapsules,
} from "@/data/defaultCapsules";
import { Capsule3DScene } from "./Capsule3DScene";
import { WebcamHeadTracker } from "./WebcamHeadTracker";
import { FutureTimeCapsuleModal } from "./FutureTimeCapsuleModal";
import {
  playCapsuleSoundscape,
  stopCapsuleSoundscape,
  setSoundscapeVolume,
  playFamilyVoiceNote,
  stopFamilyVoiceNote,
  updateSpatialPan,
  toggleBinauralBeat,
  playHotspotAudioCue,
} from "@/lib/capsuleSoundscapes";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate } from "@/games/config";
import { playTapFeedback, playEncourage } from "@/lib/sound";
import { stopSpeaking } from "@/lib/speech";
import type { SupportedLocale } from "@/lib/gameI18n";

interface LocalizedCapsuleData {
  title: string;
  locationName: string;
  seasonOrTime: string;
  voiceNoteText: string;
  reflectionPrompt: string;
}

const CAPSULE_LOCALIZATIONS: Record<string, Record<SupportedLocale, LocalizedCapsuleData>> = {
  "capsule-biren-01": {
    en: {
      title: "Courtyard Lal Saah & Mango Tree Shade",
      locationName: "Silpukhuri, Guwahati",
      seasonOrTime: "Morning Sunlight",
      voiceNoteText: "Biren, the morning Lal Saah is warm and waiting on the cane table. Look at how bright the sun shines through our mango leaves. Take a sip, everything is peaceful.",
      reflectionPrompt: "Listen to the morning birds calling from the bamboo grove. Pratima has poured your favorite warm red tea.",
    },
    as: {
      title: "চোতালৰ ৰঙা চাহ আৰু আম গছৰ ছাঁ",
      locationName: "শিলপুখুৰী, গুৱাহাটী",
      seasonOrTime: "পুৱাৰ ৰ'দালী",
      voiceNoteText: "বীৰেন, ৰাতিপুৱাৰ ৰঙা চাহ কাপ বেতৰ মেজখনত গৰমে গৰমে ৰখা আছে। আম গছৰ পাতৰ ফাঁকেৰে কেনে ধুনীয়াকৈ ৰ'দালি জিলিকিছে চাওকচোন। চাহ একোহা মাৰক, সকলো শান্ত আৰু কুশলে আছে।",
      reflectionPrompt: "বাঁহ গছৰ ডালত ৰাতিপুৱাৰ চৰাইৰ মিঠা মাত শুনক। প্ৰতিমাই আপোনাৰ প্ৰিয় ৰঙা চাহ বাকি দিছে।",
    },
    hi: {
      title: "आंगन की लाल चाय और आम के पेड़ की छांव",
      locationName: "सिल्पुखुरी, गुवाहाटी",
      seasonOrTime: "सुबह की धूप",
      voiceNoteText: "बीरेन, सुबह की लाल चाय बेंत की मेज पर आपका इंतज़ार कर रही है। देखिए आम के पत्तों से कितनी सुंदर धूप छनकर आ रही है। एक घूंट लीजिए, सब कुछ शांत और सुरक्षित है।",
      reflectionPrompt: "बांस के पेड़ों से आती सुबह की मीठी चहचहाहट सुनिए। प्रतिमा ने आपके लिए गरमागरम लाल चाय बनाई है।",
    },
    bn: {
      title: "উঠোনের লাল চা ও আম গাছের ছায়া",
      locationName: "শিলপুকুরী, গুয়াহাটি",
      seasonOrTime: "সকালের মিষ্টি রোদ",
      voiceNoteText: "বীরেন, সকালের গরম লাল চা বেতের টেবিলে সাজানো আছে। দেখ আমাদের আম গাছের পাতার ফাঁক দিয়ে কেমন সুন্দর রোদ এসে পড়েছে। এক চুমুক চা নাও, সব কিছু শান্ত ও সুন্দর।",
      reflectionPrompt: "বাঁশবাগানে সকালের পাখির মিষ্টি ডাক শুনুন। প্রতিমা আপনার প্রিয় লাল চা তৈরি করে রেখেছে।",
    },
    mr: {
      title: "अंगणातील लाल चहा आणि आंब्याची सावली",
      locationName: "सिल्पुखुरी, गुवाहाटी",
      seasonOrTime: "सकाळचे ऊन",
      voiceNoteText: "बिरेन, सकाळचा गरम लाल चहा वेताच्या टेबलावर तयार आहे. आंब्याच्या पानांमधून सूर्यकिरणे कशी चमकतायत बघा. एक घोट घ्या, सर्वकाही शांत आणि सुरक्षित आहे.",
      reflectionPrompt: "बांबूच्या झाडीतून येणाऱ्या पाखरांचे मंजूळ आवाज ऐका. प्रतिमा यांनी तुमच्यासाठी गरम लाल चहा तयार ठेवला आहे.",
    },
    ne: {
      title: "आँगनको रातो चिया र आँपको रुखको छहारी",
      locationName: "सिल्पुखुरी, गुवाहाटी",
      seasonOrTime: "बिहानीको घाम",
      voiceNoteText: "बिरेन, बिहानीको तातो रातो चिया बेतको टेबुलमा तयार छ। हाम्रो आँपको पातहरूबाट घाम कति राम्रो गरी चम्किरहेको छ हेर्नुहोस् त। एक घुट्को लिनुहोस्, सबै कुरा शान्त छ।",
      reflectionPrompt: "बाँसको झ्याङबाट आइरहेको चराहरूको मीठो चिरबिर सुन्नुहोस्। प्रतिमाले तपाईंको मनपर्ने रातो चिया बनाइराखेकी छिन्।",
    },
    mni: {
      title: "সুমোক্কী লাল চাহ অমসুং হেইনোউ পাম্বীগী মমী",
      locationName: "শিলপুখুরী, গুৱাহাটি",
      seasonOrTime: "অয়ুক্কী নুমিৎ ৱাংখৎপা",
      voiceNoteText: "বীরেন, অয়ুক্কী লাল চাহ অদু ৱাখলগী মেজদা লোইনা লৈরে। ঐখোইগী হেইনোউ মনাগী মরক্তগী নুমিৎ মঙাল্না কয়ারোম নুংশিনা চঙলকই য়েংউ। চাহ অমা থকউ, পুম্নমক তোংলবনি।",
      reflectionPrompt: "ৱাশাংদগী উচেকশিংগী তোংলবা খোন্থোক তান্নবা। প্রতিমানা অদোমগী নুংশিবা লাল চাহ থকহন্নবা শেম্লে।",
    },
    brx: {
      title: "अंगनानि गोजा साहा आरो थाइगिर बिफांनि सायमाया",
      locationName: "सिल्पुखुरी, गुवाहाटी",
      seasonOrTime: "फुंनि सानदुं",
      voiceNoteText: "बिरेन, फुंनि गोजा साहाया बेतनि मेजाव गुदुंयै दं। जोंनि थाइगिर बिफांनि बिलाय गेजेरजों सानदुंआ माबादि मोजांयै जोंदों नायदो। साहा लोंना ला, गासैबो गोजोन आरो साबसिन।",
      reflectionPrompt: "उवा बिफांनि दाउस्रिनि मोजां सोदोबखौ खोनासं। प्रतिमाया नोंथांनि मोजां मोननाय गोजा साहा बानायना दोनबाय।",
    },
    grt: {
      title: "Noknapni Saa Gitchak aro Te∙gatchu Bolni Salgittim",
      locationName: "Silpukhuri, Guwahati",
      seasonOrTime: "Pringni Sal",
      voiceNoteText: "Biren, pringni saa gitchak mez-o ding∙e donga. Chingni te∙gatchu bijakko sal teng∙ani koba nina nambegopa. Ringbo, pilakan tom∙tomenga.",
      reflectionPrompt: "Pringni do∙o mikkatani knatimbo. Pratima nang∙ni namnikgipa saa gitchakko tarie dona.",
    },
    kha: {
      title: "Ka Sha Saw ha phyllaw bad Ka Syiem Diengsohphan",
      locationName: "Silpukhuri, Guwahati",
      seasonOrTime: "Sngi Step ba Shit",
      voiceNoteText: "Biren, ka sha saw ba shit ka dang don ha miej siej. Khmih kumno ka sngi ka tyngshaiñ lyngba ki sla sohbaran jong ngi. Dih khyndiat, baroh ka long kaba suk.",
      reflectionPrompt: "Sngap ia ki sim ba pah na ki siej. I Pratima i la theh ia ka sha saw kaba phi ieid.",
    },
    lus: {
      title: "Tualchar Thingpui Sen leh Theihai Hlim",
      locationName: "Silpukhuri, Guwahati",
      seasonOrTime: "Zing Ni Eng",
      voiceNoteText: "Biren, zing thingpui sen lum nuam tak chu thutthleng bula dawhkanah a awm tawh e. Kan theihai hnah kar atanga ni eng rawn lut hi han thlir teh. In rawh le, engkim a ralmuang e.",
      reflectionPrompt: "Mau hnah kara savate hram ri mawi tak chu ngaithla rawh le. Pratima-in i duh ber thingpui sen lum a thli tawh e.",
    },
  },
  "capsule-mary-01": {
    en: {
      title: "Sunday Chimes at Laitumkhrah Cathedral",
      locationName: "Cathedral, Shillong",
      seasonOrTime: "Sunday Morning",
      voiceNoteText: "Kong Mary, listen to the church bells ringing across Laitumkhrah hill. Banylla is holding your hand in her red woollen gloves. The blue cathedral doors are open for hymns.",
      reflectionPrompt: "The sweet cathedral bells fill the mountain air with peaceful comfort. You are surrounded by love and warmth.",
    },
    as: {
      title: "লাইতুমখ্ৰাহ কেথেড্ৰেলৰ দেওবৰীয়া ঘণ্টাধ্বনি",
      locationName: "কেথেড্ৰেল, শ্বিলং",
      seasonOrTime: "দেওবৰীয়া পুৱা",
      voiceNoteText: "কং মেৰী, লাইতুমখ্ৰাহ পাহাৰত বাজি থকা গীৰ্জাৰ ঘণ্টাবোৰ শুনকচোন। বানিলাই ৰঙা উণৰ হাতমোজা পিন্ধি আপোনাৰ হাতখন ধৰি আছে। প্ৰাৰ্থনাৰ বাবে নীলা দুৱাৰখন খুলি দিয়া হৈছে।",
      reflectionPrompt: "কেথেড্ৰেলৰ ঘণ্টাৰ মধুৰ ধ্বনিয়ে পাহাৰৰ বতাহত অপাৰ শান্তি বিলাইছে। আপুনি সকলোৰে মৰমৰ মাজত নিৰাপদে আছে।",
    },
    hi: {
      title: "लाइतुमख्राह कैथेड्रल की रविवार की घंटियां",
      locationName: "कैथेड्रल, शिलांग",
      seasonOrTime: "रविवार सुबह",
      voiceNoteText: "कोंग मैरी, लाइतुमख्राह की पहाड़ी पर बजती गिरजे की घंटियों को सुनिए। बानिला ने लाल ऊनी दस्ताने पहने आपका हाथ थामा है। प्रार्थना के लिए नीले कपाट खुले हैं।",
      reflectionPrompt: "कैथेड्रल की घंटियों की मधुर गूंज से वातावरण शांत है। आप अपनों के प्रेम और अपनत्व से घिरे हैं।",
    },
    bn: {
      title: "লাইতুমখ্রা ক্যাথিড্রালের রবিবারের ঘণ্টার ধ্বনি",
      locationName: "ক্যাথিড্রাল, শিলং",
      seasonOrTime: "রবিবার সকাল",
      voiceNoteText: "কং মেরি, লাইতুমখ্রা পাহাড়ের গির্জার ঘণ্টার মিষ্টি আওয়াজ শোনো। বানিলা লাল উলের দস্তানা পরে তোমার হাত ধরে আছে। প্রার্থনার জন্য নীল দরজা খুলে দেওয়া হয়েছে।",
      reflectionPrompt: "ক্যাথিড্রালের ঘণ্টার মিষ্টি আওয়াজে পাহাড়ের শান্ত বাতাস ভরে উঠেছে। আপনি গভীর ভালোবাসায় ঘেরা।",
    },
    mr: {
      title: "लैतुमख्राह कॅथेड्रलच्या रविवारच्या घंटा",
      locationName: "कॅथेड्रल, शिलाँग",
      seasonOrTime: "रविवार सकाळ",
      voiceNoteText: "काँग मेरी, लैतुमख्राह टेकडीवरून घुमणाऱ्या चर्चच्या घंटा ऐका. बानिलाने लाल लोकरीचे हातमोजे घालून तुमचा हात धरला आहे. प्रार्थनेसाठी निळे दरवाजे उघडे आहेत.",
      reflectionPrompt: "कॅथेड्रलच्या घंटांचे मंजूळ नाद हवेत शांतता पसरवत आहेत. तुम्ही प्रेमाने वेढलेले आहात.",
    },
    ne: {
      title: "लाइतुमख्राह क्याथेड्रलको आइतबारको घण्टी",
      locationName: "क्याथेड्रल, शिलोङ",
      seasonOrTime: "आइतबार बिहान",
      voiceNoteText: "काङ मेरी, लाइतुमख्राह डाँडामा बजिरहेको चर्चको घण्टी सुन्नुहोस् त। बानिलाले रातो ऊनी पञ्जा लगाएर तपाईंको हात समातेकी छिन्। भजनका लागि नीलो ढोका खुला छ।",
      reflectionPrompt: "क्याथेड्रलको घण्टीको मीठो गुञ्जनले वातावरण शान्त बनाएको छ। तपाईं मायाले घेरिनुभएको छ।",
    },
    mni: {
      title: "লাইতুমখ্রাহ কেথেড্রেলগী নোংমাইজিংগী নোংথোক",
      locationName: "কেথেড্রেল, শিলোং",
      seasonOrTime: "নোংমাইজিং অয়ুক",
      voiceNoteText: "কোং মেরী, লাইতুমখ্রাহ চিংশাংদা তারক্লিবা চার্চকী নোংথোক তান্নবা। বানিলানা অঙাংবা ফিরোলগী খুৎলুপ শেৎতুনা অদোমগী খুৎ পাইরি। ঈশৈ শক্নবা চার্চকী থোঙ হাংলে।",
      reflectionPrompt: "কেথেড্রেলগী নোংথোক্না চিংশাংগী নুংশিৎপু তোংহল্লে। অদোম নুংশিবনা কোইশিন্দুনা লৈরি।",
    },
    brx: {
      title: "लाइतुमख्राह गिर्जाघरनि रबिबारनि घन्टा",
      locationName: "गिर्जाघर, सिलं",
      seasonOrTime: "रबिबार फुं",
      voiceNoteText: "कं मेरी, लाइतुमख्राह हाजोसायाव गिर्जाघरनि घन्टा रिंखांनायखौ खोनासं। बानिलाया गोजा उन्दै गोजां गाननानै नोंथांनि आखायखौ हमदों। इसोरनि रोजाबनायनि थाखाय निल' दरजाया खुलिना दं।",
      reflectionPrompt: "गिर्जाघरनि घन्टाया हाजोनि बारखौ गोजोन खालामबाय। नोंथांआ मोजां मोननायजों रैखा मोनदों।",
    },
    grt: {
      title: "Laitumkhrah Cathedral-ni Robibar Ghanta",
      locationName: "Cathedral, Shillong",
      seasonOrTime: "Robibar Pring",
      voiceNoteText: "Kong Mary, Laitumkhrah a∙brini gipin chiko knatimbo. Banylla gitchak ulni jakchakko gane nang∙ni jakko rim∙enga. Ring∙na gita do∙gacholko oenga.",
      reflectionPrompt: "Cathedral-ni ghanta a∙brini balwako tom∙tomatenga. Nang∙ko ka∙sae ni∙rokatenga.",
    },
    kha: {
      title: "Ki Ksing Sngi U Blei ha Laitumkhrah Cathedral",
      locationName: "Cathedral, Shillong",
      seasonOrTime: "Step Sngi U Blei",
      voiceNoteText: "Kong Mary, sngap ia ki ksing mane blei ba sawa ha lum Laitumkhrah. I Banylla i la bat ia ka kti jong phi da ki janti saw. Ki khyrdop blang ki la plied ban rwai jingrwai.",
      reflectionPrompt: "Ki ksing mane blei ki pynsuk ia ka lyer lum. Phi don ha pdeng ka jingieid.",
    },
    lus: {
      title: "Laitumkhrah Biak In Dar Rik Mawi",
      locationName: "Cathedral, Shillong",
      seasonOrTime: "Chawlhni Zing",
      voiceNoteText: "Kong Mary, Laitumkhrah tlanga biak in dar ri mawi tak chu han ngaithla teh. Banylla chuan a kutkawr sen bun chungin i kut a vuan tlat e. Hla sa turin biak in kawngkhar pawl chu an hawng tawh e.",
      reflectionPrompt: "Biak in dar ri mawi tak chuan tlang boruak a tiralmuang e. Hmangaihna thuk takin a hual vel che a ni.",
    },
  },
  "capsule-biren-02": {
    en: {
      title: "Sunset Boat on the Brahmaputra River",
      locationName: "Umananda Ghat, Guwahati",
      seasonOrTime: "Golden Sunset",
      voiceNoteText: "Deuta, remember the gentle breeze on the Brahmaputra ferry? The river water turned golden like honey. We bought roasted groundnuts and watched the river gulls glide.",
      reflectionPrompt: "The golden river ripples gently bring peaceful thoughts. Everything is calm and safe.",
    },
    as: {
      title: "ব্ৰহ্মপুত্ৰৰ বুকুত গধূলিৰ নাও",
      locationName: "উমানন্দ ঘাট, গুৱাহাটী",
      seasonOrTime: "সোণালী বেলি লহিয়া",
      voiceNoteText: "দেউতা, ব্ৰহ্মপুত্ৰৰ ফেৰীখনত সেই মৃদু বতাহজাকৰ কথা মনত আছেনে? নৈৰ পানীখিনি মৌৰ দৰে সোণালী হৈ পৰিছিল। আমি ভজা বাদাম খাই খাই গঙাচিলনীৰ উৰণ চাইছিলো।",
      reflectionPrompt: "নৈৰ সোণালী ঢৌবোৰে মনলৈ গভীৰ প্ৰশান্তি নমাই আনিছে। সকলো সুন্দৰ আৰু নিৰাপদ।",
    },
    hi: {
      title: "ब्रह्मपुत्र नदी पर सूर्यास्त की नाव",
      locationName: "उमानंद घाट, गुवाहाटी",
      seasonOrTime: "सुनहरी शाम",
      voiceNoteText: "देउता, याद है ब्रह्मपुत्र की नाव पर बहती वह ठंडी हवा? नदी का पानी शहद जैसा सुनहरा हो गया था। हमने भुनी हुई मूंगफली खाई थी और पंछियों को उड़ते देखा था।",
      reflectionPrompt: "नदी की सुनहरी लहरें मन को शांति देती हैं। सब कुछ शांत और सुरक्षित है।",
    },
    bn: {
      title: "ব্রহ্মপুত্র নদে সূর্যাস্তের নৌকা",
      locationName: "উমানন্দ ঘাট, গুয়াহাটি",
      seasonOrTime: "সোনালী সূর্যাস্ত",
      voiceNoteText: "দেউতা, ব্রহ্মপুত্রের নৌকায় সেই মিষ্টি বাতাসের কথা মনে পড়ে? নদীর জল যেন মধুর মতো সোনালী হয়ে গিয়েছিল। আমরা বাদাম খেতে খেতে গাঙচিলদের ওড়া দেখছিলাম।",
      reflectionPrompt: "নদীর সোনালী ঢেউ মনকে শান্ত করে। সব কিছু শান্ত এবং নিরাপদ।",
    },
    mr: {
      title: "ब्रह्मपुत्रा नदीवर सूर्यास्ताची नौका",
      locationName: "उमानंद घाट, गुवाहाटी",
      seasonOrTime: "सोनेरी संध्याकाळ",
      voiceNoteText: "देऊता, ब्रह्मपुत्रेच्या बोटीवरची ती थंड वाऱ्याची झुळूक आठवतेय का? नदीचे पाणी मधासारखे सोनेरी चमकत होते. आपण शेंगदाणे खात उडणाऱ्या पाखरांना पाहत होतो.",
      reflectionPrompt: "नदीच्या सोनेरी लहरी मनाला शांती देतात. सर्वकाही शांत आणि सुरक्षित आहे.",
    },
    ne: {
      title: "ब्रह्मपुत्र नदीमा सूर्यास्तको डुङ्गा",
      locationName: "उमानन्द घाट, गुवाहाटी",
      seasonOrTime: "सुनौलो सूर्यास्त",
      voiceNoteText: "देउता, ब्रह्मपुत्रको डुङ्गामा बहेको त्यो मीठो हावा सम्झनुहुन्छ? नदीको पानी मह जस्तै सुनौलो भएको थियो। हामीले बदाम खाँदै चराहरू उडेको हेरेका थियौं।",
      reflectionPrompt: "नदीको सुनौला छालहरूले मनलाई शान्ति दिन्छ। सबै कुरा सुरक्षित छ।",
    },
    mni: {
      title: "ব্রহ্মপুত্র তুরেলদা নুমিৎ তাখিবগী হী",
      locationName: "উমানন্দ ঘাট, গুৱাহাটি",
      seasonOrTime: "সনাগী নুমিৎ তাখিবা",
      voiceNoteText: "দেউতা, ব্রহ্মপুত্রগী হীদা নুংশিবা নুংশিৎ হুম্বা অদু নিংশিংবীরব্রা? তুরেলগী ঈশিংনা খোইহীগুম সনা মচু ওন্থোকখি। ঐখোইনা চানা চাদুনা উচেকশিং পাইবা য়েংখি।",
      reflectionPrompt: "তুরেলগী সনা মচুগী ঈচেলনা ৱাখলবু তোংহল্লে। পুম্নমক শান্ত ওই।",
    },
    brx: {
      title: "ब्रह्मपुत्र दैमायाव सानहासिनायनि नाब",
      locationName: "उमानन्द घाट, गुवाहाटी",
      seasonOrTime: "सोनारि सानहासिनाय",
      voiceNoteText: "देउता, ब्रह्मपुत्रनि नाबाव बार बारनायखौ गोसो खांदोंना? दैमानि दैया मौ बादि सोनारि जादोंमोन। जों बादाम जाबाय जाबाय दाउस्रिफोरनि बिरनायखौ नायदोंमोन।",
      reflectionPrompt: "दैमानि सोनारि दैबानाव गोसोआ गोजोन जायो। गासैबो गोजोन आरो साबसिन।",
    },
    grt: {
      title: "Brahmaputra Chibolo Sal Re∙onani Ring",
      locationName: "Umananda Ghat, Guwahati",
      seasonOrTime: "Sonani Sal Re∙ona",
      voiceNoteText: "Deuta, Brahmaputra ringo balgipako gisik ra∙engama? Chini mikkango mitchi gita sonani rong ong∙aha. Chinga badam cha∙e do∙o birangko nina katchaaha.",
      reflectionPrompt: "Chini sonani chi dingtenggipao gisiko tom∙tomataniko ra∙baenga.",
    },
    kha: {
      title: "Ka Lieng ha Wah Brahmaputra ha ka Jingsep Sngi",
      locationName: "Umananda Ghat, Guwahati",
      seasonOrTime: "Ka Jingsep Sngi Kynroi Kynshew",
      voiceNoteText: "Deuta, phi kynmaw ia ka lyer jem ha ka lieng ha Wah Brahmaputra? Ka um wah ka la kylla stem kum ka ngap. Ngi la bam badam bad khmih ia ki sim ba her.",
      reflectionPrompt: "Ka jingkynroi ka wah kaba tyngshaiñ ka wanrah jingsuk ha ka jingmut.",
    },
    lus: {
      title: "Brahmaputra Luia Ni Tla Thlirna Lawng",
      locationName: "Umananda Ghat, Guwahati",
      seasonOrTime: "Ni Tla Rangkachak",
      voiceNoteText: "Ka Pa, Brahmaputra lawnga thlifim thaw heuh heuh kha i la hria em? Lui tui chu khawizu ang maiin a eng no nghulh mai a. Badam kan ei a, vapual thlawk kual vel kan thlir dun anih kha.",
      reflectionPrompt: "Lui tui fawn eng no nghulh chuan thlamuanna a thlen che e.",
    },
  },
  "capsule-mary-02": {
    en: {
      title: "Plucking Tender Tips at Happy Valley Tea Estate",
      locationName: "Happy Valley, Shillong",
      seasonOrTime: "Mountain Morning",
      voiceNoteText: "Mei-ie, look at the emerald tea bushes rolling across Happy Valley hills. The morning pine mist is lifting, and the fresh tea leaves smell like sweet morning rain.",
      reflectionPrompt: "The scent of fresh tea leaves and mountain mist brings soothing clarity and peace.",
    },
    as: {
      title: "হেপ্পী ভেলী চাহ বাগিচাত কোমল দুটি পাত চিঙা",
      locationName: "হেপ্পী ভেলী, শ্বিলং",
      seasonOrTime: "পাহাৰৰ পুৱা",
      voiceNoteText: "মেই-ই, হেপ্পী ভেলী পাহাৰত সেউজীয়া চাহৰ ঢৌবোৰ চাওকচোন। পাইন গছৰ পুৱাৰ কুঁৱলী আঁতৰিছে আৰু সতেজ চাহ পাতবোৰৰ পৰা বৰষুণৰ মিঠা সুবাস ওলাইছে।",
      reflectionPrompt: "সতেজ চাহ পাত আৰু পাহাৰৰ কুঁৱলীৰ সুবাসে মনলৈ প্ৰশান্তি কঢ়িয়াই আনিছে।",
    },
    hi: {
      title: "हैप्पी वैली चाय बागान में कोमल पत्तियां चुनना",
      locationName: "हैप्पी वैली, शिलांग",
      seasonOrTime: "पहाड़ की सुबह",
      voiceNoteText: "मेई-ई, हैप्पी वैली की पहाड़ियों पर फैले इन हरे-भरे चाय के बागानों को देखिए। चीड़ के पेड़ों का कोहरा छंट रहा है और ताज़ी पत्तियों से सौंधी खुशबू आ रही है।",
      reflectionPrompt: "चाय की ताज़ी पत्तियों और पहाड़ की ठंडी हवा से मन तरोताज़ा और शांत हो जाता है।",
    },
    bn: {
      title: "হ্যাপি ভ্যালি চা বাগানে কচি পাতা তোলা",
      locationName: "হ্যাপি ভ্যালি, শিলং",
      seasonOrTime: "পাহাড়ের সকাল",
      voiceNoteText: "মেই-ই, হ্যাপি ভ্যালির পাহাড়ে ছড়ানো সবুজ চা বাগানগুলো দেখো। পাইনের কুয়াশা সরে যাচ্ছে আর টাটকা চা পাতার গন্ধ যেন বৃষ্টির মিষ্টি সুবাসের মতো।",
      reflectionPrompt: "টাটকা চা পাতা আর পাহাড়ের কুয়াশার গন্ধ মনকে প্রশান্ত ও নির্মল করে তোলে।",
    },
    mr: {
      title: "हॅपी व्हॅली चहाच्या मळ्यात कोवळी पाने खुडणे",
      locationName: "हॅपी व्हॅली, शिलाँग",
      seasonOrTime: "डोंगराळ सकाळ",
      voiceNoteText: "मेई-ई, हॅपी व्हॅलीच्या टेकड्यांवरील हे हिरवेगार चहाचे मळे बघा. पाइनच्या झाडांवरील धुकं ओसरतंय आणि ताज्या चहाच्या पानांचा छान सुगंध येतोय.",
      reflectionPrompt: "ताज्या चहाच्या पानांचा आणि डोंगराळ धुक्याचा सुगंध मनाला शांत करतो.",
    },
    ne: {
      title: "ह्याप्पी भ्याली चिया बगानमा मुना टिप्दै",
      locationName: "ह्याप्पी भ्याली, शिलोङ",
      seasonOrTime: "पहाडको बिहानी",
      voiceNoteText: "मेई-ई, ह्याप्पी भ्यालीको डाँडाभरि फैलिएका हरिया चियाका बुट्टाहरू हेर्नुहोस् त। बिहानीको कुहिरो हट्दैछ र नयाँ चियाको पातबाट मीठो बासना आइरहेको छ।",
      reflectionPrompt: "ताजा चियाको पात र पहाडी कुहिरोको सुगन्धले मनलाई शान्त र ताजा बनाउँछ।",
    },
    mni: {
      title: "হেপ্পী ভেলী চা পামদা চা মনা য়াংবা",
      locationName: "হেপ্পী ভেলী, শিলোং",
      seasonOrTime: "চিঙগী অয়ুক",
      voiceNoteText: "মেই-ই, হেপ্পী ভেলী চিংশাংদা চেন্দুনা লৈরিবা চা পামশিং অসি য়েংবীয়ু। অয়ুক্কী পাইন কুহুম্বা লোইখ্রে অমসুং চা মনাগী নুংশিবা মনা তাদুনা লৈরে।",
      reflectionPrompt: "অনৌবা চা মনাগী নুংশিবা মনানা ৱাখলবু তোংহল্লে অমসুং সন্থোকহল্লে।",
    },
    brx: {
      title: "हेपी भेलि साहा बागानआव साहा बिलाय खायनाय",
      locationName: "हेपी भेलि, सिलं",
      seasonOrTime: "हाजोनि फुं",
      voiceNoteText: "मेइ-इ, हेपी भेलिनि हाजोफोराव गोथां साहा बिफांफोरखौ नायदो। फुंनि खफ'आ गोजाव लांबाय आरो गोदान साहा बिलाइनिफ्राय अखा हानाय बादि मोदोमनाय फैदों।",
      reflectionPrompt: "गोदान साहा बिलाय आरो हाजोनि खफ'नि मोदोमनाया गोसोखौ गोजोन खालामो।",
    },
    grt: {
      title: "Happy Valley Saa Bagan-o Saa Bijak Ratani",
      locationName: "Happy Valley, Shillong",
      seasonOrTime: "A∙brini Pring",
      voiceNoteText: "Mei-ie, Happy Valley a∙brirango tangsekbegipa saa bolrangko nibo. Pringni guuri re∙angengon, saa bijak gitalrang mikka sima gita seengenga.",
      reflectionPrompt: "Saa bijak gital aro a∙brini guurini sima gisikna tom∙tomaniko ra∙baenga.",
    },
    kha: {
      title: "Kheit Sla Sha ha Happy Valley Tea Estate",
      locationName: "Happy Valley, Shillong",
      seasonOrTime: "Ka Step ha Lum",
      voiceNoteText: "Mei-ie, khmih ia ki lum jyrngam ba tap da ki dieng sha ha Happy Valley. Ka tdem kseh step ka la sdang jah, bad ki sla sha ba thymmai ki sma kum u lapbah ba shngiam.",
      reflectionPrompt: "Ka jingsma ki sla sha ba thymmai bad ka tdem lum ki pynsuk ia ka jingmut.",
    },
    lus: {
      title: "Happy Valley Hhuanah Thingpui Hnah No Thliah",
      locationName: "Happy Valley, Shillong",
      seasonOrTime: "Tlang Zing",
      voiceNoteText: "Ka Pi, Happy Valley tlanga thingpui hnah hring nghulh mai hi han thlir teh. Zing khawthiang hlim taka thingpui hnah no rim chu ruah sur hlim rim ang maiin a tui chem chem mai.",
      reflectionPrompt: "Thingpui hnah no rimtui tak leh tlang boruak thiang chuan rilru a tiharh sawng sawng e.",
    },
  },
  "capsule-biren-03": {
    en: {
      title: "Rongali Bihu Dhol Beats in Latasil Field",
      locationName: "Latasil, Guwahati",
      seasonOrTime: "Spring Bihu Festival",
      voiceNoteText: "Deuta, listen to the lively beat of the Bihu dhol drum and the sweet peepa flute! The dancers are wearing bright muga silk with red kopou flowers in their hair.",
      reflectionPrompt: "The joyful rhythm of the spring festival brings back cherished memories of celebration and unity.",
    },
    as: {
      title: "লতাশিল পথাৰত ৰঙালী বিহুৰ ঢোলৰ চাপৰ",
      locationName: "লতাশিল, গুৱাহাটী",
      seasonOrTime: "বসন্তৰ ৰঙালী বিহু",
      voiceNoteText: "দেউতা, বিহু ঢোলৰ সেই গুমগুমনি আৰু পেঁপাৰ মিঠা সুৰটো শুনকচোন! নাচনীসকলে মুগাৰ সাজ পিন্ধি খোপাত ৰঙা কপৌ ফুল গুঁজি নাচিছে।",
      reflectionPrompt: "বসন্তৰ এই উলাহে মনলৈ কঢ়িয়াই আনিছে অতীতৰ আনন্দ আৰু আত্মীয়তাৰ স্মৃতি।",
    },
    hi: {
      title: "लतासिल मैदान में रोंगाली बिहू के ढोल",
      locationName: "लतासिल, गुवाहाटी",
      seasonOrTime: "बसंत बिहू उत्सव",
      voiceNoteText: "देउता, सुनिए बिहू के ढोल की गूंज और पेपा की मधुर धुन! नर्तकियों ने सुंदर मूंगा रेशम पहना है और बालों में लाल कपौ फूल सजाए हैं।",
      reflectionPrompt: "बसंत के इस पावन उत्सव की धुनें खुशियों और पारिवारिक मिलन की यादें ताज़ा करती हैं।",
    },
    bn: {
      title: "লতাশিল মাঠে রঙালী বিহুর ঢোলের শব্দ",
      locationName: "লতাশিল, গুয়াহাটি",
      seasonOrTime: "বসন্তের রঙালী বিহু",
      voiceNoteText: "দেউতা, বিহুর ঢোলের ছন্দ আর পেঁপার মিষ্টি সুর শোনো! সুন্দর মুগা সিল্ক পরে খোঁপায় লাল কপৌ ফুল গুঁজে সবাই নাচছে।",
      reflectionPrompt: "বসন্তের উৎসবের আনন্দ স্মৃতিতে মধুর মুহূর্তগুলোকে আবার জাগিয়ে তোলে।",
    },
    mr: {
      title: "लतासिल मैदानात रोंगाली बिहूच्या ढोलचे नाद",
      locationName: "लतासिल, गुवाहाटी",
      seasonOrTime: "वसंत बिहू उत्सव",
      voiceNoteText: "देऊता, बिहूच्या ढोलांचा ताल आणि पेपाची मधुर धून ऐका! नर्तकींनी सुंदर मुगा सिल्क नेसले आहे आणि केसात लाल फुले माळली आहेत.",
      reflectionPrompt: "वसंतोत्सवाचे आनंददायी संगीत भूतकाळातील गोड आठवणी जागृत करते.",
    },
    ne: {
      title: "लतासिल मैदानमा रोङ्गाली बिहुको ढोल",
      locationName: "लतासिल, गुवाहाटी",
      seasonOrTime: "वसन्त बिहु उत्सव",
      voiceNoteText: "देउता, बिहुको ढोलको ताल र पेपाको मीठो धुन सुन्नुहोस् त! नर्तकीहरूले राम्रो मुगा रेशम लगाएर कपालमा रातो कपौ फूल सिउरेका छन्।",
      reflectionPrompt: "वसन्त उत्सवको आनन्ददायी धुनले पुराना रमाइला सम्झनाहरू ताजा बनाउँछ।",
    },
    mni: {
      title: "লতাশিল মপালদা রোঙ্গালী বিহু ঢোলগী খোন্থাং",
      locationName: "লতাশিল, গুৱাহাটি",
      seasonOrTime: "য়েন্থা বিহু কুহ্মৈ",
      voiceNoteText: "দেউতা, বিহু ঢোলগী ঈশৈ অমসুং পেপাগী তোংলবা খোন্থোক তান্নবা! জগোই শাবা নুপীমচাশিংনা মুগা ফিরোল শেৎতুনা সমজীদনা অঙাংবা লৈ য়াৎলি।",
      reflectionPrompt: "য়েন্থা কুহ্মৈগী হরাওবনা মমাংগী নুংশিবা নিংশিংবশিং অমুক হন্না পুথোরকই।",
    },
    brx: {
      title: "लतासिल फोथाराव रोंगाली बिहुनि ढोल",
      locationName: "लतासिल, गुवाहाटी",
      seasonOrTime: "बोसागनि बिहु",
      voiceNoteText: "देउता, बिहु ढोलनि मोदोमनाय आरो पेपानि गोख्रों सोदोबखौ खोनासं! मोसानायफोरा मुगा सि गाननानै खान्दायाव गोजा खपौ बार फुनदों।",
      reflectionPrompt: "बोसागनि गोजोन रिंखांनाया सिगांनि मोजां गोसोखांनायफोरखौ गोसोखांफिनहोयो।",
    },
    grt: {
      title: "Latasil Field-o Rongali Bihu Dhol Doka",
      locationName: "Latasil, Guwahati",
      seasonOrTime: "A∙galsika Bihu Sal",
      voiceNoteText: "Deuta, Bihu dhol doka aro peepa sikani surko knatimbo! Chrokgiparang muga kildingko gane mikron ba∙o gitchak bibal so∙onga.",
      reflectionPrompt: "A∙galsikani katchaani gital gisik ra∙aniko ra∙baenga.",
    },
    kha: {
      title: "Ki Sur Ksing Rongali Bihu ha Madan Latasil",
      locationName: "Madan Latasil, Guwahati",
      seasonOrTime: "Ka Por Rongali Bihu",
      voiceNoteText: "Deuta, sngap ia ki ksing Bihu bad ki sharati ba shngiam! Ki nongshad ki kup da ki jaiñ muga ba phyrnai bad buh ki tiew kopou saw ha u sniuh.",
      reflectionPrompt: "Ka jingkmen jong ka lehniam step ka kynmaw ia ki por kiba sngewtynnad.",
    },
    lus: {
      title: "Latasil Zawla Rongali Bihu Khuangkheng Rik Mawi",
      locationName: "Latasil, Guwahati",
      seasonOrTime: "Kut Bihu Hun",
      voiceNoteText: "Ka Pa, Bihu khuang leh peepa tawtawrawt ri mawi tak chu han ngaithla teh! Lam thiamte chuan muga puan mawi tak sinin an samah kopou par sen an tawn chiai mai.",
      reflectionPrompt: "Kut Bihu ri mawi tak chuan hlimna leh inpawhna hriatrengna a chawktho e.",
    },
  },
  "capsule-mary-03": {
    en: {
      title: "Warm Cinnamon Bread at Police Bazar Bakery",
      locationName: "Police Bazar, Shillong",
      seasonOrTime: "Cozy Evening",
      voiceNoteText: "Mei, smell the fresh cinnamon bread and ginger biscuits baking at the corner bakery. We have two warm cups of Assam tea ready to keep out the evening Shillong chill.",
      reflectionPrompt: "The comforting warmth of freshly baked bread and hot tea makes the evening safe and peaceful.",
    },
    as: {
      title: "পুলিচ বজাৰৰ বেকাৰীৰ গৰম দালচেনি পাউৰুটি",
      locationName: "পুলিচ বজাৰ, শ্বিলং",
      seasonOrTime: "সন্ধিয়াৰ ক্ষণ",
      voiceNoteText: "মেই, চুকৰ বেকাৰীখনৰ পৰা ওলোৱা গৰম দালচেনি ৰুটি আৰু আদাৰ বিস্কুটৰ সুবাস পাইছেনে? শ্বিলঙৰ সন্ধিয়াৰ শীতৰ পৰা ৰক্ষা পাবলৈ দুকাপ গৰম অসম চাহ সাজু আছে।",
      reflectionPrompt: "গৰম ৰুটি আৰু চাহৰ এই উমে সন্ধিয়াটোক অধিক শান্ত আৰু আপোন কৰি তুলিছে।",
    },
    hi: {
      title: "पुलिस बाज़ार बेकरी की गर्मागर्म दालचीनी ब्रेड",
      locationName: "पुलिस बाज़ार, शिलांग",
      seasonOrTime: "सुखद शाम",
      voiceNoteText: "मेई, नुक्कड़ की बेकरी से ताज़ी दालचीनी की ब्रेड और सोंठ के बिस्कुट की खुशबू सूंघिए। शाम की शिलांग की ठंड में गरमाहट के लिए हमारी दो कप चाय तैयार है।",
      reflectionPrompt: "ताज़ी बेकरी की खुशबू और गर्म चाय की चुस्की शाम को आरामदायक और सुखद बनाती है।",
    },
    bn: {
      title: "পুলিশ বাজার বেকারির গরম দারচিনি পাউরুটি",
      locationName: "পুলিশ বাজার, শিলং",
      seasonOrTime: "মনোরম সন্ধ্যা",
      voiceNoteText: "মেই, মোড়ের বেকারি থেকে তাজা দারচিনি রুটি আর আদার বিস্কুটের গন্ধ আসছে। শিলংয়ের সন্ধ্যার ঠান্ডা কাটাতে আমাদের জন্য দু কাপ গরম আসাম চা তৈরি।",
      reflectionPrompt: "গরম রুটি এবং চায়ের উষ্ণতা এই সুন্দর সন্ধ্যাকে নিরাপদ ও শান্ত করে তোলে।",
    },
    mr: {
      title: "पोलीस बाजार बेकरीमधील गरमागरम दालचिनी ब्रेड",
      locationName: "पोलीस बाजार, शिलाँग",
      seasonOrTime: "उबदार संध्याकाळ",
      voiceNoteText: "मेई, कोपऱ्यावरील बेकरीतून येणारा दालचिनी ब्रेड आणि आल्याच्या बिस्किटांचा छान सुगंध अनुभवा. शिलाँगच्या संध्याकाळच्या थंडीत आपल्यासाठी दोन कप गरम चहा तयार आहे.",
      reflectionPrompt: "गरम ब्रेड आणि चहाची उब संध्याकाळ अधिक सुखद आणि शांत करते.",
    },
    ne: {
      title: "पुलिस बजार बेकरीको तातो दालचिनी पाउरोटी",
      locationName: "पुलिस बजार, शिलोङ",
      seasonOrTime: "न्यानो साँझ",
      voiceNoteText: "मेई, कुनाको बेकरीबाट आउँदै गरेको तातो दालचिनी पाउरोटी र अदुवाको बिस्कुटको बासना सुँघ्नुहोस् त। शिलोङको साँझको जाडो भगाउन दुई कप तातो चिया तयार छ।",
      reflectionPrompt: "तातो पाउरोटी र चियाको न्यानोले साँझलाई शान्त र सुरक्षित बनाउँछ।",
    },
    mni: {
      title: "পুলিশ বাজার বেকারীগী লুম্লবা সিমেন ব্রেদ",
      locationName: "পুলিশ বাজার, শিলোং",
      seasonOrTime: "নুংশিবা নুমিদাং",
      voiceNoteText: "মেই, মচিনগী বেকারীদগী থোরক্লিবা লুম্লবা সিমেন ব্রেদ অমসুং শিঙ্গী বিস্কুটকী নুংশিবা মনা অসি তাউ। শিলোংগী নুমিদাংগী অইংবা কোকহন্নবা গৰম চাহ কাপ অনি লোইনা লৈরে।",
      reflectionPrompt: "লুম্লবা ব্রেদ অমসুং চাহগী লুম্বনা নুমিদাংবু তোংহল্লে অমসুং শান্তি পী।",
    },
    brx: {
      title: "पुलिस बाजार बेखारिनि गुदुं दालचिनि रुति",
      locationName: "पुलिस बाजार, सिलं",
      seasonOrTime: "गोजोन बेलासे",
      voiceNoteText: "मेइ, खनानि बेखारिनिफ्राय फैनाय दालचिनि रुति आरो हाजिं बिस्कुतनि मोदोमनायखौ नायदो। सिलंनि बेलासेनि गोजांनिफ्राय रैखा मोननो जोंहा गुदुं साहा कपनै दं।",
      reflectionPrompt: "गुदुं रुति आरो साहानि गुदुंआ बेलासेखौ गोजोन आरो रैखा खालामो।",
    },
    grt: {
      title: "Police Bazar Bakery-ni Ruti Ding∙gipa",
      locationName: "Police Bazar, Shillong",
      seasonOrTime: "Attam Ding∙a",
      voiceNoteText: "Mei, kona bakery-oni ruti aro ada biscuit ding∙gipani simako knapo. Shillongni attam sin∙ako warachakna saa kapgni tariaha.",
      reflectionPrompt: "Ruti ding∙gipa aro saa ding∙ani attamko tom∙tomatenga.",
    },
    kha: {
      title: "U Roti Dalchini ba Shit ha Police Bazar Bakery",
      locationName: "Police Bazar, Shillong",
      seasonOrTime: "Ka Janmiet ba Syaid",
      voiceNoteText: "Mei, sma ia u roti dalchini ba thymmai bad ki biskit shing ba dang shet ha dukan. Ngi don ar khuri ki sha Assam ba shit ban beh ia ka jingkhriat janmiet ha Shillong.",
      reflectionPrompt: "Ka jingsyaid jong u kpu ba dang shet bad ka sha ka pynsuk ia ka janmiet.",
    },
    lus: {
      title: "Police Bazar Bakery-a Chhang Lum Nuam Tak",
      locationName: "Police Bazar, Shillong",
      seasonOrTime: "Tlai Lum Nuam Tak",
      voiceNoteText: "Ka Nu, kualtea bakery atanga chhang thlum leh thingpui hmeh rimtui tak rawn nam chem chem chu han hip teh. Tlai vawt hmachhawn turin thingpui lum no hnih kan nei sa vek e.",
      reflectionPrompt: "Chhang lum rimtui tak leh thingpui lum chuan tlai boruak a tiralmuang e.",
    },
  },
};

function getLocalizedCapsule(cap: MemoryCapsule, loc: SupportedLocale): LocalizedCapsuleData {
  const locMap = CAPSULE_LOCALIZATIONS[cap.id];
  if (locMap && locMap[loc]) return locMap[loc];
  return {
    title: cap.title,
    locationName: cap.locationName,
    seasonOrTime: cap.seasonOrTime,
    voiceNoteText: cap.voiceNoteText,
    reflectionPrompt: cap.guidedPrompts?.sensoryPrompt || cap.guidedPrompts?.reflectionPrompt || "",
  };
}

const ECHOES_I18N: Record<
  SupportedLocale,
  {
    backToRoutine: string;
    title: string;
    lovingMessages: string;
    soundOn: string;
    soundMuted: string;
    caregiverTools: string;
    memoryOf: (curr: number, total: number) => string;
    prev: string;
    next: string;
    exitZen: string;
    spotlight: string;
    familyMessageFrom: (name: string, rel: string) => string;
    hearVoice: string;
    stopVoice: string;
    allMemories: (total: number) => string;
    reflectionLabel: string;
  }
> = {
  en: {
    backToRoutine: "← Back to My Routine",
    title: "Family Photos & Peaceful Memories",
    lovingMessages: "Loving Messages",
    soundOn: "Sound: ON",
    soundMuted: "Sound Muted",
    caregiverTools: "Caregiver Options",
    memoryOf: (curr, total) => `Memory ${curr} of ${total}`,
    prev: "Previous",
    next: "Next",
    exitZen: "Exit Zen Mode",
    spotlight: "Memory Spotlight",
    familyMessageFrom: (name, rel) => `Family Message from ${name} (${rel})`,
    hearVoice: "Listen to Family Voice",
    stopVoice: "Stop Reading",
    allMemories: (total) => `Our Family Memories (${total})`,
    reflectionLabel: "A peaceful moment to reminisce",
  },
  as: {
    backToRoutine: "← মোৰ দিনলিপিলৈ ঘূৰি যাওক",
    title: "পৰিয়ালৰ ফটো আৰু শান্ত স্মৃতি",
    lovingMessages: "মৰমৰ বাৰ্তা",
    soundOn: "শব্দ: চলি আছে",
    soundMuted: "শব্দ বন্ধ",
    caregiverTools: "শুশ্ৰূষাকাৰী সঁজুলি",
    memoryOf: (curr, total) => `স্মৃতি ${curr} / ${total}`,
    prev: "পূৰ্বৰ",
    next: "পৰৱৰ্তী",
    exitZen: "শান্ত অৱস্থা ত্যাগ কৰক",
    spotlight: "স্মৃতি পোহৰ",
    familyMessageFrom: (name, rel) => `${name} (${rel})-ৰ পৰিয়ালৰ বাৰ্তা`,
    hearVoice: "পৰিয়ালৰ মাত শুনক",
    stopVoice: "শব্দ বন্ধ কৰক",
    allMemories: (total) => `আমাৰ পৰিয়ালৰ স্মৃতিসমূহ (${total})`,
    reflectionLabel: "মন জুৰোৱা স্মৃতিৰ এটি ক্ষণ",
  },
  hi: {
    backToRoutine: "← मेरी दिनचर्या पर वापस",
    title: "पारिवारिक तस्वीरें और शांत स्मृतियां",
    lovingMessages: "प्यारे संदेश",
    soundOn: "ध्वनि: चालू",
    soundMuted: "ध्वनि बंद",
    caregiverTools: "देखभालकर्ता विकल्प",
    memoryOf: (curr, total) => `स्मृति ${curr} / ${total}`,
    prev: "पिछला",
    next: "अगला",
    exitZen: "शांत मोड से बाहर आएं",
    spotlight: "स्मृति केंद्र",
    familyMessageFrom: (name, rel) => `${name} (${rel}) का पारिवारिक संदेश`,
    hearVoice: "परिवार की आवाज़ सुनें",
    stopVoice: "आवाज़ रोकें",
    allMemories: (total) => `हमारी पारिवारिक स्मृतियां (${total})`,
    reflectionLabel: "शांति से यादें ताजा करने का क्षण",
  },
  bn: {
    backToRoutine: "← আমার দিনলিপিতে ফিরে যান",
    title: "পারিবারিক ছবি ও শান্ত স্মৃতি",
    lovingMessages: "ভালোবাসার বার্তা",
    soundOn: "শব্দ: চালু",
    soundMuted: "শব্দ বন্ধ",
    caregiverTools: "যত্নকারীর বিকল্প",
    memoryOf: (curr, total) => `স্মৃতি ${curr} / ${total}`,
    prev: "পূর্ববর্তী",
    next: "পরবর্তী",
    exitZen: "শান্ত মোড প্রস্থান",
    spotlight: "স্মৃতি আলোকপাত",
    familyMessageFrom: (name, rel) => `${name} (${rel})-এর বার্তা`,
    hearVoice: "পরিবারের কণ্ঠ শুনুন",
    stopVoice: "কণ্ঠ থামান",
    allMemories: (total) => `আমাদের পারিবারিক স্মৃতিসমূহ (${total})`,
    reflectionLabel: "স্মৃতিচারণের এক প্রশান্ত মুহূর্ত",
  },
  mr: {
    backToRoutine: "← माझ्या दिनचर्येकडे परत",
    title: "कौटुंबिक छायाचित्रे आणि शांत आठवणी",
    lovingMessages: "प्रेमळ संदेश",
    soundOn: "आवाज: सुरू",
    soundMuted: "आवाज बंद",
    caregiverTools: "काळजीवाहू पर्याय",
    memoryOf: (curr, total) => `आठवण ${curr} / ${total}`,
    prev: "मागील",
    next: "पुढील",
    exitZen: "शांत मोडमधून बाहेर पडा",
    spotlight: "स्मृती केंद्र",
    familyMessageFrom: (name, rel) => `${name} (${rel}) कडून संदेश`,
    hearVoice: "कुटुंबाचा आवाज ऐका",
    stopVoice: "आवाज थांबवा",
    allMemories: (total) => `आपल्या गोड आठवणी (${total})`,
    reflectionLabel: "आठवणींना उजाळा देणारा शांत क्षण",
  },
  ne: {
    backToRoutine: "← मेरो दिनचर्यामा फर्कनुहोस्",
    title: "पारिवारिक तस्बिर र शान्त सम्झनाहरू",
    lovingMessages: "मायालु सन्देशहरू",
    soundOn: "ध्वनि: चालू",
    soundMuted: "ध्वनि बन्द",
    caregiverTools: "हेरचाहकर्ता विकल्प",
    memoryOf: (curr, total) => `सम्झना ${curr} / ${total}`,
    prev: "अघिल्लो",
    next: "पछिल्लो",
    exitZen: "शान्त मोडबाट बाहिर निस्कनुहोस्",
    spotlight: "स्मृति केन्द्र",
    familyMessageFrom: (name, rel) => `${name} (${rel}) को सन्देश`,
    hearVoice: "परिवारको आवाज सुन्नुहोस्",
    stopVoice: "आवाज रोक्नुहोस्",
    allMemories: (total) => `हाम्रा पारिवारिक सम्झनाहरू (${total})`,
    reflectionLabel: "सम्झना ताजा गर्ने शान्त क्षण",
  },
  mni: {
    backToRoutine: "← ঐগী নুমিৎ খুদিংগী থবক্তা হল্লকপা",
    title: "ইমুংগী ফোতোশিং অমসুং তোংলবা নিংশিংবা",
    lovingMessages: "নুংশিবা পাউজেল",
    soundOn: "খোন্থোক: য়াওরি",
    soundMuted: "খোন্থোক মুত্থৎলে",
    caregiverTools: "য়েন্থোকপাগী পাম্বৈ",
    memoryOf: (curr, total) => `নিংশিংবা ${curr} / ${total}`,
    prev: "মমাংগী",
    next: "মথংগী",
    exitZen: "তোংবা মোদ থাদোকপা",
    spotlight: "নিংশিংবা মিৎযেং",
    familyMessageFrom: (name, rel) => `${name} (${rel}) গী পাউজেল`,
    hearVoice: "ইমুংগী খোন্থোক তান্নবা",
    stopVoice: "খোন্থোক লেপহন্নবা",
    allMemories: (total) => `ঐখোইগী ইমুংগী নিংশিংবশিং (${total})`,
    reflectionLabel: "নিংশিংবগী তোংলবা তাঞ্জা",
  },
  brx: {
    backToRoutine: "← आंनि सानफ्रोमबोनि फारियाव थांफिन",
    title: "नख'रनि फथ' आरो गोजोन गोसोखांनाय",
    lovingMessages: "मोजां मोननाय खौरां",
    soundOn: "सोदोब: जागायबाय",
    soundMuted: "सोदोब बन्द'",
    caregiverTools: "सांग्रां खालामग्रा आगजु",
    memoryOf: (curr, total) => `गोसोखांनाय ${curr} / ${total}`,
    prev: "सिगांनि",
    next: "उनाव",
    exitZen: "गोजोन म'ड एंगार",
    spotlight: "गोसोखां नोजोर",
    familyMessageFrom: (name, rel) => `${name} (${rel}) नि खौरां`,
    hearVoice: "नख'रनि राव खोनासंनाय",
    stopVoice: "राव बन्द खालाम",
    allMemories: (total) => `जोंनि नख'रनि गोसोखांनायफोर (${total})`,
    reflectionLabel: "गोसोखांफिननो गोजोन सम",
  },
  grt: {
    backToRoutine: "← Angni Salanti Re∙ani Gimin Re∙bapilbo",
    title: "Nokgimikni Noksa aro Tom∙tomani Gisik Ra∙ani",
    lovingMessages: "Ka∙saaniko Parikani",
    soundOn: "Gam∙ani: Ong∙enga",
    soundMuted: "Gam∙ani Chipa",
    caregiverTools: "Ni∙rokenggipani Sam",
    memoryOf: (curr, total) => `Gisik Ra∙ani ${curr} / ${total}`,
    prev: "Skang",
    next: "Ja∙mano",
    exitZen: "Tom∙tom Mod-ko Chipbo",
    spotlight: "Gisik Ra∙ani Noksan",
    familyMessageFrom: (name, rel) => `${name} (${rel}) ni nama katta`,
    hearVoice: "Nokdangni Ku∙rangko Knapo",
    stopVoice: "Ku∙rangko Dingtangatbo",
    allMemories: (total) => `Chingni Nokdangni Gisik Ra∙anirang (${total})`,
    reflectionLabel: "Gisik ra∙pilna tom∙tomaniko man∙ani",
  },
  kha: {
    backToRoutine: "← Phai sha ka Jingtrei ba Man ka Sngi",
    title: "Ki Dur Kmie-Kpa bad Ki Jingkynmaw Suk",
    lovingMessages: "Ki Khubor Maya",
    soundOn: "Sur: Meh",
    soundMuted: "La Pynlip ia ka Sur",
    caregiverTools: "Ki Tiarkam Nongsumar",
    memoryOf: (curr, total) => `Jingkynmaw ${curr} / ${total}`,
    prev: "Shuwa",
    next: "Bud",
    exitZen: "Mih na ka Zen Mode",
    spotlight: "Ka Tyngshaiñ Jingkynmaw",
    familyMessageFrom: (name, rel) => `Ka khubor na u/ka ${name} (${rel})`,
    hearVoice: "Sngap ia ka Sur Kur-Kha",
    stopVoice: "Sangeh ia ka Sur",
    allMemories: (total) => `Ki Jingkynmaw Kur-Kha Jong Ngi (${total})`,
    reflectionLabel: "Ka por kaba suk ban kynmaw kynshew",
  },
  lus: {
    backToRoutine: "← Ka Nitin Hunbi-ah Kir Leh Rawh",
    title: "Chhungkaw Thlalak leh Hriatrengna Ralmuang",
    lovingMessages: "Hmangaihna Thuchah",
    soundOn: "Thawm: A nung",
    soundMuted: "Thawm tihthawmloh",
    caregiverTools: "Enkawltu Hmanruate",
    memoryOf: (curr, total) => `Hriatrengna ${curr} / ${total}`,
    prev: "Hmasa",
    next: "Dawttu",
    exitZen: "Zen Mode Atanga Chhuak",
    spotlight: "Hriatrengna Enchian",
    familyMessageFrom: (name, rel) => `${name} (${rel}) hnen atanga thuchah`,
    hearVoice: "Chhungte Aw Ngaithla Rawh",
    stopVoice: "Aw Tihtawpna",
    allMemories: (total) => `Kan Chhungkaw Hriatrengnate (${total})`,
    reflectionLabel: "Hriatrengna thar leh tura hun hahdam",
  },
};

export function EchoesOfHomeClient() {
  const searchParams = useSearchParams();
  const requestedCapsuleId = searchParams.get("capsuleId");
  const rawLocale = useLocale();
  const locale = (rawLocale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const e18n = ECHOES_I18N[locale] || ECHOES_I18N.en;

  const { detail, patientId } = usePatientDetail();
  const patientName = detail?.name || "Biren Borah";

  const [capsules] = useState<MemoryCapsule[]>(() =>
    getAllCapsulesForPatient(patientId || 2)
  );

  // Active Capsule Selection
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (requestedCapsuleId) {
      const idx = capsules.findIndex((c) => c.id === requestedCapsuleId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const activeCapsule = capsules[selectedIndex] || capsules[0];
  const localized = useMemo(
    () => getLocalizedCapsule(activeCapsule, locale),
    [activeCapsule, locale]
  );

  // Motion Tracking Sensitivity
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState<"gentle" | "normal" | "high">("normal");

  // Audio States
  const [soundscapePlaying, setSoundscapePlaying] = useState(true);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [binauralMode, setBinauralMode] = useState<"gamma" | "alpha" | "off">("off");
  const [volume, setVolume] = useState(0.35);

  // Visual Atmosphere & Color Filters
  const [activeFilter, setActiveFilter] = useState<MemoryColorFilter>(
    activeCapsule?.colorFilter || "golden_hour"
  );
  const [zenMode, setZenMode] = useState(false);

  // Autopilot & Caregiver Controls
  const [autopilot, setAutopilot] = useState(false);
  const [showCaregiverDrawer, setShowCaregiverDrawer] = useState(false);

  // Future Time Capsule Modal state
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const futureCapsules = useMemo(() => getFutureTimeCapsules(patientId || 2), [patientId, isTimeCapsuleOpen]);

  // Interactive Joy Hotspots
  const [focusedHotspot, setFocusedHotspot] = useState<MemoryHotspot | null>(null);

  // Session Logging
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [loggedFeedback, setLoggedFeedback] = useState<string | null>(null);

  // Stable coordinate change handler for spatial audio pan
  const handleCoordsChange = useCallback((coords: { x: number; y: number }) => {
    updateSpatialPan(coords.x);
  }, []);

  // Stable hotspot hover handler
  const handleHotspotHover = useCallback((hotspot: MemoryHotspot | null) => {
    if (hotspot && hotspot.id !== focusedHotspot?.id) {
      playHotspotAudioCue(hotspot.soundCue || "chime");
    }
    setFocusedHotspot(hotspot);
  }, [focusedHotspot?.id]);

  // Start soundscape on capsule switch
  useEffect(() => {
    if (soundscapePlaying && activeCapsule) {
      playCapsuleSoundscape(activeCapsule.ambientSoundType, volume);
    }
    setActiveFilter(activeCapsule?.colorFilter || "golden_hour");
    setFocusedHotspot(null);
    stopFamilyVoiceNote();
    stopSpeaking();
    setVoicePlaying(false);

    return () => {
      stopCapsuleSoundscape();
      stopFamilyVoiceNote();
      stopSpeaking();
      toggleBinauralBeat("off");
    };
  }, [selectedIndex, activeCapsule?.id, soundscapePlaying]);

  const handleToggleSoundscape = () => {
    playTapFeedback();
    if (soundscapePlaying) {
      stopCapsuleSoundscape();
      setSoundscapePlaying(false);
    } else {
      playCapsuleSoundscape(activeCapsule.ambientSoundType, volume);
      setSoundscapePlaying(true);
    }
  };

  const handleBinauralToggle = (mode: "gamma" | "alpha") => {
    playTapFeedback();
    if (binauralMode === mode) {
      toggleBinauralBeat("off");
      setBinauralMode("off");
    } else {
      toggleBinauralBeat(mode);
      setBinauralMode(mode);
    }
  };

  const handlePlayVoice = () => {
    playTapFeedback();
    if (voicePlaying) {
      stopFamilyVoiceNote();
      stopSpeaking();
      setVoicePlaying(false);
    } else {
      setVoicePlaying(true);
      playFamilyVoiceNote(
        localized.voiceNoteText,
        locale,
        () => setVoicePlaying(true),
        () => setVoicePlaying(false),
        activeCapsule.voiceAudioUrl
      );
    }
  };

  const handleLogObservation = (obs: "calm" | "joyful" | "nostalgic" | "verbal") => {
    playEncourage();
    const duration = Math.max(10, Math.round((Date.now() - sessionStartTime) / 1000));
    saveCapsuleSessionLog({
      id: `log-${Date.now()}`,
      patientId: activeCapsule.patientId,
      capsuleId: activeCapsule.id,
      capsuleTitle: activeCapsule.title,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      headTrackingUsed: webcamEnabled,
      autopilotUsed: autopilot,
      engagementScore: webcamEnabled ? 94 : autopilot ? 88 : 80,
      caregiverObservation: obs,
    });
    setLoggedFeedback(obs);
    setTimeout(() => setLoggedFeedback(null), 3000);
  };

  const handlePrevCapsule = () => {
    playTapFeedback();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : capsules.length - 1));
  };

  const handleNextCapsule = () => {
    playTapFeedback();
    setSelectedIndex((prev) => (prev < capsules.length - 1 ? prev + 1 : 0));
  };

  if (zenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070913] flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in">
        {/* Top Header Bar in Zen Mode */}
        <div className="flex items-center justify-between z-20">
          <div className="bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-md">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              {e18n.memoryOf(selectedIndex + 1, capsules.length)} • {localized.locationName}
            </span>
            <h2 className="font-serif text-base sm:text-xl font-black text-white">
              {localized.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setZenMode(false)}
            className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 bg-black/85 hover:bg-black px-4 py-2.5 text-xs sm:text-sm font-black text-white cursor-pointer shadow-lg"
          >
            <Minimize2 className="h-4 w-4" />
            <span>{e18n.exitZen}</span>
          </button>
        </div>

        {/* Center 3D Photo Stage (Takes up entire remaining screen height and width) */}
        <div className="flex-1 relative w-full h-full my-2 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
          <Capsule3DScene
            capsule={activeCapsule}
            colorFilter={activeFilter}
            autopilot={autopilot}
            zenMode={true}
            onPointerMove={handleCoordsChange}
            onHotspotActive={handleHotspotHover}
            onHotspotClick={(h) => {
              playHotspotAudioCue(h.soundCue || "chime");
              setFocusedHotspot(h);
            }}
          />

          {focusedHotspot && (
            <div className="absolute top-6 right-6 max-w-xs animate-in fade-in rounded-2xl border-2 border-amber-400 bg-black/90 backdrop-blur-md p-4 text-white shadow-xl z-20">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  {e18n.spotlight}
                </span>
              </div>
              <h4 className="font-serif text-sm font-black text-white">
                {focusedHotspot.label}
              </h4>
              <p className="text-xs font-medium text-amber-100/90 mt-1 leading-relaxed">
                {focusedHotspot.detail}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Floating Navigation & Family Voice Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/85 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 z-20 shadow-xl">
          <p className="font-serif text-sm sm:text-base font-bold text-white/95 italic text-center sm:text-left line-clamp-2 max-w-xl">
            "{localized.voiceNoteText}"
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePlayVoice}
              className={`btn-tactile inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md ${
                voicePlaying
                  ? "border-amber-400 bg-amber-400 text-black animate-pulse"
                  : "border-white/30 bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              <Volume2 className="h-4 w-4" />
              <span>{voicePlaying ? e18n.stopVoice : e18n.hearVoice}</span>
            </button>

            <button
              type="button"
              onClick={handlePrevCapsule}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-xs sm:text-sm font-black text-white cursor-pointer shadow-md"
              aria-label="Previous Memory"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{e18n.prev}</span>
            </button>

            <button
              type="button"
              onClick={handleNextCapsule}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-tea bg-tea hover:bg-tea-dark px-3.5 py-2.5 text-xs sm:text-sm font-black text-white cursor-pointer shadow-md"
              aria-label="Next Memory"
            >
              <span>{e18n.next}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-canvas flex flex-col">
      {/* Top Header */}
      {!zenMode && (
        <header className="bg-white border-b-3 border-black px-4 py-3 text-ink shadow-xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/patient"
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-50 px-3.5 py-2 text-xs sm:text-sm font-black text-ink hover:bg-amber-100 transition-colors cursor-pointer shadow-[2px_2px_0px_#000] whitespace-nowrap shrink-0"
              >
                {e18n.backToRoutine}
              </Link>
              <h1 className="font-serif font-black text-lg md:text-xl text-ink flex items-center gap-2 truncate">
                <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
                <span className="truncate">{e18n.title}</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Loving Messages Keepsake Button */}
              <button
                type="button"
                onClick={() => {
                  playTapFeedback();
                  setIsTimeCapsuleOpen(true);
                }}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-400 hover:bg-amber-500 text-amber-950 px-3.5 py-2 text-xs sm:text-sm font-black cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Open or write loving messages"
              >
                <Heart className="h-4 w-4 fill-amber-950 text-amber-950" />
                <span>{e18n.lovingMessages} ({futureCapsules.length})</span>
              </button>

              {/* Soothing Soundscape master toggle */}
              <button
                type="button"
                onClick={handleToggleSoundscape}
                className={`btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs sm:text-sm font-black transition-colors cursor-pointer shadow-[2px_2px_0px_#000] ${
                  soundscapePlaying
                    ? "border-black bg-emerald-100 text-emerald-950"
                    : "border-black/30 bg-white text-ink-secondary"
                }`}
              >
                {soundscapePlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 text-emerald-800 animate-pulse" />
                    <span>{e18n.soundOn}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-ink-secondary" />
                    <span>{e18n.soundMuted}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Peaceful Theatre Area */}
      <main className={`max-w-5xl mx-auto px-4 pt-4 flex-1 w-full space-y-4 ${zenMode ? "p-2 max-w-none h-full flex flex-col justify-between" : ""}`}>
        {/* Navigation & Memory Title Banner */}
        {!zenMode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-black text-tea-dark uppercase tracking-wider mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-tea-light border border-tea/30">
                  {e18n.memoryOf(selectedIndex + 1, capsules.length)}
                </span>
                <span>•</span>
                <span>{localized.locationName}</span>
                <span>•</span>
                <span className="text-ink-secondary">{localized.seasonOrTime}</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
                {localized.title}
              </h2>
            </div>

            {/* Large Friendly Previous & Next Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handlePrevCapsule}
                className="btn-tactile min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#FAF6F0] hover:bg-amber-100 px-4 py-2 text-xs sm:text-sm font-black text-ink cursor-pointer shadow-[3px_3px_0px_#000]"
                aria-label="Previous Memory"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>{e18n.prev}</span>
              </button>
              <button
                type="button"
                onClick={handleNextCapsule}
                className="btn-tactile min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea hover:bg-tea-dark px-4 py-2 text-xs sm:text-sm font-black text-white cursor-pointer shadow-[3px_3px_0px_#000]"
                aria-label="Next Memory"
              >
                <span>{e18n.next}</span>
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Zen Fullscreen Button */}
              <button
                type="button"
                onClick={() => setZenMode(true)}
                className="btn-tactile min-h-[44px] inline-flex items-center gap-1 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-black text-ink hover:bg-black/5 cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Enter distraction-free Zen mode"
              >
                <Maximize2 className="h-4 w-4 text-tea" />
              </button>
            </div>
          </div>
        )}

        {/* 3D Spatial Memory Canvas Stage (Unobstructed, Clean & Clear Photo View) */}
        <div className={`relative rounded-3xl border-4 border-black bg-slate-950 overflow-hidden shadow-[8px_8px_0px_#000] ${zenMode ? "flex-1 rounded-2xl h-full border-2" : ""}`}>
          <Capsule3DScene
            capsule={activeCapsule}
            colorFilter={activeFilter}
            autopilot={autopilot}
            zenMode={false}
            onPointerMove={handleCoordsChange}
            onHotspotActive={handleHotspotHover}
            onHotspotClick={(h) => {
              playHotspotAudioCue(h.soundCue || "chime");
              setFocusedHotspot(h);
            }}
          />

          {/* Top Right: Zen Exit */}
          {zenMode && (
            <button
              type="button"
              onClick={() => setZenMode(false)}
              className="absolute top-4 right-4 z-20 btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-white/50 bg-black/80 px-4 py-2 text-xs font-black text-white hover:bg-black cursor-pointer shadow-md"
            >
              <Minimize2 className="h-4 w-4" />
              <span>{e18n.exitZen}</span>
            </button>
          )}

          {/* Gentle Hotspot Spotlight popup */}
          {focusedHotspot && (
            <div className="absolute top-6 right-4 max-w-xs animate-in fade-in rounded-2xl border-3 border-amber-400 bg-black/90 backdrop-blur-md p-4 text-white shadow-[4px_4px_0px_#f59e0b] z-20">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  {e18n.spotlight}
                </span>
              </div>
              <h4 className="font-serif text-sm font-black text-white">
                {focusedHotspot.label}
              </h4>
              <p className="text-xs font-medium text-amber-100/90 mt-1 leading-relaxed">
                {focusedHotspot.detail}
              </p>
            </div>
          )}
        </div>

        {/* Unified, Comforting Family Message & Audio Guidance Card */}
        {!zenMode && (
          <div className="rounded-3xl border-3 border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl border-2 border-black bg-amber-100 flex items-center justify-center text-xl font-black text-amber-900 shadow-xs shrink-0">
                  {activeCapsule.familyMemberName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-black text-ink">
                    {e18n.familyMessageFrom(activeCapsule.familyMemberName, activeCapsule.relationship)}
                  </h3>
                  <span className="text-xs font-bold text-ink-secondary">
                    {e18n.reflectionLabel}
                  </span>
                </div>
              </div>

              {/* Prominent Tactile Listen Button */}
              <button
                type="button"
                onClick={handlePlayVoice}
                className={`btn-tactile min-h-[48px] inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-black px-5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-[3px_3px_0px_#000] ${
                  voicePlaying
                    ? "bg-amber-400 text-amber-950 animate-pulse"
                    : "bg-tea text-white hover:bg-tea-dark"
                }`}
              >
                <Volume2 className={`h-4 w-4 ${voicePlaying ? "animate-bounce" : ""}`} />
                <span>{voicePlaying ? e18n.stopVoice : e18n.hearVoice}</span>
              </button>
            </div>

            {/* Clear, High-Contrast Message Body */}
            <div className="rounded-2xl border-2 border-black/15 bg-[#FAF6F0] p-4 sm:p-5">
              <p className="font-serif text-base sm:text-lg font-bold text-ink leading-relaxed italic">
                "{localized.voiceNoteText}"
              </p>
              {localized.reflectionPrompt && (
                <p className="mt-2.5 text-xs sm:text-sm font-semibold text-ink-secondary not-italic border-t border-black/10 pt-2.5">
                  ✨ {localized.reflectionPrompt}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Carousel Thumbnails */}
        {!zenMode && (
          <div className="rounded-2xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000] space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-ink-secondary">
              {e18n.allMemories(capsules.length)}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {capsules.map((cap) => {
                const isActive = cap.id === activeCapsule.id;
                const capLocalized = getLocalizedCapsule(cap, locale);
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      const idx = capsules.findIndex((c) => c.id === cap.id);
                      if (idx !== -1) setSelectedIndex(idx);
                    }}
                    className={`group rounded-xl border-2 overflow-hidden text-left transition-all p-1.5 cursor-pointer ${
                      isActive
                        ? "border-tea bg-tea-light shadow-xs scale-102 ring-2 ring-tea"
                        : "border-black/20 bg-white hover:border-black"
                    }`}
                  >
                    <div className="relative h-16 w-full rounded-lg overflow-hidden bg-slate-900 mb-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cap.photoUrl}
                        alt={capLocalized.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-tea/20 border-2 border-tea rounded-lg pointer-events-none" />
                      )}
                    </div>
                    <span className="text-[11px] font-black text-ink block truncate leading-tight">
                      {capLocalized.title}
                    </span>
                    <span className="text-[9px] font-semibold text-ink-secondary block truncate">
                      {cap.familyMemberName} • {capLocalized.locationName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Discreet Caregiver Drawer Toggle (Kept at bottom away from patient distraction) */}
        {!zenMode && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowCaregiverDrawer((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary hover:text-ink cursor-pointer underline underline-offset-4"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{e18n.caregiverTools}</span>
            </button>
          </div>
        )}

        {/* Collapsible Caregiver & Clinical Drawer */}
        {!zenMode && showCaregiverDrawer && (
          <div className="rounded-3xl border-3 border-black bg-white p-5 shadow-[5px_5px_0px_#000] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-tea" />
                <h3 className="font-serif font-black text-base text-ink">
                  Caregiver Clinical & Neuro-Acoustic Controls
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCaregiverDrawer(false)}
                className="text-xs font-black text-ink-secondary hover:text-ink cursor-pointer"
              >
                Close Drawer ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* 40Hz Gamma / 10Hz Alpha Neuro-Acoustics */}
              <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-amber-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                    <Headphones className="h-4 w-4" />
                    <span>Neuro-Acoustic Beats</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-semibold">
                    40Hz Gamma promotes microglia activation & working memory; 10Hz Alpha calms agitation.
                  </p>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleBinauralToggle("gamma")}
                    className={`flex-1 py-1.5 rounded-xl border-2 text-center font-black cursor-pointer ${
                      binauralMode === "gamma"
                        ? "border-black bg-amber-800 text-white"
                        : "border-black/30 bg-white text-ink"
                    }`}
                  >
                    40Hz Gamma
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBinauralToggle("alpha")}
                    className={`flex-1 py-1.5 rounded-xl border-2 text-center font-black cursor-pointer ${
                      binauralMode === "alpha"
                        ? "border-black bg-emerald-800 text-white"
                        : "border-black/30 bg-white text-ink"
                    }`}
                  >
                    10Hz Alpha
                  </button>
                </div>
              </div>

              {/* Autopilot Ken Burns Memory Cruise */}
              <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-amber-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                    <Compass className="h-4 w-4" />
                    <span>Autopilot Drift</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-semibold">
                    Cinematic slow camera panning visiting hotspots without requiring touch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutopilot((a) => !a)}
                  className={`mt-2.5 w-full py-1.5 rounded-xl border-2 text-center font-black cursor-pointer ${
                    autopilot
                      ? "border-black bg-amber-400 text-amber-950"
                      : "border-black/30 bg-white text-ink"
                  }`}
                >
                  {autopilot ? "Autopilot Active ✓" : "Enable Autopilot"}
                </button>
              </div>

              {/* Webcam Head Tracker */}
              <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-amber-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                    <Eye className="h-4 w-4" />
                    <span>Webcam Gaze Tracking</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-semibold">
                    Hands-free parallax navigation via subtle head movement.
                  </p>
                </div>
                <div className="mt-2.5">
                  <WebcamHeadTracker
                    active={webcamEnabled}
                    onToggleActive={() => setWebcamEnabled((prev) => !prev)}
                    onCoordsChange={handleCoordsChange}
                    sensitivity={sensitivity}
                    onSensitivityChange={setSensitivity}
                  />
                </div>
              </div>
            </div>

            {/* Quick Emotional Response Logger */}
            <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-black text-emerald-950 block">Caregiver Reaction Log</span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Record patient's response to monitor wellbeing trends.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "joyful", label: "Smiled / Joyful", emoji: "😊" },
                  { key: "calm", label: "Calm & Relaxed", emoji: "🌿" },
                  { key: "nostalgic", label: "Recollected", emoji: "💭" },
                  { key: "verbal", label: "Spoke Name", emoji: "🗣️" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleLogObservation(item.key as any)}
                    className={`rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black cursor-pointer transition-all ${
                      loggedFeedback === item.key
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-ink hover:bg-emerald-100"
                    }`}
                  >
                    <span className="mr-1">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Future Time Capsule Modal */}
      <FutureTimeCapsuleModal
        patientId={patientId || 2}
        patientName={patientName}
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
        langCode={locale}
      />
    </div>
  );
}
