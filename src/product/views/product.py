from django.views import generic

from datetime import datetime

from product.models import Variant, Product


class CreateProductView(generic.TemplateView):
    template_name = 'products/create.html'

    def get_context_data(self, **kwargs):
        context = super(CreateProductView, self).get_context_data(**kwargs)
        variants = Variant.objects.filter(active=True).values('id', 'title')
        context['product'] = True
        context['variants'] = list(variants.all())
        return context


class ListProductView(generic.ListView):
    model = Product
    template_name = 'products/list.html'
    paginate_by = 2

    def get_queryset(self):
        queryset = super().get_queryset()

        request = self.request

        title_query = request.GET.get('title', '')
        variant_query = request.GET.get('variant', '')
        min_price_query = request.GET.get('price_from', 0)
        max_price_query = request.GET.get('price_to', float('inf'))
        date_query = request.GET.get('date', '')

        if title_query:
            queryset = queryset.filter(title__icontains=title_query)

        if variant_query:
            # productvariantprice__product_variant_one__variant_title__icontains
            queryset = queryset.filter(
                productvariant__variant_title__icontains=variant_query)

        if max_price_query:
            queryset = queryset.filter(
                productvariantprice__price__gte=min_price_query,)

        if max_price_query:
            queryset = queryset.filter(
                productvariantprice__price__lte=max_price_query,)

        if date_query:
            queryset = queryset.filter(created_at__date=date_query)

        return queryset.distinct()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        request = self.request

        context['title_query'] = request.GET.get('title_query', '')
        context['variant_query'] = request.GET.get('variant_query', '')
        context['min_price_query'] = request.GET.get('min_price_query', '')
        context['max_price_query'] = request.GET.get('max_price_query', '')
        context['date_query'] = request.GET.get('date_query', '')

        variants = Variant.objects.all()

        context['variants'] = variants

        return context
