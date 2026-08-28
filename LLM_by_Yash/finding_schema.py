from pydantic import BaseModel
from typing import Optional


class ClinicalFinding(BaseModel):
    finding: str
    section: Optional[str] = None


class ClinicalFindings(BaseModel):
    findings: list[ClinicalFinding]