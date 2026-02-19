from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total']
        read_only_fields = ['id', 'total']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'amount', 'method', 'transaction_id', 'payment_date', 'created_at']
        read_only_fields = ['id', 'invoice', 'payment_date', 'created_at']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    payments = PaymentSerializer(many=True, read_only=True)
    patient_name = serializers.SerializerMethodField()
    balance_due = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'patient', 'patient_name', 'appointment',
            'status', 'items', 'payments', 'subtotal', 'tax_rate', 'tax_amount',
            'discount', 'total', 'amount_paid', 'balance_due', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'invoice_number', 'subtotal', 'tax_amount', 'total', 'amount_paid', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return obj.patient.full_name

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.recalculate_totals()
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
            instance.recalculate_totals()

        return instance


class InvoiceListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    balance_due = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'patient', 'patient_name', 'status',
            'total', 'amount_paid', 'balance_due', 'created_at',
        ]

    def get_patient_name(self, obj):
        return obj.patient.full_name
