import random
from datetime import date, time, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import DoctorProfile
from patients.models import Patient, MedicalRecord
from appointments.models import Appointment
from billing.models import Invoice, InvoiceItem, Payment

User = get_user_model()

SPECIALIZATIONS = [
    'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology',
    'Ophthalmology', 'ENT', 'General Medicine', 'Gynecology', 'Psychiatry',
]

FIRST_NAMES = [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
    'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Lisa', 'Matthew', 'Nancy',
    'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
    'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle',
    'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Dorothy', 'Timothy', 'Melissa',
    'Ronald', 'Deborah',
]

LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris',
]

DIAGNOSES = [
    'Hypertension', 'Type 2 Diabetes', 'Upper Respiratory Infection',
    'Migraine', 'Back Pain', 'Allergic Rhinitis', 'Asthma', 'Anxiety Disorder',
    'Urinary Tract Infection', 'Gastritis', 'Iron Deficiency Anemia',
    'Hypothyroidism', 'Osteoarthritis', 'Conjunctivitis', 'Dermatitis',
]

REASONS = [
    'Regular checkup', 'Follow-up visit', 'Fever and cough', 'Chronic pain management',
    'Lab results review', 'Medication refill', 'Skin rash', 'Annual physical',
    'Headache evaluation', 'Joint pain', 'Chest discomfort', 'Fatigue',
]


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create admin
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@hsuit.com', 'role': 'admin',
                'first_name': 'System', 'last_name': 'Admin', 'is_staff': True, 'is_superuser': True,
            }
        )
        admin.set_password('admin123')
        admin.save()

        # Create receptionist
        receptionist, _ = User.objects.get_or_create(
            username='receptionist',
            defaults={
                'email': 'reception@hsuit.com', 'role': 'receptionist',
                'first_name': 'Front', 'last_name': 'Desk',
            }
        )
        receptionist.set_password('reception123')
        receptionist.save()

        # Create 10 doctors
        doctors = []
        for i in range(10):
            doc_user, _ = User.objects.get_or_create(
                username=f'doctor{i+1}',
                defaults={
                    'email': f'doctor{i+1}@hsuit.com', 'role': 'doctor',
                    'first_name': random.choice(FIRST_NAMES),
                    'last_name': random.choice(LAST_NAMES),
                    'phone': f'+1555{random.randint(1000000, 9999999)}',
                }
            )
            doc_user.set_password('doctor123')
            doc_user.save()

            profile, _ = DoctorProfile.objects.get_or_create(
                user=doc_user,
                defaults={
                    'specialization': SPECIALIZATIONS[i],
                    'license_number': f'LIC-{10000 + i}',
                    'consultation_fee': Decimal(random.randint(50, 300)),
                    'is_available': True,
                }
            )
            doctors.append(doc_user)

        # Create 50 patients
        patients = []
        for i in range(50):
            p, _ = Patient.objects.get_or_create(
                first_name=random.choice(FIRST_NAMES),
                last_name=random.choice(LAST_NAMES),
                defaults={
                    'date_of_birth': date(
                        random.randint(1950, 2005),
                        random.randint(1, 12),
                        random.randint(1, 28)
                    ),
                    'gender': random.choice(['male', 'female', 'other']),
                    'blood_group': random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']),
                    'phone': f'+1555{random.randint(1000000, 9999999)}',
                    'email': f'patient{i+1}@example.com',
                    'address': f'{random.randint(1, 999)} Main St, City',
                    'allergies': random.choice(['None', 'Penicillin', 'Peanuts', 'Latex', '']),
                    'chronic_conditions': random.choice(['None', 'Diabetes', 'Hypertension', 'Asthma', '']),
                }
            )
            patients.append(p)

        # Create 200 appointments (spread over last 3 months and next month)
        statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']
        for _ in range(200):
            appt_date = date.today() + timedelta(days=random.randint(-90, 30))
            hour = random.randint(9, 16)
            minute = random.choice([0, 30])
            start = time(hour, minute)
            end = time(hour + (1 if minute == 30 else 0), (minute + 30) % 60)
            doctor = random.choice(doctors)
            patient = random.choice(patients)

            # Past dates are completed/cancelled, future are scheduled/confirmed
            if appt_date < date.today():
                status = random.choice(['completed', 'cancelled', 'no_show'])
            else:
                status = random.choice(['scheduled', 'confirmed'])

            try:
                appt = Appointment.objects.create(
                    patient=patient, doctor=doctor,
                    date=appt_date, start_time=start, end_time=end,
                    status=status, reason=random.choice(REASONS),
                )

                # Add medical record for completed appointments
                if status == 'completed' and random.random() > 0.3:
                    MedicalRecord.objects.create(
                        patient=patient, doctor=doctor,
                        diagnosis=random.choice(DIAGNOSES),
                        prescription=f'Take medication {random.choice(["A", "B", "C"])} {random.randint(1, 3)} times daily',
                        notes='Patient responded well to treatment.',
                        visit_date=appt_date,
                    )
            except Exception:
                continue  # Skip duplicates

        # Create 100 invoices
        ITEMS = [
            ('Consultation Fee', Decimal('100'), Decimal('300')),
            ('Lab Tests', Decimal('50'), Decimal('500')),
            ('X-Ray', Decimal('80'), Decimal('200')),
            ('Medication', Decimal('20'), Decimal('150')),
            ('ECG', Decimal('50'), Decimal('100')),
            ('Ultrasound', Decimal('100'), Decimal('250')),
        ]

        for _ in range(100):
            patient = random.choice(patients)
            invoice = Invoice.objects.create(
                patient=patient,
                tax_rate=Decimal(random.choice([0, 5, 10, 18])),
                discount=Decimal(random.choice([0, 0, 0, 10, 25, 50])),
                notes='',
            )

            num_items = random.randint(1, 4)
            for item_name, min_price, max_price in random.sample(ITEMS, num_items):
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=item_name,
                    quantity=random.randint(1, 3),
                    unit_price=Decimal(random.randint(int(min_price), int(max_price))),
                )

            invoice.recalculate_totals()

            # Some invoices are paid
            if random.random() > 0.4:
                pay_amount = invoice.total if random.random() > 0.3 else invoice.total * Decimal(str(random.uniform(0.3, 0.9)))
                Payment.objects.create(
                    invoice=invoice,
                    amount=round(pay_amount, 2),
                    method=random.choice(['cash', 'card', 'upi', 'bank_transfer', 'insurance']),
                    transaction_id=f'TXN-{random.randint(100000, 999999)}',
                )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded: {User.objects.count()} users, {Patient.objects.count()} patients, '
            f'{Appointment.objects.count()} appointments, {Invoice.objects.count()} invoices'
        ))
