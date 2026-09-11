from pathlib import Path
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Checkout, Customer, Order, Produce


class TrustPayIntegrationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='buyer', email='buyer@example.com', password='password123',
        )
        self.customer = Customer.objects.create(user=self.user)
        self.produce = Produce.objects.create(
            name='Maize', price_per_unit='2500.00', quantity_available='10',
        )
        self.order = Order.objects.create(
            customer=self.customer, produce=self.produce, quantity='2', total_price='5000.00',
        )
        self.checkout = Checkout.objects.create(
            customer=self.customer,
            items=[{'produce_id': self.produce.id, 'name': self.produce.name, 'quantity': '2', 'unit_price': '2500.00'}],
            total_price='5000.00',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def trustpay_response(self, status_code=201, data=None):
        response = Mock()
        response.status_code = status_code
        response.json.return_value = data or {
            'id': 'session-123', 'checkout_url': 'https://pay.example/session-123',
            'transaction_id': 'AGRO-ORDER-1',
            'status': 'created', 'external_reference': str(self.order.id),
            'amount': '5000.00', 'currency': 'UGX', 'expires_at': '2030-01-01T00:00:00Z',
            'secret_internal_field': 'must-not-leak',
        }
        return response

    @override_settings(
        TRUSTPAY_API_KEY='server-secret', TRUSTPAY_API_BASE_URL='https://trustpay.example',
        AGRO_PUBLIC_URL='https://agro.example',
    )
    @patch('apps.marketplace.trustpay.requests.request')
    def test_successful_session_creation_allowlists_fields_and_stores_id(self, request):
        request.return_value = self.trustpay_response()

        response = self.client.post('/api/payments/trustpay/create-session', {'checkout_id': self.checkout.id}, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['checkout_url'], 'https://pay.example/session-123')
        self.assertEqual(response.data['transaction_id'], 'AGRO-ORDER-1')
        self.assertNotIn('secret_internal_field', response.data)
        self.assertEqual(Checkout.objects.get(id=self.checkout.id).trustpay_session_id, 'session-123')
        request.assert_called_once()
        self.assertEqual(request.call_args.kwargs['headers']['Authorization'], 'Api-Key server-secret')
        self.assertEqual(request.call_args.kwargs['json']['order_id'], f'AGRO-ORDER-{self.checkout.id}')
        self.assertEqual(request.call_args.kwargs['json']['amount'], '5000.00')

    @override_settings(
        TRUSTPAY_API_KEY='server-secret', TRUSTPAY_API_BASE_URL='https://trustpay.example',
    )
    @patch('apps.marketplace.trustpay.requests.request')
    def test_failed_trustpay_request_returns_safe_error(self, request):
        request.return_value = self.trustpay_response(401, {'detail': 'invalid key'})

        response = self.client.post('/api/payments/trustpay/create-session', {'checkout_id': self.checkout.id}, format='json')

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data['code'], 'invalid_api_key')
        self.assertNotIn('server-secret', response.content.decode())

    @override_settings(
        TRUSTPAY_API_KEY='server-secret', TRUSTPAY_API_BASE_URL='https://trustpay.example',
    )
    @patch('apps.marketplace.trustpay.requests.request')
    def test_successful_and_failed_status_checks_update_order(self, request):
        self.checkout.trustpay_session_id = 'session-123'
        self.checkout.payment_status = 'pending'
        self.checkout.save(update_fields=['trustpay_session_id', 'payment_status'])

        request.return_value = self.trustpay_response(200, {'id': 'session-123', 'status': 'paid'})
        response = self.client.get(f'/api/payments/trustpay/status/{self.checkout.id}')
        self.assertEqual(response.data['status'], 'paid')
        self.assertEqual(Checkout.objects.get(id=self.checkout.id).status, 'paid')

        request.return_value = self.trustpay_response(200, {'id': 'session-123', 'status': 'expired'})
        response = self.client.get(f'/api/payments/trustpay/status/{self.checkout.id}')
        self.assertEqual(response.data['status'], 'failed')
        self.assertEqual(Checkout.objects.get(id=self.checkout.id).status, 'payment_failed')

    def test_frontend_tree_does_not_contain_api_key(self):
        frontend_root = Path(__file__).resolve().parents[3] / 'Web' / 'src'
        source = '\n'.join(path.read_text(encoding='utf-8') for path in frontend_root.rglob('*') if path.is_file())
        self.assertNotIn('TRUSTPAY_API_KEY', source)
        self.assertNotIn('Api-Key', source)