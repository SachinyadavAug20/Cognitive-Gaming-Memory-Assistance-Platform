from extract_text import extract_text_from_pdf
from analyze_report import analyze_report


def main():

    print("Reading medical report...")

    report_text = extract_text_from_pdf(
        "reports/sample_report.pdf"
    )

    print("Medical report extracted.")
    print("Analyzing clinical domains...")

    result = analyze_report(report_text)

    print("\n==============================")
    print("DOMAIN HELP ANALYSIS")
    print("==============================\n")

    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()