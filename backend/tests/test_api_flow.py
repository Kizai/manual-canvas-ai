def test_full_manual_canvas_mvp_flow(client, auth_headers):
    project_res = client.post("/api/projects", headers=auth_headers, json={
        "name": "智能手表说明书",
        "description": "多语言说明书",
        "source_language": "zh-CN",
        "target_languages": ["en-US", "ja-JP"],
        "default_page_size": "A5",
    })
    assert project_res.status_code == 201
    project = project_res.json()

    pages = client.get(f"/api/projects/{project['id']}/pages", headers=auth_headers).json()
    assert len(pages) == 2
    page_id = pages[0]["id"]

    elements = [
        {"id": "title", "type": "text", "x": 40, "y": 40, "width": 300, "height": 40, "fontSize": 22, "text": "产品使用说明书"},
        {"id": "warning", "type": "text", "x": 40, "y": 100, "width": 280, "height": 30, "fontSize": 14, "text": "警告：请勿将智能手表靠近高温环境。输入 5V/1A。"},
        {"id": "box", "type": "rect", "x": 40, "y": 160, "width": 120, "height": 80, "stroke": "#111827"},
    ]
    update_res = client.put(f"/api/pages/{page_id}/elements", headers=auth_headers, json={"elements": elements})
    assert update_res.status_code == 200
    assert update_res.json()["elements_json"][1]["text"].startswith("警告")

    term_res = client.post(f"/api/projects/{project['id']}/terms", headers=auth_headers, json={
        "source_term": "智能手表", "target_language": "en-US", "target_term": "Smart Watch", "term_type": "product", "confirmed": True
    })
    assert term_res.status_code == 201

    extract_res = client.post(f"/api/projects/{project['id']}/terms/extract", headers=auth_headers)
    assert extract_res.status_code == 202
    extract_task = client.get(f"/api/tasks/{extract_res.json()['task_id']}", headers=auth_headers).json()
    assert extract_task["status"] == "success"
    assert "terms" in extract_task["output_json"]

    translate_res = client.post(f"/api/projects/{project['id']}/translate", headers=auth_headers, json={
        "target_language": "en-US", "page_ids": [page_id], "use_terms": True, "keep_layout": True
    })
    assert translate_res.status_code == 202
    translate_task = client.get(f"/api/tasks/{translate_res.json()['task_id']}", headers=auth_headers).json()
    assert translate_task["status"] == "success"
    assert translate_task["output_json"]["items"]

    version = client.get(f"/api/pages/{page_id}/versions/en-US", headers=auth_headers).json()
    warning = next(item for item in version["elements_json"] if item["id"] == "warning")
    assert "Smart Watch" in warning["text"]

    quality_res = client.post(f"/api/projects/{project['id']}/quality-check", headers=auth_headers, json={"target_language": "en-US", "page_ids": [page_id]})
    assert quality_res.status_code == 202
    quality_task = client.get(f"/api/tasks/{quality_res.json()['task_id']}", headers=auth_headers).json()
    assert quality_task["status"] == "success"
    assert "issues" in quality_task["output_json"]

    export_res = client.post(f"/api/projects/{project['id']}/export/pdf", headers=auth_headers, json={"language": "en-US", "page_ids": [page_id]})
    assert export_res.status_code == 202
    export_task = client.get(f"/api/tasks/{export_res.json()['task_id']}", headers=auth_headers).json()
    assert export_task["status"] == "success"
    assert export_task["output_json"]["file_size"] > 0

    download = client.get(export_task["output_json"]["download_url"], headers=auth_headers)
    assert download.status_code == 200
    assert download.headers["content-type"].startswith("application/pdf")


def test_pages_can_be_reordered_and_deleted(client, auth_headers):
    project_res = client.post("/api/projects", headers=auth_headers, json={
        "name": "页面管理说明书",
        "source_language": "zh-CN",
        "target_languages": ["en-US"],
        "default_page_size": "A4",
    })
    assert project_res.status_code == 201
    project = project_res.json()
    pages = client.get(f"/api/projects/{project['id']}/pages", headers=auth_headers).json()
    assert [page["page_no"] for page in pages] == [1, 2]

    reorder_res = client.put(
        f"/api/projects/{project['id']}/pages/order",
        headers=auth_headers,
        json={"page_ids": [pages[1]["id"], pages[0]["id"]]},
    )
    assert reorder_res.status_code == 200
    assert [page["id"] for page in reorder_res.json()] == [pages[1]["id"], pages[0]["id"]]
    assert [page["page_no"] for page in reorder_res.json()] == [1, 2]

    delete_res = client.delete(f"/api/pages/{pages[1]['id']}", headers=auth_headers)
    assert delete_res.status_code == 204
    remaining = client.get(f"/api/projects/{project['id']}/pages", headers=auth_headers).json()
    assert len(remaining) == 1
    assert remaining[0]["page_no"] == 1


def test_auth_required(client):
    response = client.get("/api/projects")
    assert response.status_code == 401
