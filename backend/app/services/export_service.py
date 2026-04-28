from pathlib import Path
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.models.file import File
from app.models.page import Page, PageVersion


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _ascii_text(value: str) -> str:
    """Keep the MVP PDF dependency-free; non-latin text is represented safely."""
    return value.encode("latin-1", "replace").decode("latin-1")


def _element_commands(page_height: int, element: dict) -> list[str]:
    if not element.get("visible", True):
        return []
    element_type = element.get("type")
    x = float(element.get("x") or 0)
    y = float(element.get("y") or 0)
    width = float(element.get("width") or 0)
    height = float(element.get("height") or 0)
    pdf_y = page_height - y - height
    commands: list[str] = []
    if element_type == "text":
        font_size = int(element.get("fontSize") or 14)
        text = _pdf_escape(_ascii_text(str(element.get("text") or ""))[:160])
        commands.extend(["BT", f"/F1 {font_size} Tf", f"{x:.2f} {page_height - y - font_size:.2f} Td", f"({text}) Tj", "ET"])
    elif element_type in {"rect", "table", "image"}:
        commands.append(f"{x:.2f} {pdf_y:.2f} {width:.2f} {height:.2f} re S")
        if element_type == "table":
            commands.append(f"{x:.2f} {pdf_y + height / 2:.2f} m {x + width:.2f} {pdf_y + height / 2:.2f} l S")
            commands.append(f"{x + width / 2:.2f} {pdf_y:.2f} m {x + width / 2:.2f} {pdf_y + height:.2f} l S")
        if element_type == "image":
            commands.extend(["BT", "/F1 10 Tf", f"{x + 8:.2f} {pdf_y + height / 2:.2f} Td", "([Image]) Tj", "ET"])
    elif element_type == "line":
        points = element.get("points") or [x, y, x + width, y + height]
        x1, y1, x2, y2 = [float(item) for item in points[:4]]
        commands.append(f"{x1:.2f} {page_height - y1:.2f} m {x2:.2f} {page_height - y2:.2f} l S")
    return commands


def _build_pdf(pages: list[tuple[int, int, list[dict]]]) -> bytes:
    objects: list[bytes] = []

    def add_object(body: str | bytes) -> int:
        if isinstance(body, str):
            body = body.encode("latin-1", "replace")
        objects.append(body)
        return len(objects)

    # placeholders: catalog, pages tree, font
    add_object("<< /Type /Catalog /Pages 2 0 R >>")
    add_object(b"")
    add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    page_object_ids: list[int] = []
    for width, height, elements in pages:
        stream = "\n".join(command for element in elements for command in _element_commands(height, element)) or "BT /F1 12 Tf 40 40 Td (Manual Canvas AI) Tj ET"
        stream_bytes = stream.encode("latin-1", "replace")
        content_id = add_object(b"<< /Length " + str(len(stream_bytes)).encode() + b" >>\nstream\n" + stream_bytes + b"\nendstream")
        page_id = add_object(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {width} {height}] /Resources << /Font << /F1 3 0 R >> >> /Contents {content_id} 0 R >>")
        page_object_ids.append(page_id)
    kids = " ".join(f"{page_id} 0 R" for page_id in page_object_ids)
    objects[1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_object_ids)} >>".encode("latin-1")

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, body in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode())
        output.extend(body)
        output.extend(b"\nendobj\n")
    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode())
    output.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode())
    return bytes(output)


def export_pdf(db: Session, user_id: str | None, project_id: str, language: str, page_ids: list[str] | None) -> dict:
    settings = get_settings()
    export_dir = settings.storage_path / "exports"
    file_name = f"manual-{project_id}-{language}.pdf"
    file_path = export_dir / file_name
    query = db.query(Page).filter(Page.project_id == project_id).order_by(Page.page_no)
    if page_ids:
        query = query.filter(Page.id.in_(page_ids))
    db_pages = query.all()
    if not db_pages:
        raise ValueError("No pages to export")
    pdf_pages: list[tuple[int, int, list[dict]]] = []
    for page in db_pages:
        elements = page.elements_json or []
        if language != "source":
            version = db.query(PageVersion).filter(PageVersion.page_id == page.id, PageVersion.language == language).one_or_none()
            if version:
                elements = version.elements_json or []
        pdf_pages.append((page.width, page.height, elements))
    file_path.write_bytes(_build_pdf(pdf_pages))
    size = Path(file_path).stat().st_size
    file = File(user_id=user_id, project_id=project_id, file_name=file_name, file_type="application/pdf", file_path=str(file_path), file_size=size)
    db.add(file)
    db.commit()
    db.refresh(file)
    return {"file_id": file.id, "file_name": file.file_name, "download_url": f"/api/files/{file.id}/download", "file_size": size}
