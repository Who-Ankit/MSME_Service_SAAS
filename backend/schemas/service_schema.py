from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    title: str = Field(..., min_length=1)
    short_description: str = ""
    description: str = ""
    price: float = Field(..., ge=0)
    currency: str = "USD"
    booking_url: str | None = None
    image_path: str | None = None
    is_active: bool = True


class ServiceCreateRequest(ServiceBase):
    slug: str = Field(..., min_length=1)


class ServiceUpdateRequest(ServiceBase):
    slug: str = Field(..., min_length=1)


class ServiceResponse(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    updated_at: datetime


class PaginatedServicesResponse(BaseModel):
    items: list[ServiceResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int
