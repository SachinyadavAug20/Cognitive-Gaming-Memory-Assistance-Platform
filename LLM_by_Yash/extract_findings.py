from ollama import chat
from finding_schema import ClinicalFindings


SYSTEM_PROMPT = """
You are a medical document information extraction system.

Your task is to extract clinically relevant findings from the medical
report.

IMPORTANT:

Extract the findings that are explicitly documented in the report.

Do NOT interpret them.

Do NOT infer additional problems.

Do NOT diagnose.

Do NOT assign severity unless the exact severity is explicitly written
in the finding itself.

Do NOT combine unrelated findings.

Do NOT omit important cognitive, functional, behavioral, diagnostic,
laboratory, imaging, or neurological findings.

Preserve important scores and measurements exactly.

For example, if the report says:

"Recall: 0/3"

extract:

"Recall: 0/3"

If the report says:

"Dependent on caregiver for medication management"

extract:

"Dependent on caregiver for medication management"

If the report says:

"Clock Drawing Test showed significant spatial distortion and
incorrect hand placement"

extract that finding exactly.

Do not turn findings into conclusions.

Before returning the final answer, review the entire medical report
again and make sure you did not miss:

1. Diagnoses
2. Cognitive test results
3. Memory findings
4. Attention findings
5. Orientation findings
6. Executive-function findings
7. Language findings
8. Visuospatial findings
9. Functional/IADL findings
10. Behavioral findings
11. MRI/imaging findings
12. Important laboratory findings
13. Relevant neurological examination findings

Do not stop after finding the first few abnormalities.

Return ONLY valid JSON.
"""


def extract_findings(report_text):

    schema = ClinicalFindings.model_json_schema()

    response = chat(
        model="llama3.2",

        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"""
Extract all clinically relevant findings from the following
medical report.

MEDICAL REPORT:

{report_text}
"""
            }
        ],

        format=schema,

        options={
            "temperature": 0
        }
    )

    return ClinicalFindings.model_validate_json(
        response.message.content
    )