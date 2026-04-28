PAGE_SIZES = {
    "A4": (595, 842),
    "A5": (420, 595),
}


def resolve_page_size(page_size: str, width: int | None = None, height: int | None = None) -> tuple[int, int]:
    if page_size == "custom":
        if not width or not height:
            raise ValueError("Custom page requires width and height")
        return width, height
    return PAGE_SIZES.get(page_size.upper(), PAGE_SIZES["A4"])


def estimate_text_overflow(element: dict, text: str | None = None) -> dict:
    if element.get("type") != "text":
        return {"overflow": False, "estimated_height": 0}
    content = text if text is not None else (element.get("text") or "")
    font_size = float(element.get("fontSize") or 14)
    line_height = float(element.get("lineHeight") or 1.4)
    width = max(float(element.get("width") or 1), 1)
    height = max(float(element.get("height") or font_size * line_height), 1)
    avg_char_width = font_size * (0.55 if all(ord(ch) < 128 for ch in content) else 0.9)
    estimated_width = len(content) * avg_char_width
    lines = max(1, int(estimated_width // width) + 1)
    estimated_height = lines * font_size * line_height
    overflow = estimated_height > height
    suggestion = None
    if overflow:
        suggested_font = max(8, int(font_size * height / estimated_height))
        suggestion = f"建议将字号从 {int(font_size)} 调整为 {suggested_font}，或增加文本框高度。"
    return {"overflow": overflow, "estimated_height": estimated_height, "suggestion": suggestion}
