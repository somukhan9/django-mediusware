from django.urls import path

from product.views.product import CreateProductView, ListProductView,  CreateProductAPIView
from product.views.variant import VariantView, VariantCreateView, VariantEditView


app_name = "product"

urlpatterns = [
    # Variants URLs
    path('variants/', VariantView.as_view(), name='variants'),
    path('variant/create', VariantCreateView.as_view(), name='create.variant'),
    path('variant/<int:id>/edit', VariantEditView.as_view(), name='update.variant'),

    # Products URLs
    path('create/', CreateProductView.as_view(), name='create.product'),
    path('api/create/', CreateProductAPIView.as_view(), name='api.create.product'),
    path('list/', ListProductView.as_view(), name='list.product'),
]
