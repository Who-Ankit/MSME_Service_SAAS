import os
import shutil
from datetime import datetime
from decimal import Decimal
from math import ceil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from database.db import get_db
from models.service import Service
from schemas.service_schema import (
    PaginatedServicesResponse,
    ServiceCreateRequest,
    ServiceResponse,
    ServiceUpdateRequest,
)


router = APIRouter(prefix="/services", tags=["Services"])

SERVICE_IMAGE_DIR = Path(
    os.getenv("SERVICE_IMAGE_DIR", "D:/LinkedINAIAgent/ai-lead-agent/service-assets")
).resolve()
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}


def _normalize_slug(slug: str) -> str:
    return slug.strip().lower().replace(" ", "-")


def _ensure_service_image_dir() -> Path:
    SERVICE_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    return SERVICE_IMAGE_DIR


def _delete_service_image(image_path: str | None) -> None:
    if not image_path:
        return

    image_file = _ensure_service_image_dir() / image_path
    if image_file.exists():
        image_file.unlink()


@router.get("", response_model=PaginatedServicesResponse)
def list_services(
    page: int = Query(1, ge=1),
    page_size: int = Query(3, ge=1, le=100),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
) -> PaginatedServicesResponse:
    query = db.query(Service)
    if not include_inactive:
        query = query.filter(Service.is_active.is_(True))

    total_items = query.count()
    total_pages = max(1, ceil(total_items / page_size)) if total_items else 1
    if page > total_pages and total_items > 0:
        page = total_pages

    items = (
        query.order_by(Service.created_at.desc(), Service.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return PaginatedServicesResponse(
        items=items,
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
    )


@router.post("", response_model=ServiceResponse)
def create_service(payload: ServiceCreateRequest, db: Session = Depends(get_db)) -> Service:
    slug = _normalize_slug(payload.slug)
    existing = db.query(Service).filter(Service.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A service with this slug already exists.")

    service = Service(
        title=payload.title.strip(),
        slug=slug,
        short_description=payload.short_description.strip(),
        description=payload.description.strip(),
        price=Decimal(str(payload.price)),
        currency=payload.currency.strip().upper() or "USD",
        booking_url=(payload.booking_url or "").strip() or None,
        is_active=payload.is_active,
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(service_id: int, payload: ServiceUpdateRequest, db: Session = Depends(get_db)) -> Service:
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")

    slug = _normalize_slug(payload.slug)
    existing = db.query(Service).filter(Service.slug == slug, Service.id != service_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="A service with this slug already exists.")

    service.title = payload.title.strip()
    service.slug = slug
    service.short_description = payload.short_description.strip()
    service.description = payload.description.strip()
    service.price = Decimal(str(payload.price))
    service.currency = payload.currency.strip().upper() or "USD"
    service.booking_url = (payload.booking_url or "").strip() or None
    service.is_active = payload.is_active
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")

    _delete_service_image(service.image_path)
    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully."}


@router.post("/{service_id}/image", response_model=ServiceResponse)
def upload_service_image(
    service_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> Service:
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")

    original_name = image.filename or ""
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported image type.")

    safe_slug = _normalize_slug(service.slug or service.title or f"service-{service.id}")
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    filename = f"{safe_slug}-{timestamp}{extension}"
    target_dir = _ensure_service_image_dir()
    target_path = target_dir / filename

    try:
        with target_path.open("wb") as file_handle:
            shutil.copyfileobj(image.file, file_handle)
    finally:
        image.file.close()

    if service.image_path and service.image_path != filename:
        _delete_service_image(service.image_path)

    service.image_path = filename
    db.commit()
    db.refresh(service)
    return service
