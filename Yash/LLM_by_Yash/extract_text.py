import pymupdf


def extract_text_from_pdf(pdf_path):
    document = pymupdf.open(pdf_path)

    text = ""

    for page_number, page in enumerate(document, start=1):
        page_text = page.get_text()

        print(f"Page {page_number}: {len(page_text)} characters")

        text += page_text

    document.close()

    return text


if __name__ == "__main__":
    text = extract_text_from_pdf("reports/sample_report.pdf")

    if text.strip():
        print("\nExtracted Text:\n")
        print(text)
    else:
        print("\nNo text found in the PDF.")