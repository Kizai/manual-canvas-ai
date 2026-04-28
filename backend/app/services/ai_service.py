import re
from copy import deepcopy
from app.services.layout_service import estimate_text_overflow

BUILTIN_TRANSLATIONS = {
    "警告": {"en-US": "Warning", "ja-JP": "警告"},
    "注意": {"en-US": "Caution", "ja-JP": "注意"},
    "产品使用说明书": {"en-US": "Product User Manual", "ja-JP": "製品取扱説明書"},
    "智能手表": {"en-US": "Smart Watch", "ja-JP": "スマートウォッチ"},
    "电源键": {"en-US": "Power Button", "ja-JP": "電源ボタン"},
    "心率监测": {"en-US": "Heart Rate Monitoring", "ja-JP": "心拍数モニタリング"},
    "防水等级": {"en-US": "Water Resistance Rating", "ja-JP": "防水等級"},
    "请勿": {"en-US": "Do not", "ja-JP": "しないでください"},
    "高温环境": {"en-US": "high-temperature environments", "ja-JP": "高温環境"},
}


def _terms_map(terms: list) -> dict[str, str]:
    return {t.source_term: t.target_term for t in terms if getattr(t, "confirmed", False)}


def translate_text(text: str, target_language: str, terms: list) -> str:
    translated = text
    for source, target in sorted(_terms_map(terms).items(), key=lambda item: len(item[0]), reverse=True):
        translated = translated.replace(source, target)
    for source, mapping in sorted(BUILTIN_TRANSLATIONS.items(), key=lambda item: len(item[0]), reverse=True):
        translated = translated.replace(source, mapping.get(target_language, source))
    if translated == text:
        prefix = "[EN]" if target_language == "en-US" else "[JA]"
        translated = f"{prefix} {text}"
    return translated


def translate_elements(elements: list[dict], target_language: str, terms: list, keep_layout: bool = True) -> tuple[list[dict], list[dict]]:
    translated_elements: list[dict] = []
    results: list[dict] = []
    for element in elements:
        new_element = deepcopy(element)
        if element.get("type") == "text" and element.get("text"):
            source_text = str(element.get("text"))
            translated_text = translate_text(source_text, target_language, terms)
            new_element["text"] = translated_text
            new_element.setdefault("metadata", {})
            new_element["metadata"].update({"source_text": source_text, "target_language": target_language})
            layout = estimate_text_overflow(element, translated_text) if keep_layout else {"overflow": False}
            results.append({
                "element_id": element.get("id"),
                "source_text": source_text,
                "translated_text": translated_text,
                "target_language": target_language,
                "layout_status": "overflow_risk" if layout.get("overflow") else "ok",
                "suggestion": layout.get("suggestion"),
            })
        translated_elements.append(new_element)
    return translated_elements, results


def extract_candidate_terms(text: str) -> list[dict]:
    known = []
    for term, mapping in BUILTIN_TRANSLATIONS.items():
        if len(term) >= 2 and term in text:
            known.append({
                "source_term": term,
                "term_type": "safety" if term in {"警告", "注意"} else "product",
                "en-US": mapping.get("en-US", term),
                "ja-JP": mapping.get("ja-JP", term),
            })
    # Simple Chinese phrase heuristic for domain terms.
    for match in re.findall(r"[\u4e00-\u9fff]{2,8}", text):
        if match not in {item["source_term"] for item in known} and len(known) < 20:
            known.append({"source_term": match, "term_type": "candidate", "en-US": f"{match}", "ja-JP": f"{match}"})
    return known


def quality_check(source_elements: list[dict], translated_elements: list[dict], terms: list, target_language: str) -> list[dict]:
    issues: list[dict] = []
    translated_by_id = {el.get("id"): el for el in translated_elements}
    term_map = _terms_map(terms)
    number_pattern = re.compile(r"\d+(?:\.\d+)?\s*[A-Za-z/%]*")
    for source in source_elements:
        if source.get("type") != "text":
            continue
        element_id = source.get("id")
        target = translated_by_id.get(element_id)
        source_text = str(source.get("text") or "")
        target_text = str((target or {}).get("text") or "")
        if source_text and not target_text:
            issues.append({"element_id": element_id, "type": "missing_translation", "level": "error", "message": "目标语言版本缺少译文。", "suggestion": "重新执行翻译任务。"})
        for source_term, target_term in term_map.items():
            if source_term in source_text and target_term not in target_text:
                issues.append({"element_id": element_id, "type": "term_inconsistent", "level": "warning", "message": f"术语「{source_term}」应翻译为「{target_term}」。", "suggestion": "应用术语库译法并重新质检。"})
        if set(number_pattern.findall(source_text)) != set(number_pattern.findall(target_text)):
            issues.append({"element_id": element_id, "type": "number_mismatch", "level": "error", "message": "源文和译文中的数字、型号或单位不一致。", "suggestion": "人工核对参数。"})
        if any(word in source_text for word in ["警告", "注意", "危险"]) and not any(word.lower() in target_text.lower() for word in ["warning", "caution", "danger", "警告", "注意", "危険"]):
            issues.append({"element_id": element_id, "type": "safety_warning_issue", "level": "error", "message": "安全警示词可能未正确保留。", "suggestion": "确保警告/注意/危险语义准确。"})
        layout = estimate_text_overflow(source, target_text)
        if layout.get("overflow"):
            issues.append({"element_id": element_id, "type": "text_overflow", "level": "warning", "message": "译文长度存在文本框溢出风险。", "suggestion": layout.get("suggestion")})
    return issues
