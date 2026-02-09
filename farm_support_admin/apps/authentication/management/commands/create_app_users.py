"""
Django management command to create app users
"""
from django.core.management.base import BaseCommand
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Create app users for testing'

    def handle(self, *args, **options):
        # Create a field officer user
        field_officer, created = User.objects.get_or_create(
            username='field_officer',
            defaults={
                'email': 'field.officer@farmingsupport.com',
                'first_name': 'Field',
                'last_name': 'Officer',
                'role': 'field_officer',
                'phone': '9876543210',
                'is_staff': False,  # Not a Django admin
                'is_superuser': False,
            }
        )
        if created:
            field_officer.set_password('field123')
            field_officer.save()
            self.stdout.write(
                self.style.SUCCESS(f'Created field officer: {field_officer.username}')
            )
        else:
            self.stdout.write(f'Field officer already exists: {field_officer.username}')

        # Create a regular app user (farmer)
        farmer_user, created = User.objects.get_or_create(
            username='farmer_user',
            defaults={
                'email': 'farmer@farmingsupport.com',
                'first_name': 'Test',
                'last_name': 'Farmer',
                'role': 'user',
                'phone': '8765432109',
                'is_staff': False,  # Not a Django admin
                'is_superuser': False,
            }
        )
        if created:
            farmer_user.set_password('farmer123')
            farmer_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Created farmer user: {farmer_user.username}')
            )
        else:
            self.stdout.write(f'Farmer user already exists: {farmer_user.username}')

        # Create an admin app user (for app administration, not Django admin)
        app_admin, created = User.objects.get_or_create(
            username='app_admin',
            defaults={
                'email': 'appadmin@farmingsupport.com',
                'first_name': 'App',
                'last_name': 'Admin',
                'role': 'admin',
                'phone': '7654321098',
                'is_staff': False,  # Not a Django admin
                'is_superuser': False,
            }
        )
        if created:
            app_admin.set_password('appadmin123')
            app_admin.save()
            self.stdout.write(
                self.style.SUCCESS(f'Created app admin: {app_admin.username}')
            )
        else:
            self.stdout.write(f'App admin already exists: {app_admin.username}')

        self.stdout.write('\n' + '='*50)
        self.stdout.write('APP USER CREDENTIALS:')
        self.stdout.write('='*50)
        self.stdout.write('Field Officer: field_officer / field123')
        self.stdout.write('Farmer User:   farmer_user / farmer123')
        self.stdout.write('App Admin:     app_admin / appadmin123')
        self.stdout.write('='*50)
        self.stdout.write('\nDJANGO ADMIN CREDENTIALS:')
        self.stdout.write('='*50)
        self.stdout.write('Django Admin:  admin / admin123')
        self.stdout.write('='*50)