from pydantic import BaseModel
from typing import Optional


class DomainResult(BaseModel):
    needs_help: bool
    evidence: Optional[str] = None


class MedicalAnalysis(BaseModel):
    memory: DomainResult
    attention: DomainResult
    executive_function: DomainResult
    orientation: DomainResult
    language: DomainResult
    visuospatial: DomainResult
    decision_making: DomainResult

    medication_management: DomainResult
    financial_management: DomainResult
    navigation: DomainResult
    meal_preparation: DomainResult
    driving: DomainResult
    household_tasks: DomainResult

    apathy: DomainResult
    agitation: DomainResult
    social_withdrawal: DomainResult
    sleep_disturbance: DomainResult