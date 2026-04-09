"""Predefined behavioral tags for pet health events."""

from fastapi import APIRouter

router = APIRouter(tags=["tags"])

BEHAVIORAL_TAGS = [
    {"id": "lethargy", "label": "Léthargie", "icon": "😴", "category": "behavior"},
    {
        "id": "high_appetite",
        "label": "Fort appétit",
        "icon": "🍽️",
        "category": "behavior",
    },
    {
        "id": "low_appetite",
        "label": "Peu d'appétit",
        "icon": "📉",
        "category": "behavior",
    },
    {"id": "scratching", "label": "Grattage", "icon": "🐾", "category": "behavior"},
    {"id": "hiding", "label": "Se cache", "icon": "🫣", "category": "behavior"},
    {"id": "aggressive", "label": "Agressif", "icon": "😾", "category": "behavior"},
    {"id": "playful", "label": "Joueur", "icon": "🎾", "category": "behavior"},
    {"id": "vocal", "label": "Vocalisations", "icon": "🗣️", "category": "behavior"},
    {
        "id": "normal_stool",
        "label": "Selles normales",
        "icon": "✅",
        "category": "digestion",
    },
    {"id": "diarrhea", "label": "Diarrhée", "icon": "💧", "category": "digestion"},
    {
        "id": "constipation",
        "label": "Constipation",
        "icon": "🚫",
        "category": "digestion",
    },
    {"id": "vomiting", "label": "Vomissement", "icon": "🤢", "category": "digestion"},
    {
        "id": "blood_stool",
        "label": "Sang dans selles",
        "icon": "🩸",
        "category": "digestion",
    },
    {
        "id": "excessive_thirst",
        "label": "Soif excessive",
        "icon": "💦",
        "category": "symptom",
    },
    {"id": "limping", "label": "Boiterie", "icon": "🦿", "category": "symptom"},
    {"id": "sneezing", "label": "Éternuements", "icon": "🤧", "category": "symptom"},
]


@router.get("/tags")
def list_tags() -> list[dict]:
    """Return all predefined behavioral tags."""
    return BEHAVIORAL_TAGS
