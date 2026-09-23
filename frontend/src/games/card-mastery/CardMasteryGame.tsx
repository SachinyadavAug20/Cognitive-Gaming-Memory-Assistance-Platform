"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  Volume2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  ChevronRight,
  Eye,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import {
  playCorrect,
  playComplete,
  playPress,
  playError,
  speakText,
} from "@/lib/sound";
import { useAuthStore } from "@/store/useAuthStore";
import { recordGameSession } from "@/lib/telemetry";
import {
  type PlayingCard,
  type CardSuit,
  type CardRank,
  FULL_DECK_54,
  shuffleCards,
  getCardName,
  getSuitName,
  getRankName,
  COLORS_LOCALIZED,
  SUITS_LOCALIZED,
  getCleanLocale,
} from "./cardData";

// Level titles and instructions across 11 languages
const LEVEL_INSTRUCTIONS: Record<
  number,
  Record<string, { name: string; instruction: string; promptTts: string }>
> = {
  1: {
    en: {
      name: "1. Card Identifying",
      instruction: "Tap the requested card from the cards shown below.",
      promptTts: "Find and tap the {cardName}.",
    },
    as: {
      name: "১. কাৰ্ড চিনাক্তকৰণ",
      instruction: "তলৰ কাৰ্ডকেইখনৰ পৰা বিচৰা কাৰ্ডখন বাছক।",
      promptTts: "{cardName} খন বিচাৰি চুই দিয়ক।",
    },
    hi: {
      name: "१. ताश पहचान",
      instruction: "नीचे दिखाए गए पत्तों में से पूछा गया पत्ता चुनें।",
      promptTts: "{cardName} को पहचानकर उस पर छुएं।",
    },
    bn: {
      name: "১. তাস সনাক্তকরণ",
      instruction: "নিচের তাসগুলির মধ্য থেকে নির্দেশিত তাসটি বেছে নিন।",
      promptTts: "{cardName} তাসটি খুঁজে স্পর্শ করুন।",
    },
    mr: {
      name: "१. पत्ता ओळख",
      instruction: "खाली दाखवलेल्या पत्त्यांमधून विचारलेला पत्ता निवडा.",
      promptTts: "{cardName} ओळखून त्यावर स्पर्श करा.",
    },
    ne: {
      name: "१. तास पहिचान",
      instruction: "तल देखाइएका तासहरूमध्ये सोधिएको तास छान्नुहोस्।",
      promptTts: "{cardName} पत्ता लगाएर छुनुहोस्।",
    },
    mni: {
      name: "১. কাৰ্ড শক্তাকপা",
      instruction: "মখাদা পীরিবা কাৰ্ডশিংদগী হংলিবা কাৰ্ডদু খনবীযু।",
      promptTts: "{cardName} খনবীদুনা থুম্মী।",
    },
    brx: {
      name: "१. थास सिनायथि",
      instruction: "गाहायाव दिन्थिनाय थासफोरनि गेजेराव सोंनाय थासखौ सायख'।",
      promptTts: "{cardName} खौ नागिरनानै थु।",
    },
    grt: {
      name: "1. Card U·iani",
      instruction: "Ka·mao nengniko card-ko sandibo.",
      promptTts: "{cardName}-ko sandibo.",
    },
    kha: {
      name: "1. Jingithuh Taas",
      instruction: "Jied ia ka taas ba la pan harum.",
      promptTts: "Wad ia ka {cardName}.",
    },
    lus: {
      name: "1. Card Hriatfiahna",
      instruction: "A hnuaia card an zawh che hi zawng chhuak rawh.",
      promptTts: "{cardName} hi zawng rawh le.",
    },
  },
  2: {
    en: {
      name: "2. Card Memorizing",
      instruction: "Remember where each card is placed before they flip over.",
      promptTts: "Remember these cards carefully. Where is the {cardName}?",
    },
    as: {
      name: "২. তাশ স্মৃতি",
      instruction: "কাৰ্ডবোৰ ওলোটাই দিয়াৰ আগতে কোনখন ক'ত আছে মনত ৰাখক।",
      promptTts: "কাৰ্ডকেইখন মনত ৰাখক। {cardName} ক'ত আছে বাছক?",
    },
    hi: {
      name: "२. ताश स्मरण",
      instruction: "पत्तों के पलटने से पहले ध्यान से याद रखें कि कौन सा पत्ता कहाँ है।",
      promptTts: "इन पत्तों को ध्यान से देखें। {cardName} कहाँ छुपा है?",
    },
    bn: {
      name: "২. তাস স্মরণ",
      instruction: "তাসগুলি উল্টে যাওয়ার আগে কোন তাসটি কোথায় আছে মনে রাখুন।",
      promptTts: "তাসগুলি মনে রাখুন। {cardName} কোন স্থানে আছে?",
    },
    mr: {
      name: "२. पत्ते स्मरण",
      instruction: "पत्ते उलटे होण्यापूर्वी कोणता पत्ता कुठे आहे हे लक्षात ठेवा.",
      promptTts: "हे पत्ते नीट लक्षात ठेवा. {cardName} कुठे आहे?",
    },
    ne: {
      name: "२. तास स्मरण",
      instruction: "तासहरू फर्काउनु अघि कुन तास कहाँ छ सम्झनुहोस्।",
      promptTts: "यी तासहरू ध्यान दिएर हेर्नुहोस्। {cardName} कहाँ छ?",
    },
    mni: {
      name: "২. কাৰ্ড নীংশিংবা",
      instruction: "কাৰ্ডশিং ওনথোকত্রিঙৈদা কদাইদা লৈবগে নীংশিংবীযু।",
      promptTts: "কাৰ্ডশিং অসি নীংশিংবীযু। {cardName} কদাইদা লৈবগে?",
    },
    brx: {
      name: "२. थास गोसोआव लाखिनाय",
      instruction: "थासफोरखौ उल्था खालामनायनि सिगां बबेयाव दं गोसोआव लाखि।",
      promptTts: "बे थासफोरखौ गोसोआव लाखि। {cardName} बबेयाव दं?",
    },
    grt: {
      name: "2. Card Gisik Ra·ani",
      instruction: "Card-rangko dingtangattokna skang gisik ra·bo.",
      promptTts: "Card-rangko gisik ra·bo. {cardName} bano donga?",
    },
    kha: {
      name: "2. Jingkynmaw Taas",
      instruction: "Kynmaw ia ki jaka shwa ba kin kylla khongpong.",
      promptTts: "Kynmaw ia kine ki taas. Hangno ka {cardName}?",
    },
    lus: {
      name: "2. Card Hriatrengna",
      instruction: "An lehthal hmain khawi hmunah nge an awm tih hre reng rawh.",
      promptTts: "Heng card-te hi hre reng rawh. {cardName} hi khawiah nge a awm?",
    },
  },
  3: {
    en: {
      name: "3. Sequencing & Predicting",
      instruction: "Look at the sequence and pick the card that comes next.",
      promptTts: "Which card comes next in this sequence?",
    },
    as: {
      name: "৩. ক্ৰম আৰু পূৰ্বানুমান",
      instruction: "কাৰ্ডৰ ক্ৰমটো চাওক আৰু পিছত কি কাৰ্ড আহিব বাছক।",
      promptTts: "এই ক্ৰমটোত পিছত কোনখন কাৰ্ড আহিব?",
    },
    hi: {
      name: "३. क्रम और भविष्यवाणी",
      instruction: "पत्तों के क्रम को देखें और अगला पत्ता पहचानें।",
      promptTts: "इस क्रम में अगला पत्ता कौन सा आएगा?",
    },
    bn: {
      name: "৩. ক্রম ও পূর্বাভাস",
      instruction: "তাসের ধারা লক্ষ্য করে পরবর্তী সঠিক তাসটি নির্বাচন করুন।",
      promptTts: "এই অনুক্রমে এর পরের তাসটি কোনটি হবে?",
    },
    mr: {
      name: "३. क्रमवारी व अंदाज",
      instruction: "पत्त्यांचा क्रम पहा आणि पुढचा येणारा पत्ता ओळखा.",
      promptTts: "या क्रमाने येणारा पुढचा पत्ता कोणता असेल?",
    },
    ne: {
      name: "३. क्रम र अनुमान",
      instruction: "तासको क्रम हेरेर त्यसपछिको सही तास छान्नुहोस्।",
      promptTts: "यस क्रममा अर्को तास कुन आउनेछ?",
    },
    mni: {
      name: "৩. পরিং অমসুং ৱাফম",
      instruction: "কাৰ্ডকী পরিং য়েংবীদুনা মথংদা লাক্কদবা কাৰ্ড খনবীযু।",
      promptTts: "পরিং অসিদা তুংদা লাক্কদবা কাৰ্ড করি ওইগনি?",
    },
    brx: {
      name: "३. फारि आरो फोमायनाय",
      instruction: "थासनि फारिखौ नायनानै उननि थासखौ सायख'।",
      promptTts: "बे फारियाव उननि थासा मा जागोन?",
    },
    grt: {
      name: "3. Sulsul Donani",
      instruction: "Card-ni sulsul ong·ako nina ja·mano re·bagipako sandibo.",
      promptTts: "Iani ja·mano badia card ong·gen?",
    },
    kha: {
      name: "3. Kaba Bud Ryntih",
      instruction: "Peit ia ka rukom bud ryntih bad jied ia kaba bud.",
      promptTts: "Kaei ka taas ban wan bud ha kane?",
    },
    lus: {
      name: "3. Inrem Dan & Hriatlawk",
      instruction: "Card indawt dan hi en la, a dawt leh tur chu thlang rawh.",
      promptTts: "A dawttu tur card hi eng nge ni ang?",
    },
  },
  4: {
    en: {
      name: "4. Pattern Recognition",
      instruction: "Analyze the alternating pattern of suits/colors to find the missing card.",
      promptTts: "Observe the pattern and pick the matching card.",
    },
    as: {
      name: "৪. প্যাটাৰ্ন নিৰ্ণয়",
      instruction: "ৰং বা চিহ্নৰ সলনি হোৱা আৰ্হি লক্ষ্য কৰি সঠিক কাৰ্ড বাছক।",
      promptTts: "কাৰ্ডৰ আৰ্হিটো মন কৰক আৰু মিলা কাৰ্ডখন বাছক।",
    },
    hi: {
      name: "४. पैटर्न पहचान",
      instruction: "रंग और चिह्नों के बदलते पैटर्न को देखकर छूटा हुआ पत्ता बताएं।",
      promptTts: "पैटर्न को ध्यान से देखें और सही पत्ता चुनें।",
    },
    bn: {
      name: "৪. প্যাটার্ন সনাক্তকরণ",
      instruction: "রঙ বা প্রতীকের পর্যায়ক্রম দেখে সঠিক তাসটি পূরণ করুন।",
      promptTts: "প্যাটার্নটি লক্ষ্য করুন এবং সঠিক তাসটি বেছে নিন।",
    },
    mr: {
      name: "४. पॅटर्न ओळख",
      instruction: "रंग व चिन्हांच्या पॅटर्नचा नियम ओळखा आणि गाळलेला पत्ता भरा.",
      promptTts: "पॅटर्न नीट पहा आणि जुळणारा पत्ता निवडा.",
    },
    ne: {
      name: "४. ढाँचा पहिचान",
      instruction: "रङ्ग र प्रतीकको ढाँचा हेरेर सही तास छान्नुहोस्।",
      promptTts: "ढाँचा ध्यान दिएर हेर्नुहोस् र मिल्दो तास छान्नुहोस्।",
    },
    mni: {
      name: "৪. প্যাটার্ন খঙদোকপা",
      instruction: "মচু নত্ত্রগা শক্তমগী প্যাটার্ন য়েংবীদুনা কাৰ্ড খনবীযু।",
      promptTts: "প্যাটার্নদু য়েংবীদুনা চান্নবা কাৰ্ড খনবীযু।",
    },
    brx: {
      name: "४. नेरसोन सिनायथि",
      instruction: "गाब आरो सिननि सोलायनाय नेरसोनखौ नायनानै सायख'।",
      promptTts: "नेरसोनखौ नाय आरो गोरोबनाय थास सायख'।",
    },
    grt: {
      name: "4. Pattern U·iani",
      instruction: "Rong ba rokomni dingtang dingtang ong·ako nina matchotatbo.",
      promptTts: "Pattern-ko nina matchotatbo.",
    },
    kha: {
      name: "4. Ka Dur Bymkylla",
      instruction: "Peit ia ka rukom buh pynbeit bad pyndep ia ka.",
      promptTts: "Peit ia ka pattern bad jied ia ka taas.",
    },
    lus: {
      name: "4. Pattern Hriatna",
      instruction: "Card inrem dan en la, a kimlo hi dah khat rawh.",
      promptTts: "Pattern hi en la, a milpui thlang rawh.",
    },
  },
  5: {
    en: {
      name: "5. Card Sorting",
      instruction: "Tap the cards in order from Smallest to Largest value.",
      promptTts: "Tap the cards in order from smallest to largest.",
    },
    as: {
      name: "৫. তাশ সজোৱা",
      instruction: "সকলোতকৈ সৰু কাৰ্ডখনৰ পৰা আৰম্ভ কৰি ক্ৰমান্বয়ে ডাঙৰলৈ চুই দিয়ক।",
      promptTts: "সৰুৰ পৰা ডাঙৰ ক্ৰমত কাৰ্ডবোৰ চুই সজাওক।",
    },
    hi: {
      name: "५. ताश क्रमबद्ध करना",
      instruction: "पत्तों को सबसे छोटे मान से शुरू करके बड़े मान के क्रम में छुएं।",
      promptTts: "पत्तों को छोटे से बड़े क्रम में छूकर लगाएं।",
    },
    bn: {
      name: "৫. তাস সাজানো",
      instruction: "ছোট থেকে বড় ক্রমানুসারে একের পর এক তাসে স্পর্শ করুন।",
      promptTts: "ছোট থেকে বড় ক্রমানুসারে তাস স্পর্শ করুন।",
    },
    mr: {
      name: "५. पत्ते चढत्या क्रमाने लावणे",
      instruction: "लहान मूल्यापासून सुरू करून मोठ्या मूल्यापर्यंत पत्ते क्रमाने स्पर्श करा.",
      promptTts: "लहान ते मोठ्या क्रमाने पत्ते स्पर्श करा.",
    },
    ne: {
      name: "५. तास मिलाउने",
      instruction: "सबैभन्दा सानोबाट सुरु गरेर ठूलो मानको क्रममा तासहरू छुनुहोस्।",
      promptTts: "सानो देखि ठूलो क्रममा तासहरू छुनुहोस्।",
    },
    mni: {
      name: "৫. কাৰ্ড পরিং শেম্বা",
      instruction: "খ্বাইদগী অপিকপাদগী হৌরগা অচৌবা ফাওবা কাৰ্ডশিং থুম্মী।",
      promptTts: "অপিকপাদগী অচৌবা ফাওবা পরিং চেলহল্লু।",
    },
    brx: {
      name: "५. थास साजायनाय",
      instruction: "फिसाफ्राय जागायनानै देरसिन फारियाव थासखौ थु।",
      promptTts: "फिसाफ्राय देरसिन फारियाव थासखौ थु।",
    },
    grt: {
      name: "5. Card-rangko Sulsul Donani",
      instruction: "Chonbatagipani niken dal·batagipao tap ka·bo.",
      promptTts: "Chonbatagipani niken dal·batagipao tap ka·bo.",
    },
    kha: {
      name: "5. Buh Ryntih Ia Ki Taas",
      instruction: "Shu ktah ia ki taas na kaba rit tam sha kaba heh tam.",
      promptTts: "Ktah ia ki taas na kaba rit sha kaba heh.",
    },
    lus: {
      name: "5. Card Remfelna",
      instruction: "A te ber atanga a lian ber thlengin indawt chhoin hmet rawh.",
      promptTts: "A te ber atanga a lian ber thlengin hmet rawh le.",
    },
  },
  6: {
    en: {
      name: "6. Card Grouping & Classification",
      instruction: "Classify and place the card into the matching basket.",
      promptTts: "Put this card into its matching basket.",
    },
    as: {
      name: "৬. শ্ৰেণীবিভাজন ও গোট",
      instruction: "কাৰ্ডখন লক্ষ্য কৰি মিল থকা পাত্ৰটো চুই তাৰ ভিতৰত ভৰাওক।",
      promptTts: "কাৰ্ডখন উপযুক্ত পাত্ৰত ভৰাওক।",
    },
    hi: {
      name: "६. ताश वर्गीकरण एवं समूह",
      instruction: "दिखाए गए पत्ते को उसके सही समूह या रंग की टोकरी में रखें।",
      promptTts: "इस पत्ते को सही टोकरी में रखें।",
    },
    bn: {
      name: "৬. তাস শ্রেণীবিভাগ",
      instruction: "তাসটি লক্ষ্য করে সঠিক শ্রেণী বা রঙের ঝুড়িতে রাখুন।",
      promptTts: "তাসটি সঠিক ঝুড়িতে রাখুন।",
    },
    mr: {
      name: "६. पत्ते वर्गीकरण",
      instruction: "पत्ता पाहून योग्य गट किंवा रंगाच्या पेटीत टाका.",
      promptTts: "हा पत्ता योग्य पेटीत ठेवा.",
    },
    ne: {
      name: "६. तास वर्गीकरण",
      instruction: "तास हेरेर मिल्दो समूह वा रङ्गको टोकरीमा राख्नुहोस्।",
      promptTts: "यस तासलाई सही टोकरीमा हाल्नुहोस्।",
    },
    mni: {
      name: "৬. কাৰ্ড খাইদোকপা",
      instruction: "কাৰ্ডদু য়েংবীদুনা চান্নবা কাংলূপতা থম্মীয়ু।",
      promptTts: "কাৰ্ড অসি চান্নবা খৌদা থম্মীয়ু।",
    },
    brx: {
      name: "६. थास राननाय",
      instruction: "थासखौ नायनानै गावनि गोरोबनाय दुलारायाव दोन।",
      promptTts: "बे थासखौ गोरोबनाय थुख्रायाव दोन।",
    },
    grt: {
      name: "6. Card-rangko Tok Donani",
      instruction: "Card-ko nina nambata bakso-ona donbo.",
      promptTts: "Card-ko nambata bakso-ona donbo.",
    },
    kha: {
      name: "6. Pynbynta Ia Ki Taas",
      instruction: "Buh ia ka taas sha ka shang kaba iahap.",
      promptTts: "Buh ia kane ka taas sha ka shang kaba dei.",
    },
    lus: {
      name: "6. Card Thliarhranna",
      instruction: "Card hi a milpui bawmah thun rawh.",
      promptTts: "He card hi a milpui bawmah dah rawh.",
    },
  },
  7: {
    en: {
      name: "7. Flash Card Memory",
      instruction: "Watch the card carefully for 3 seconds, then recall its details.",
      promptTts: "Look carefully at this card. Remember it before it disappears.",
    },
    as: {
      name: "৭. দেখা আৰু মনত ৰখা",
      instruction: "কাৰ্ডখন ৩ চেকেণ্ড মনপুতি চাওক, তাৰ পিছত তাৰ সংখ্যা আৰু ৰূপ কওক।",
      promptTts: "কাৰ্ডখন মনপুতি চাওক। কাৰ্ডখন নোহোৱা হোৱাৰ আগতে মনত ৰাখক।",
    },
    hi: {
      name: "७. देखो और याद रखो",
      instruction: "पत्ते को 3 सेकंड ध्यान से देखें, फिर उसका नंबर और चिह्न बताएं।",
      promptTts: "इस पत्ते को ध्यान से देखें। छुपने से पहले इसे याद कर लें।",
    },
    bn: {
      name: "৭. দেখা ও মনে রাখা",
      instruction: "তাসটি ৩ সেকেন্ড মনোযোগ দিয়ে দেখুন, তারপর এর মান ও প্রতীক বলুন।",
      promptTts: "তাসটি মনোযোগ দিয়ে লক্ষ্য করুন। অদৃশ্য হওয়ার আগে মনে রাখুন।",
    },
    mr: {
      name: "७. पहा आणि लक्षात ठेवा",
      instruction: "३ सेकंद पत्ता लक्षपूर्वक पहा, मग त्याचा अंक व चिन्ह सांगा.",
      promptTts: "हा पत्ता नीट पहा. अदृश्य होण्यापूर्वी लक्षात ठेवा.",
    },
    ne: {
      name: "७. हेर्नुहोस् र सम्झनुहोस्",
      instruction: "तास ३ सेकेन्ड ध्यान दिएर हेर्नुहोस्, त्यसपछि त्यसको अङ्क र प्रकार सम्झनुहोस्।",
      promptTts: "तास ध्यान दिएर हेर्नुहोस्। हराउनु अघि सम्झनुहोस्।",
    },
    mni: {
      name: "৭. য়েংদুনা নীংশিংবা",
      instruction: "কাৰ্ডদু সেকেন্দ ৩ কুপ্না য়েংবীযু, অদুগা মশিং অমসুং শক্তমদু নীংশিংবীযু।",
      promptTts: "কাৰ্ডদু কুপ্না য়েংবীযু। মাংদ্রিঙৈদা নীংশিংবীযু।",
    },
    brx: {
      name: "७. नाय आरो गोसोआव लाखि",
      instruction: "थासखौ ३ सेकेन्द मोजाङै नाय, बेनि उनाव अनजिमा आरो रोखोमखौ गोसोआव लाखि।",
      promptTts: "थासखौ मोजाङै नाय। गामोनि सिगां गोसोआव लाखि।",
    },
    grt: {
      name: "7. Nibo Aro Gisik Ra·bo",
      instruction: "Card-ko second 3 name nibo, ja·mano nambata aro rokomko aganbo.",
      promptTts: "Card-ko name nibo. Gimaatna skang gisik ra·bo.",
    },
    kha: {
      name: "7. Peit Bad Kynmaw",
      instruction: "Peit bniah ia ka taas 3 sekhon, nangta kynmaw ia ka dak bad ka dur.",
      promptTts: "Peit bniah ia kane ka taas shwa ba kan jah.",
    },
    lus: {
      name: "7. En La Hre Reng Rawh",
      instruction: "Card hi second 3 ngun takin en la, a bo hmain hre reng rawh.",
      promptTts: "Card hi ngun takin en rawh. A bo hmain vawng reng rawh.",
    },
  },
  8: {
    en: {
      name: "8. Card Reasoning & Discrimination",
      instruction: "Use cognitive reasoning to find the odd card, highest card, or Joker.",
      promptTts: "Select the correct card based on the question.",
    },
    as: {
      name: "৮. বুদ্ধি আৰু নিৰ্বাচন",
      instruction: "যুক্তিসংগতভাৱে বেলেগ কাৰ্ড, ডাঙৰ কাৰ্ড বা বিশেষ জোকাৰ বাছক।",
      promptTts: "প্ৰশ্নটো বুজি শুদ্ধ কাৰ্ডখন বাছক।",
    },
    hi: {
      name: "८. तार्किक चयन एवं भेद",
      instruction: "तर्क लगाकर सबसे अलग पत्ता, सबसे बड़ा पत्ता या जोकर चुनें।",
      promptTts: "प्रश्न के अनुसार सही पत्ता चुनें।",
    },
    bn: {
      name: "৮. যৌক্তিক নির্বাচন",
      instruction: "যুক্তি প্রয়োগ করে বেমানান তাস, সর্বোচ্চ তাস বা জোকার শনাক্ত করুন।",
      promptTts: "প্রশ্ন অনুযায়ী সঠিক তাসটি বেছে নিন।",
    },
    mr: {
      name: "८. तार्किक निवड",
      instruction: "तर्क लावून वेगळा पत्ता, सर्वात मोठा पत्ता किंवा जोकर ओळखा.",
      promptTts: "प्रश्नानुसार योग्य पत्ता निवडा.",
    },
    ne: {
      name: "८. तार्किक छनोट",
      instruction: "तर्क लगाएर सबैभन्दा फरक तास, सबैभन्दा ठूलो तास वा जोकर छान्नुहोस्।",
      promptTts: "प्रश्न अनुसार सही तास छान्नुहोस्।",
    },
    mni: {
      name: "৮. ৱাখলগী খনগৎপা",
      instruction: "ৱাখল খল্লগা তোঙানবা কাৰ্ড, খ্বাইদগী চাউবা কাৰ্ড নত্ত্রগা জোকার খনবীযু।",
      promptTts: "ৱাহং অদু খঙদুনা চুম্বা কাৰ্ড খনবীযু।",
    },
    brx: {
      name: "८. गियान सायख'नाय",
      instruction: "साननायजों आलादा थास, देरसिन थास एबा जोकारखौ सायख'।",
      promptTts: "सोंनाय बादियै थार थासखौ सायख'।",
    },
    grt: {
      name: "8. U·iani Sandiani",
      instruction: "Chanchiani bilchi dingtangmanchagipa card, dal·batsranggipa card ba Joker-ko sandibo.",
      promptTts: "Sing·ani gita thikgipa card-ko sandibo.",
    },
    kha: {
      name: "8. Ka Jingbishar Taas",
      instruction: "Pyndonkam ia ka jingpyrkhat ban wad ia ka taas bym iahap ne kaba heh tam.",
      promptTts: "Jied ia ka taas katkum ka jingkylli.",
    },
    lus: {
      name: "8. Ngaihtuahna Hmanga Thlanna",
      instruction: "A danglam bik, a hlu ber, emaw Joker zawng chhuak rawh.",
      promptTts: "Zawhna mil hian card dik thlang rawh.",
    },
  },
};

// Tactile Neo-Brutalist Playing Card Visual Component
export function PlayingCardVisual({
  card,
  isFaceUp = true,
  onClick,
  isSelected = false,
  isHighlighted = false,
  size = "md",
  disabled = false,
}: {
  card: PlayingCard;
  isFaceUp?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const isRed = card.color === "red";
  const textColor = isRed ? "text-red-600" : "text-slate-900";
  const borderColor = isSelected
    ? "border-amber-500 ring-4 ring-amber-300"
    : isHighlighted
    ? "border-emerald-500 ring-4 ring-emerald-300 animate-pulse"
    : "border-black";

  const sizeClasses = {
    sm: "w-16 h-24 text-xs rounded-xl shadow-[3px_3px_0px_#000]",
    md: "w-24 h-36 sm:w-28 sm:h-40 text-base rounded-2xl shadow-[4px_4px_0px_#000]",
    lg: "w-32 h-48 sm:w-36 sm:h-52 text-lg rounded-2xl shadow-[5px_5px_0px_#000]",
  }[size];

  if (!isFaceUp) {
    // Traditional ornate patterned Card Back (Red & Gold lattice)
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Hidden Playing Card"
        className={`btn-tactile relative flex shrink-0 items-center justify-center border-3 ${borderColor} bg-gradient-to-br from-red-800 via-red-700 to-amber-950 p-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 overflow-hidden ${sizeClasses}`}
      >
        <div className="absolute inset-1.5 rounded-lg border-2 border-amber-300/60 bg-red-900/80 flex items-center justify-center">
          <div className="w-full h-full opacity-30 bg-[radial-gradient(#FDE047_1.5px,transparent_1.5px)] [background-size:8px_8px]" />
          <span className="absolute text-xl sm:text-2xl text-amber-300 font-serif font-black">
            ⚜
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${card.rank} of ${card.suit}`}
      className={`btn-tactile relative flex shrink-0 flex-col justify-between border-3 ${borderColor} bg-white p-2.5 sm:p-3 select-none transition-all hover:scale-105 active:scale-95 cursor-pointer ${sizeClasses}`}
    >
      {/* Top Left pip */}
      <div className={`flex flex-col items-center leading-none ${textColor}`}>
        <span className="font-serif font-black text-sm sm:text-base">
          {card.isJoker ? "★" : card.rank}
        </span>
        <span className="text-xs sm:text-sm font-bold">{card.symbol}</span>
      </div>

      {/* Center artwork / large emblem */}
      <div className="flex flex-col items-center justify-center my-auto">
        {card.isJoker ? (
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl">🃏</span>
            <span
              className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${textColor}`}
            >
              JOKER
            </span>
          </div>
        ) : card.rank === "J" || card.rank === "Q" || card.rank === "K" ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl">
              {card.rank === "K" ? "🤴" : card.rank === "Q" ? "👸" : "💂"}
            </span>
            <span className={`text-xl sm:text-2xl ${textColor} font-serif font-bold`}>
              {card.symbol}
            </span>
          </div>
        ) : (
          <span className={`text-3xl sm:text-4xl ${textColor}`}>
            {card.symbol}
          </span>
        )}
      </div>

      {/* Bottom Right inverted pip */}
      <div
        className={`flex flex-col items-center leading-none ${textColor} rotate-180 self-end`}
      >
        <span className="font-serif font-black text-sm sm:text-base">
          {card.isJoker ? "★" : card.rank}
        </span>
        <span className="text-xs sm:text-sm font-bold">{card.symbol}</span>
      </div>
    </button>
  );
}

export function CardMasteryGame() {
  const locale = useLocale();
  const cl = getCleanLocale(locale);
  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 2;

  // Active level state (1 to 8)
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [sessionStartTime] = useState<string>(() => new Date().toISOString());

  // Errorless hint and feedback state
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintText, setHintText] = useState<string>("");

  // Level 1 State: Card Identifying
  const [l1Target, setL1Target] = useState<PlayingCard | null>(null);
  const [l1Choices, setL1Choices] = useState<PlayingCard[]>([]);

  // Level 2 State: Card Memorizing (Working Memory)
  const [l2Cards, setL2Cards] = useState<PlayingCard[]>([]);
  const [l2Flipped, setL2Flipped] = useState<boolean>(false);
  const [l2Target, setL2Target] = useState<PlayingCard | null>(null);
  const [l2Countdown, setL2Countdown] = useState<number>(4);

  // Level 3 State: Sequencing & Predicting
  const [l3Sequence, setL3Sequence] = useState<PlayingCard[]>([]);
  const [l3TargetNext, setL3TargetNext] = useState<PlayingCard | null>(null);
  const [l3Choices, setL3Choices] = useState<PlayingCard[]>([]);

  // Level 4 State: Pattern Recognition
  const [l4Pattern, setL4Pattern] = useState<PlayingCard[]>([]);
  const [l4MissingCard, setL4MissingCard] = useState<PlayingCard | null>(null);
  const [l4Choices, setL4Choices] = useState<PlayingCard[]>([]);

  // Level 5 State: Card Sorting (Smallest to Largest)
  const [l5Hand, setL5Hand] = useState<PlayingCard[]>([]);
  const [l5Sorted, setL5Sorted] = useState<PlayingCard[]>([]);
  const [l5CorrectOrder, setL5CorrectOrder] = useState<PlayingCard[]>([]);

  // Level 6 State: Card Classification (Suit, Color, or Face vs Number)
  const [l6Mode, setL6Mode] = useState<"suit" | "color" | "face_number">("suit");
  const [l6CurrentCard, setL6CurrentCard] = useState<PlayingCard | null>(null);
  const [l6RemainingCards, setL6RemainingCards] = useState<PlayingCard[]>([]);
  const [l6SortedCount, setL6SortedCount] = useState<number>(0);

  // Level 7 State: Flash Card Recall (Number -> Number + Suit)
  const [l7Card, setL7Card] = useState<PlayingCard | null>(null);
  const [l7Phase, setL7Phase] = useState<"preview" | "ask_number" | "ask_both">("preview");
  const [l7SubStage, setL7SubStage] = useState<"A" | "B">("A");
  const [l7Options, setL7Options] = useState<string[]>([]);
  const [l7CorrectOption, setL7CorrectOption] = useState<string>("");

  // Level 8 State: Cognitive Reasoning (Odd One Out, Highest Card, Find Joker)
  const [l8ChallengeType, setL8ChallengeType] = useState<"odd_one_out" | "highest" | "find_joker">("odd_one_out");
  const [l8Cards, setL8Cards] = useState<PlayingCard[]>([]);
  const [l8CorrectCard, setL8CorrectCard] = useState<PlayingCard | null>(null);
  const [l8QuestionPrompt, setL8QuestionPrompt] = useState<string>("");

  // Audio helper
  const handleSpeak = useCallback(
    (text: string) => {
      speakText(text, cl, 0.85);
    },
    [cl]
  );

  // Setup Level 1
  const initLevel1 = useCallback(() => {
    const shuffled = shuffleCards(FULL_DECK_54);
    const target = shuffled[0];
    // Pick 3 distractors
    const distractors = shuffled.slice(1, 4);
    const choices = shuffleCards([target, ...distractors]);
    setL1Target(target);
    setL1Choices(choices);
    setFeedback(null);
    setShowHint(false);
  }, []);

  // Setup Level 2
  const initLevel2 = useCallback(() => {
    const shuffled = shuffleCards(FULL_DECK_54.filter((c) => !c.isJoker));
    const cards = shuffled.slice(0, 3);
    const target = cards[Math.floor(Math.random() * cards.length)];
    setL2Cards(cards);
    setL2Target(target);
    setL2Flipped(false);
    setL2Countdown(4);
    setFeedback(null);
    setShowHint(false);
  }, []);

  // Level 2 Timer for countdown
  useEffect(() => {
    if (currentLevel !== 2 || l2Flipped) return;
    if (l2Countdown > 0) {
      const timer = setTimeout(() => {
        setL2Countdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setL2Flipped(true);
    }
  }, [currentLevel, l2Flipped, l2Countdown]);

  // Setup Level 3: Sequencing (e.g. 5, 6, 7 -> 8; or 9, 10, J -> Q)
  const initLevel3 = useCallback(() => {
    const suits: CardSuit[] = ["spades", "hearts", "diamonds", "clubs"];
    const chosenSuit = suits[Math.floor(Math.random() * suits.length)];
    const suitCards = FULL_DECK_54.filter((c) => c.suit === chosenSuit && !c.isJoker);
    // choose a starting index between 0 and 9
    const startIdx = Math.floor(Math.random() * 9);
    const seq = suitCards.slice(startIdx, startIdx + 3);
    const targetNext = suitCards[startIdx + 3];

    // Pick 2 distractors from same suit or other suits
    const otherCards = FULL_DECK_54.filter(
      (c) => c.id !== targetNext.id && !seq.some((s) => s.id === c.id)
    );
    const distractors = shuffleCards(otherCards).slice(0, 2);
    const choices = shuffleCards([targetNext, ...distractors]);

    setL3Sequence(seq);
    setL3TargetNext(targetNext);
    setL3Choices(choices);
    setFeedback(null);
    setShowHint(false);
  }, []);

  // Setup Level 4: Patterns
  // Pattern 1: Red, Black, Red, [ ? ]
  // Pattern 2: Spade, Heart, Spade, [ ? ]
  // Pattern 3: 2, 4, 6, [ ? ]
  const initLevel4 = useCallback(() => {
    const patternType = Math.random() > 0.5 ? "alternating_color" : "alternating_suit";
    if (patternType === "alternating_color") {
      const redCards = shuffleCards(FULL_DECK_54.filter((c) => c.color === "red" && !c.isJoker));
      const blackCards = shuffleCards(FULL_DECK_54.filter((c) => c.color === "black" && !c.isJoker));
      const seq = [redCards[0], blackCards[0], redCards[1]];
      const target = blackCards[1];
      const distractors = [redCards[2], redCards[3]];
      setL4Pattern(seq);
      setL4MissingCard(target);
      setL4Choices(shuffleCards([target, ...distractors]));
    } else {
      const spades = shuffleCards(FULL_DECK_54.filter((c) => c.suit === "spades" && !c.isJoker));
      const hearts = shuffleCards(FULL_DECK_54.filter((c) => c.suit === "hearts" && !c.isJoker));
      const seq = [spades[0], hearts[0], spades[1]];
      const target = hearts[1];
      const distractors = [spades[2], shuffleCards(FULL_DECK_54.filter((c) => c.suit === "clubs"))[0]];
      setL4Pattern(seq);
      setL4MissingCard(target);
      setL4Choices(shuffleCards([target, ...distractors]));
    }
    setFeedback(null);
    setShowHint(false);
  }, []);

  // Setup Level 5: Sorting Hand
  const initLevel5 = useCallback(() => {
    // Pick 4 distinct cards of differing values
    const nonJokers = FULL_DECK_54.filter((c) => !c.isJoker);
    const shuffled = shuffleCards(nonJokers);
    // ensure unique values
    const selected: PlayingCard[] = [];
    for (const c of shuffled) {
      if (!selected.some((s) => s.value === c.value)) {
        selected.push(c);
      }
      if (selected.length === 4) break;
    }
    const correctOrder = [...selected].sort((a, b) => a.value - b.value);
    setL5Hand(shuffleCards(selected));
    setL5Sorted([]);
    setL5CorrectOrder(correctOrder);
    setFeedback(null);
    setShowHint(false);
  }, []);

  // Setup Level 6: Classification
  const initLevel6 = useCallback(() => {
    const modes: ("suit" | "color" | "face_number")[] = ["suit", "color", "face_number"];
    const chosenMode = modes[(round - 1) % modes.length];
    setL6Mode(chosenMode);

    const pool = shuffleCards(FULL_DECK_54.filter((c) => !c.isJoker)).slice(0, 6);
    setL6CurrentCard(pool[0]);
    setL6RemainingCards(pool.slice(1));
    setL6SortedCount(0);
    setFeedback(null);
    setShowHint(false);
  }, [round]);

  // Setup Level 7: Flash Card Recall
  const initLevel7 = useCallback(() => {
    const card = shuffleCards(FULL_DECK_54.filter((c) => !c.isJoker))[0];
    setL7Card(card);
    setL7Phase("preview");
    setFeedback(null);
    setShowHint(false);

    // After 3.5s flash, transition to question
    const timer = setTimeout(() => {
      if (l7SubStage === "A") {
        // Stage A: What was the Number?
        setL7Phase("ask_number");
        const correct = getRankName(card.rank, cl);
        const wrongRanks: CardRank[] = (["A", "5", "7", "10", "K", "Q", "J"] as CardRank[])
          .filter((r) => r !== card.rank)
          .slice(0, 3);
        const wrongOptions = wrongRanks.map((r) => getRankName(r, cl));
        setL7CorrectOption(correct);
        setL7Options(shuffleCards([correct, ...wrongOptions]));
      } else {
        // Stage B: What was the Card (Number + Suit)?
        setL7Phase("ask_both");
        const correct = getCardName(card, cl);
        // distractors: same rank diff suit, same suit diff rank
        const otherCards = shuffleCards(
          FULL_DECK_54.filter((c) => c.id !== card.id && !c.isJoker)
        ).slice(0, 3);
        const wrongOptions = otherCards.map((c) => getCardName(c, cl));
        setL7CorrectOption(correct);
        setL7Options(shuffleCards([correct, ...wrongOptions]));
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [cl, l7SubStage]);

  // Setup Level 8: Reasoning (Odd one out / Highest card / Find Joker)
  const initLevel8 = useCallback(() => {
    const types: ("odd_one_out" | "highest" | "find_joker")[] = [
      "odd_one_out",
      "highest",
      "find_joker",
    ];
    const type = types[(round - 1) % types.length];
    setL8ChallengeType(type);

    if (type === "odd_one_out") {
      // 3 cards of one suit, 1 card of another suit
      const suits: CardSuit[] = ["spades", "hearts", "diamonds", "clubs"];
      const shuffledSuits = shuffleCards(suits);
      const majoritySuit = shuffledSuits[0];
      const oddSuit = shuffledSuits[1];

      const majorityCards = shuffleCards(
        FULL_DECK_54.filter((c) => c.suit === majoritySuit && !c.isJoker)
      ).slice(0, 3);
      const oddCard = shuffleCards(
        FULL_DECK_54.filter((c) => c.suit === oddSuit && !c.isJoker)
      )[0];

      const hand = shuffleCards([...majorityCards, oddCard]);
      setL8Cards(hand);
      setL8CorrectCard(oddCard);
      setL8QuestionPrompt(
        cl === "hi"
          ? "कौन सा पत्ता सबसे अलग है? (Odd One Out)"
          : cl === "as"
          ? "কোনটো কাৰ্ড বেলেগ? (Odd One Out)"
          : cl === "bn"
          ? "কোন তাসটি আলাদা? (Odd One Out)"
          : "Which card is the Odd One Out?"
      );
    } else if (type === "highest") {
      // 4 cards, choose the highest value (Ace = 14 or King = 13)
      const selected = shuffleCards(FULL_DECK_54.filter((c) => !c.isJoker)).slice(0, 4);
      // Let Ace be 14 for highest calculation
      const highestCard = [...selected].sort((a, b) => {
        const valA = a.rank === "A" ? 14 : a.value;
        const valB = b.rank === "A" ? 14 : b.value;
        return valB - valA;
      })[0];
      setL8Cards(selected);
      setL8CorrectCard(highestCard);
      setL8QuestionPrompt(
        cl === "hi"
          ? "सबसे बड़े मान का पत्ता कौन सा है? (Highest Card)"
          : cl === "as"
          ? "সকলোতকৈ ডাঙৰ কাৰ্ড কোনটো? (Highest Card)"
          : cl === "bn"
          ? "সবচেয়ে বড় মানের তাস কোনটি? (Highest Card)"
          : "Which card has the HIGHEST value?"
      );
    } else {
      // Find the Joker
      const jokers = FULL_DECK_54.filter((c) => c.isJoker);
      const chosenJoker = jokers[Math.floor(Math.random() * jokers.length)];
      const regulars = shuffleCards(FULL_DECK_54.filter((c) => !c.isJoker)).slice(0, 3);
      const hand = shuffleCards([chosenJoker, ...regulars]);
      setL8Cards(hand);
      setL8CorrectCard(chosenJoker);
      setL8QuestionPrompt(
        cl === "hi"
          ? "विशेष जोकर (Joker) पत्ता पहचानें!"
          : cl === "as"
          ? "বিশেষ জোকাৰ (Joker) কাৰ্ডখন বাছক!"
          : cl === "bn"
          ? "বিশেষ জোকার (Joker) তাসটি খুঁজে নিন!"
          : "Find the special JOKER card!"
      );
    }
    setFeedback(null);
    setShowHint(false);
  }, [round, cl]);

  // Level Router
  useEffect(() => {
    switch (currentLevel) {
      case 1:
        initLevel1();
        break;
      case 2:
        initLevel2();
        break;
      case 3:
        initLevel3();
        break;
      case 4:
        initLevel4();
        break;
      case 5:
        initLevel5();
        break;
      case 6:
        initLevel6();
        break;
      case 7:
        initLevel7();
        break;
      case 8:
        initLevel8();
        break;
    }
  }, [
    currentLevel,
    round,
    initLevel1,
    initLevel2,
    initLevel3,
    initLevel4,
    initLevel5,
    initLevel6,
    initLevel7,
    initLevel8,
  ]);

  // Success handler for round completion
  const handleSuccess = useCallback(() => {
    playCorrect();
    setFeedback("correct");
    setScore((s) => s + 20);

    setTimeout(() => {
      if (round < 3) {
        setRound((r) => r + 1);
      } else {
        // Level cleared!
        playComplete();
        setShowCelebration(true);
      }
    }, 1200);
  }, [round]);

  // Failure handler
  const handleWrong = useCallback(() => {
    playError();
    setFeedback("wrong");
    setTimeout(() => setFeedback(null), 1000);
  }, []);

  // Handle Next Level
  const handleNextLevel = () => {
    setShowCelebration(false);
    setRound(1);
    if (currentLevel < 8) {
      setCurrentLevel((l) => l + 1);
    } else {
      setIsGameComplete(true);
      recordGameSession(patientId, {
        gameId: "card-mastery",
        level: 8,
        outcome: "completed",
        score: score + 50,
        startedAt: sessionStartTime,
        taps: 24,
        errorCount: 0,
      });
    }
  };

  // Current Level Information
  const levelInfo = LEVEL_INSTRUCTIONS[currentLevel]?.[cl] || LEVEL_INSTRUCTIONS[currentLevel]?.en;

  return (
    <section className="pb-16 bg-[#FAF7F2] min-h-screen">
      <GameHeader
        title={levelInfo?.name || "Heritage Cards"}
        score={score}
        backHref="/patient/games"
        bgColor="bg-[#C2185B]"
        gameId="card-mastery"
      />

      <div className="mx-auto max-w-4xl px-4 pt-4">
        {/* Level Selector Tabs */}
        <div className="mb-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => {
              const active = currentLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    playPress();
                    setCurrentLevel(lvl);
                    setRound(1);
                    setShowCelebration(false);
                    setIsGameComplete(false);
                  }}
                  className={`btn-tactile px-3.5 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm cursor-pointer transition-all ${
                    active
                      ? "border-black bg-[#C2185B] text-white shadow-[2px_2px_0px_#000] scale-105"
                      : "border-black/30 bg-white text-slate-800 hover:border-black shadow-xs"
                  }`}
                >
                  L{lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Prompt Card with TTS */}
        <div className="mb-6 rounded-2xl border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-100 border border-pink-700 text-pink-900 font-black text-xs uppercase tracking-wider mb-1.5">
                Round {round} of 3
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-serif">
                {levelInfo?.instruction}
              </h2>
            </div>

            {/* Read for Me Button */}
            <button
              type="button"
              onClick={() => {
                playPress();
                let text = levelInfo?.instruction || "";
                if (currentLevel === 1 && l1Target) {
                  text = `${levelInfo.promptTts.replace(
                    "{cardName}",
                    getCardName(l1Target, cl)
                  )}`;
                } else if (currentLevel === 2 && l2Target) {
                  text = `${levelInfo.promptTts.replace(
                    "{cardName}",
                    getCardName(l2Target, cl)
                  )}`;
                } else if (currentLevel === 8) {
                  text = l8QuestionPrompt;
                }
                handleSpeak(text);
              }}
              className="btn-tactile flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-pink-50 hover:bg-pink-100 text-pink-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              title="Read for me"
              aria-label="Read prompt aloud"
            >
              <Volume2 className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Feedback Indicator */}
          {feedback === "correct" && (
            <div className="mt-3 flex items-center gap-2 text-emerald-700 font-black text-sm bg-emerald-50 p-2.5 rounded-xl border-2 border-emerald-600">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>
                {cl === "hi"
                  ? "बहुत बढ़िया! सही पत्ता चुना।"
                  : cl === "as"
                  ? "অপূৰ্ব! সঠিক কাৰ্ড বাছিলে।"
                  : "Splendid! Correct card."}
              </span>
            </div>
          )}
          {feedback === "wrong" && (
            <div className="mt-3 flex items-center gap-2 text-rose-700 font-black text-sm bg-rose-50 p-2.5 rounded-xl border-2 border-rose-600">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>
                {cl === "hi"
                  ? "कृपया दोबारा प्रयास करें।"
                  : cl === "as"
                  ? "পুনৰ চেষ্টা কৰক।"
                  : "Try again, look closely!"}
              </span>
            </div>
          )}
        </div>

        {/* ---------------- LEVEL 1: Card Identifying ---------------- */}
        {currentLevel === 1 && l1Target && (
          <div className="flex flex-col items-center">
            {/* Target Card Prompt */}
            <div className="mb-6 text-center">
              <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                {cl === "hi"
                  ? "लक्ष्य पत्ता पहचानें:"
                  : cl === "as"
                  ? "নিৰ্দিষ্ট কাৰ্ডখন বিচাৰক:"
                  : "Target Card to Find:"}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#C2185B] font-serif mt-1">
                {getCardName(l1Target, cl)}
              </p>
            </div>

            {/* Choices Grid */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {l1Choices.map((card) => (
                <PlayingCardVisual
                  key={card.id}
                  card={card}
                  isFaceUp={true}
                  isHighlighted={showHint && card.id === l1Target.id}
                  onClick={() => {
                    if (card.id === l1Target.id) {
                      handleSuccess();
                    } else {
                      handleWrong();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------- LEVEL 2: Card Memorizing ---------------- */}
        {currentLevel === 2 && l2Target && (
          <div className="flex flex-col items-center">
            {!l2Flipped ? (
              <div className="mb-4 text-center">
                <p className="text-sm font-black text-amber-700 bg-amber-100 border border-amber-400 px-3 py-1 rounded-full inline-block">
                  ⏱ Memorize these cards: {l2Countdown}s
                </p>
              </div>
            ) : (
              <div className="mb-6 text-center">
                <p className="text-sm font-bold text-slate-600">
                  {cl === "hi" ? "पूछा गया पत्ता ढूंढें:" : "Where is this card?"}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-[#C2185B] font-serif mt-1">
                  {getCardName(l2Target, cl)}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {l2Cards.map((card) => (
                <PlayingCardVisual
                  key={card.id}
                  card={card}
                  isFaceUp={!l2Flipped}
                  onClick={() => {
                    if (!l2Flipped) return;
                    if (card.id === l2Target.id) {
                      handleSuccess();
                    } else {
                      handleWrong();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------- LEVEL 3: Sequencing & Predicting ---------------- */}
        {currentLevel === 3 && l3TargetNext && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {l3Sequence.map((card) => (
                <PlayingCardVisual key={card.id} card={card} isFaceUp={true} />
              ))}
              {/* Mystery Slot */}
              <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl border-3 border-dashed border-slate-500 bg-slate-100 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-slate-400">?</span>
                <span className="text-xs font-bold text-slate-500 mt-1">Next Card</span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-700 mt-4 mb-3">
              {cl === "hi" ? "क्रम में अगला पत्ता चुनें:" : "Choose the card that comes next:"}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {l3Choices.map((card) => (
                <PlayingCardVisual
                  key={card.id}
                  card={card}
                  isFaceUp={true}
                  isHighlighted={showHint && card.id === l3TargetNext.id}
                  onClick={() => {
                    if (card.id === l3TargetNext.id) {
                      handleSuccess();
                    } else {
                      handleWrong();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------- LEVEL 4: Pattern Recognition ---------------- */}
        {currentLevel === 4 && l4MissingCard && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {l4Pattern.map((card) => (
                <PlayingCardVisual key={card.id} card={card} isFaceUp={true} />
              ))}
              {/* Blank Mystery Slot */}
              <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl border-3 border-dashed border-amber-600 bg-amber-50 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-amber-700">?</span>
                <span className="text-xs font-bold text-amber-800 mt-1">Complete Pattern</span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-700 mt-4 mb-3">
              {cl === "hi"
                ? "पैटर्न पूरा करने वाला पत्ता चुनें:"
                : "Select the card completing the pattern:"}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {l4Choices.map((card) => (
                <PlayingCardVisual
                  key={card.id}
                  card={card}
                  isFaceUp={true}
                  isHighlighted={showHint && card.id === l4MissingCard.id}
                  onClick={() => {
                    if (card.id === l4MissingCard.id) {
                      handleSuccess();
                    } else {
                      handleWrong();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------- LEVEL 5: Card Sorting ---------------- */}
        {currentLevel === 5 && (
          <div className="flex flex-col items-center">
            {/* Sorted Tray */}
            <div className="w-full max-w-xl min-h-[110px] rounded-2xl border-3 border-black bg-white p-3 mb-6 shadow-[3px_3px_0px_#000]">
              <span className="block text-xs font-black text-slate-500 uppercase mb-2">
                Sorted Rack (Smallest to Largest):
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {l5Sorted.length === 0 ? (
                  <p className="text-sm italic text-slate-400 py-3">
                    {cl === "hi"
                      ? "नीचे दिए गए पत्तों में से सबसे छोटे पत्ते पर टैप करें..."
                      : "Tap the lowest card from below to place it here..."}
                  </p>
                ) : (
                  l5Sorted.map((card) => (
                    <PlayingCardVisual key={card.id} card={card} isFaceUp={true} size="sm" />
                  ))
                )}
              </div>
            </div>

            {/* Remaining Hand */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {l5Hand.map((card) => (
                <PlayingCardVisual
                  key={card.id}
                  card={card}
                  isFaceUp={true}
                  onClick={() => {
                    const expectedNext = l5CorrectOrder[l5Sorted.length];
                    if (card.id === expectedNext.id) {
                      playPress();
                      const nextSorted = [...l5Sorted, card];
                      setL5Sorted(nextSorted);
                      setL5Hand((h) => h.filter((c) => c.id !== card.id));
                      if (nextSorted.length === l5CorrectOrder.length) {
                        handleSuccess();
                      }
                    } else {
                      handleWrong();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------- LEVEL 6: Card Classifying & Grouping ---------------- */}
        {currentLevel === 6 && l6CurrentCard && (
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Card to Classify:
              </span>
              <PlayingCardVisual card={l6CurrentCard} isFaceUp={true} size="lg" />
            </div>

            <p className="text-sm font-bold text-slate-700 mt-2 mb-4">
              {cl === "hi"
                ? "इस पत्ते को सही श्रेणी में डालें:"
                : "Select the correct category for this card:"}
            </p>

            {/* Suit Buckets */}
            {l6Mode === "suit" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                {(["spades", "hearts", "diamonds", "clubs"] as CardSuit[]).map((suit) => {
                  const sName = getSuitName(suit, cl);
                  const isMatch = l6CurrentCard.suit === suit;
                  return (
                    <button
                      key={suit}
                      type="button"
                      onClick={() => {
                        if (isMatch) {
                          playCorrect();
                          if (l6RemainingCards.length > 0) {
                            setL6CurrentCard(l6RemainingCards[0]);
                            setL6RemainingCards((r) => r.slice(1));
                            setL6SortedCount((c) => c + 1);
                          } else {
                            handleSuccess();
                          }
                        } else {
                          handleWrong();
                        }
                      }}
                      className="btn-tactile rounded-2xl border-3 border-black bg-white p-3 font-black text-sm text-slate-900 shadow-[3px_3px_0px_#000] hover:bg-pink-50 cursor-pointer"
                    >
                      <span className="text-2xl block mb-1">
                        {suit === "hearts" || suit === "diamonds" ? (
                          <span className="text-red-600">
                            {suit === "hearts" ? "♥" : "♦"}
                          </span>
                        ) : (
                          <span className="text-slate-900">
                            {suit === "spades" ? "♠" : "♣"}
                          </span>
                        )}
                      </span>
                      {sName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Color Buckets */}
            {l6Mode === "color" && (
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <button
                  type="button"
                  onClick={() => {
                    if (l6CurrentCard.color === "red") {
                      playCorrect();
                      if (l6RemainingCards.length > 0) {
                        setL6CurrentCard(l6RemainingCards[0]);
                        setL6RemainingCards((r) => r.slice(1));
                      } else {
                        handleSuccess();
                      }
                    } else {
                      handleWrong();
                    }
                  }}
                  className="btn-tactile rounded-2xl border-3 border-black bg-red-50 hover:bg-red-100 p-4 font-black text-base text-red-700 shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  <span className="text-3xl block mb-1">♥ ♦</span>
                  {COLORS_LOCALIZED[cl]?.red || "Red"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (l6CurrentCard.color === "black") {
                      playCorrect();
                      if (l6RemainingCards.length > 0) {
                        setL6CurrentCard(l6RemainingCards[0]);
                        setL6RemainingCards((r) => r.slice(1));
                      } else {
                        handleSuccess();
                      }
                    } else {
                      handleWrong();
                    }
                  }}
                  className="btn-tactile rounded-2xl border-3 border-black bg-slate-100 hover:bg-slate-200 p-4 font-black text-base text-slate-900 shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  <span className="text-3xl block mb-1">♠ ♣</span>
                  {COLORS_LOCALIZED[cl]?.black || "Black"}
                </button>
              </div>
            )}

            {/* Face Cards vs Number Cards Buckets */}
            {l6Mode === "face_number" && (
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    const isFace =
                      l6CurrentCard.rank === "J" ||
                      l6CurrentCard.rank === "Q" ||
                      l6CurrentCard.rank === "K";
                    if (isFace) {
                      playCorrect();
                      if (l6RemainingCards.length > 0) {
                        setL6CurrentCard(l6RemainingCards[0]);
                        setL6RemainingCards((r) => r.slice(1));
                      } else {
                        handleSuccess();
                      }
                    } else {
                      handleWrong();
                    }
                  }}
                  className="btn-tactile rounded-2xl border-3 border-black bg-purple-50 hover:bg-purple-100 p-4 font-black text-sm text-purple-900 shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  <span className="text-2xl block mb-1">🤴 👸 💂</span>
                  {cl === "hi"
                    ? "तस्वीर वाले पत्ते (J, Q, K)"
                    : cl === "as"
                    ? "ছবি কাৰ্ড (গোলাম, বিবি, চাহেব)"
                    : "Face Cards (J, Q, K)"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const isNumber =
                      l6CurrentCard.rank !== "J" &&
                      l6CurrentCard.rank !== "Q" &&
                      l6CurrentCard.rank !== "K";
                    if (isNumber) {
                      playCorrect();
                      if (l6RemainingCards.length > 0) {
                        setL6CurrentCard(l6RemainingCards[0]);
                        setL6RemainingCards((r) => r.slice(1));
                      } else {
                        handleSuccess();
                      }
                    } else {
                      handleWrong();
                    }
                  }}
                  className="btn-tactile rounded-2xl border-3 border-black bg-emerald-50 hover:bg-emerald-100 p-4 font-black text-sm text-emerald-900 shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  <span className="text-2xl block mb-1">🔢 2-10</span>
                  {cl === "hi"
                    ? "संख्या वाले पत्ते (2-10)"
                    : cl === "as"
                    ? "সংখ্যা কাৰ্ড (২-১০)"
                    : "Number Cards (2-10)"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------------- LEVEL 7: Flash Card Recall ---------------- */}
        {currentLevel === 7 && l7Card && (
          <div className="flex flex-col items-center">
            {l7Phase === "preview" ? (
              <div className="flex flex-col items-center">
                <p className="text-sm font-black text-amber-700 bg-amber-100 border border-amber-400 px-3 py-1 rounded-full mb-3">
                  ⏱ Memorize this card (3s)...
                </p>
                <PlayingCardVisual card={l7Card} isFaceUp={true} size="lg" />
              </div>
            ) : (
              <div className="flex flex-col items-center w-full max-w-md">
                <div className="w-28 h-40 rounded-2xl border-3 border-dashed border-slate-400 bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
                  <span className="text-4xl text-slate-400">?</span>
                </div>

                <p className="text-base font-black text-slate-800 mb-4 text-center">
                  {l7Phase === "ask_number"
                    ? cl === "hi"
                      ? "उस पत्ते का नंबर / रैंक क्या था?"
                      : cl === "as"
                      ? "কাৰ্ডখনৰ সংখ্যাটো কি আছিল?"
                      : "What was the NUMBER / RANK of that card?"
                    : cl === "hi"
                    ? "पत्ते का पूरा नाम (नंबर और चिह्न) क्या था?"
                    : cl === "as"
                    ? "কাৰ্ডখনৰ সম্পূৰ্ণ নাম (সংখ্যা আৰু গোত্ৰ) কি আছিল?"
                    : "What was the FULL card (Rank and Suit)?"}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  {l7Options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (opt === l7CorrectOption) {
                          if (l7SubStage === "A") {
                            // Advance to Sub-stage B
                            playCorrect();
                            setL7SubStage("B");
                          } else {
                            handleSuccess();
                            setL7SubStage("A");
                          }
                        } else {
                          handleWrong();
                        }
                      }}
                      className="btn-tactile rounded-2xl border-3 border-black bg-white hover:bg-pink-50 p-4 font-black text-sm text-slate-900 shadow-[3px_3px_0px_#000] cursor-pointer text-center"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- LEVEL 8: Reasoning & Discrimination ---------------- */}
        {currentLevel === 8 && l8CorrectCard && (
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 border border-indigo-700 text-indigo-900 font-black text-xs uppercase mb-1">
                Cognitive Challenge
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                {l8QuestionPrompt}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {l8Cards.map((card) => (
                <PlayingCardVisual
                  key={card.id}
                  card={card}
                  isFaceUp={true}
                  isHighlighted={showHint && card.id === l8CorrectCard.id}
                  onClick={() => {
                    if (card.id === l8CorrectCard.id) {
                      handleSuccess();
                    } else {
                      handleWrong();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Gentle Help & Hint Button */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              playPress();
              setShowHint(true);
              const msg =
                cl === "hi"
                  ? "मदद: सही पत्ते पर ध्यान दें (हरा घेरा देखें)"
                  : cl === "as"
                  ? "সহায়: সেউজীয়া বৃত্তৰে দেখুওৱা কাৰ্ডখন চাওক"
                  : "Hint: Look at the highlighted card";
              handleSpeak(msg);
            }}
            className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-amber-50 hover:bg-amber-100 px-4 py-2.5 font-black text-xs text-amber-900 shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>{cl === "hi" ? "संकेत / मदद" : cl === "as" ? "সংকেত / সহায়" : "Need Hint?"}</span>
          </button>
        </div>
      </div>

      {/* Round Celebration Modal */}
      {showCelebration && (
        <Celebration
          icon={Layers}
          title={
            cl === "hi"
              ? "शानदार! स्तर पूरा हुआ"
              : cl === "as"
              ? "অপূৰ্ব! স্তৰ সম্পন্ন হ'ল"
              : "Level Complete!"
          }
          subtitle={
            currentLevel < 8
              ? cl === "hi"
                ? `अगले स्तर (${currentLevel + 1}) की ओर बढ़ें...`
                : `Proceeding to Level ${currentLevel + 1}...`
              : "All 8 card therapy levels completed!"
          }
          xpEarned={score}
          gameTitle="Heritage Playing Cards (Taash)"
          gameId="card-mastery"
          level={currentLevel}
          accuracy="100%"
          emoji="🃏"
        >
          <div className="flex flex-col items-center gap-4 mt-6">
            <ChunkyButton
              onClick={handleNextLevel}
              variant="terracotta"
              size="xl"
            >
              {currentLevel < 8
                ? cl === "hi"
                  ? `स्तर ${currentLevel + 1} शुरू करें ➔`
                  : `Next Level ${currentLevel + 1} ➔`
                : "Finish 🏆"}
            </ChunkyButton>
          </div>
        </Celebration>
      )}
    </section>
  );
}
