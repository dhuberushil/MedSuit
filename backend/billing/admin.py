from django.contrib import admin
from .models import Invoice, InvoiceItem, Payment


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'patient', 'status', 'total', 'amount_paid', 'created_at']
    list_filter = ['status']
    search_fields = ['invoice_number', 'patient__first_name', 'patient__last_name']
    inlines = [InvoiceItemInline, PaymentInline]
