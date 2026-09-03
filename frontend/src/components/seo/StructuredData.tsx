import { SITE_URL } from "@/lib/site";

export function StructuredData({ locale = "en" }: { locale?: string }) {
  const baseUrl = SITE_URL;

  const medicalAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CogniCare CDTx — AI-Powered Memory Assistance Platform",
    operatingSystem: "Web, iOS, Android, Kiosk Terminal",
    applicationCategory: "HealthApplication, MedicalApplication, GameApplication",
    applicationSubCategory: "Digital Therapeutics (CDTx)",
    inLanguage: [
      "en",
      "hi",
      "as",
      "mr",
      "bn",
      "ne",
      "mni",
      "lus",
      "kha",
      "brx",
      "grt",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    description:
      "Clinically calibrated cognitive digital therapeutics platform featuring 18 serious games, local Ollama AI reminiscence dialogue, and zero-touch QR kiosk authentication for elderly dementia and MCI patients in North East India.",
    url: `${baseUrl}/${locale}`,
    author: {
      "@type": "GovernmentOrganization",
      name: "Ministry of Development of North Eastern Region (MDoNER)",
      url: "https://mdoner.gov.in",
    },
    publisher: {
      "@type": "Organization",
      name: "Smart India Hackathon 2026",
      url: "https://www.sih.gov.in",
    },
  };

  const medicalConditionSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "CogniCare CDTx Elderly Memory Care",
    url: `${baseUrl}/${locale}`,
    about: [
      {
        "@type": "MedicalCondition",
        name: "Dementia",
        code: {
          "@type": "MedicalCode",
          code: "F03",
          codingSystem: "ICD-10",
        },
        possibleTreatment: [
          {
            "@type": "MedicalTherapy",
            name: "Cognitive Stimulation Therapy & Reminiscence Dialogue",
          },
          {
            "@type": "MedicalTherapy",
            name: "3D Motor Kinematics & Visuospatial Training",
          },
        ],
      },
      {
        "@type": "MedicalCondition",
        name: "Mild Cognitive Impairment",
        code: {
          "@type": "MedicalCode",
          code: "G31.84",
          codingSystem: "ICD-10",
        },
      },
      {
        "@type": "MedicalCondition",
        name: "Alzheimer's Disease",
        code: {
          "@type": "MedicalCode",
          code: "G30",
          codingSystem: "ICD-10",
        },
      },
    ],
    audience: {
      "@type": "Patient",
      geographicArea: {
        "@type": "AdministrativeArea",
        name: "North Eastern Region, India (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim)",
      },
    },
  };

  const governmentServiceSchema = {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: "MDoNER Cognitive Gaming & Memory Assistance Platform",
    serviceType: "Elderly Healthcare & Dementia Digital Therapeutics",
    provider: {
      "@type": "GovernmentOrganization",
      name: "Ministry of Development of North Eastern Region (MDoNER)",
      alternateName: "MDoNER India",
    },
    areaServed: [
      "Assam",
      "Meghalaya",
      "Manipur",
      "Mizoram",
      "Nagaland",
      "Tripura",
      "Arunachal Pradesh",
      "Sikkim",
    ],
    serviceOperator: {
      "@type": "Organization",
      name: "National Health Mission (NHM) & ASHA Community Health Network",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(medicalConditionSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(governmentServiceSchema),
        }}
      />
    </>
  );
}
