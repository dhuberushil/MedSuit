import io
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from .models import Invoice, Payment
from .serializers import InvoiceSerializer, InvoiceListSerializer, PaymentSerializer
from accounts.permissions import IsAdminOrReceptionist


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'patient']
    search_fields = ['invoice_number', 'patient__first_name', 'patient__last_name']
    ordering_fields = ['created_at', 'total']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.select_related('patient', 'appointment').prefetch_related('items', 'payments')
        if user.role == 'patient':
            qs = qs.filter(patient__user=user)
        elif user.role == 'doctor':
            qs = qs.filter(appointment__doctor=user)
        return qs

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsAdminOrReceptionist()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5 * inch)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph('HSuit Hospital', styles['Title']))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f'Invoice: {invoice.invoice_number}', styles['Heading2']))
        elements.append(Paragraph(f'Patient: {invoice.patient.full_name}', styles['Normal']))
        elements.append(Paragraph(f'Date: {invoice.created_at.strftime("%Y-%m-%d")}', styles['Normal']))
        elements.append(Paragraph(f'Status: {invoice.get_status_display()}', styles['Normal']))
        elements.append(Spacer(1, 24))

        # Items table
        table_data = [['Description', 'Qty', 'Unit Price', 'Total']]
        for item in invoice.items.all():
            table_data.append([item.description, str(item.quantity), f'${item.unit_price}', f'${item.total}'])

        table_data.append(['', '', 'Subtotal:', f'${invoice.subtotal}'])
        if invoice.tax_amount:
            table_data.append(['', '', f'Tax ({invoice.tax_rate}%):', f'${invoice.tax_amount}'])
        if invoice.discount:
            table_data.append(['', '', 'Discount:', f'-${invoice.discount}'])
        table_data.append(['', '', 'Total:', f'${invoice.total}'])
        table_data.append(['', '', 'Paid:', f'${invoice.amount_paid}'])
        table_data.append(['', '', 'Balance Due:', f'${invoice.balance_due}'])

        table = Table(table_data, colWidths=[3 * inch, 0.8 * inch, 1.2 * inch, 1.2 * inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, len(invoice.items.all())), 0.5, colors.grey),
            ('LINEABOVE', (2, -3), (-1, -3), 1, colors.black),
            ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=['get', 'post'])
    def payments(self, request, pk=None):
        invoice = self.get_object()
        if request.method == 'GET':
            serializer = PaymentSerializer(invoice.payments.all(), many=True)
            return Response(serializer.data)

        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(invoice=invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
