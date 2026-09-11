from decimal import Decimal

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Checkout, Customer, Produce
from .trustpay import TrustPayError, create_session, get_session, payment_status_from_trustpay, public_session_fields


class TrustPayCreateSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            checkout = Checkout.objects.select_related('customer__user').get(
                id=request.data.get('checkout_id'), customer__user=request.user,
            )
        except (Checkout.DoesNotExist, TypeError, ValueError):
            return Response({'error': 'Checkout not found.'}, status=status.HTTP_404_NOT_FOUND)

        if checkout.payment_status == 'paid':
            return Response({'error': 'Checkout is already paid.'}, status=status.HTTP_409_CONFLICT)
        try:
            data = create_session(
                checkout,
                f'{settings.AGRO_PUBLIC_URL}/payment/success',
                f'{settings.AGRO_PUBLIC_URL}/payment/cancel',
                f'{settings.AGRO_PUBLIC_URL}/api/payments/trustpay/webhook',
            )
            session_id = data.get('id') or data.get('transaction_id')
            if not session_id:
                raise TrustPayError('TrustPay did not return a session ID.', 'invalid_trustpay_response', 502)
            checkout.trustpay_session_id = session_id
            checkout.payment_status = 'pending'
            checkout.save(update_fields=['trustpay_session_id', 'payment_status'])
            return Response(public_session_fields(data), status=status.HTTP_201_CREATED)
        except TrustPayError as exc:
            return Response({'error': str(exc), 'code': exc.code}, status=exc.status)


class CartCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items = request.data.get('items')
        if not isinstance(items, list) or not items:
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        customer, _ = Customer.objects.get_or_create(
            user=request.user, defaults={'phone_number': '', 'address': ''},
        )
        checkout_items = []
        total = Decimal('0.00')
        for item in items:
            try:
                produce = Produce.objects.get(id=item['produce_id'], is_active=True)
                quantity = Decimal(str(item['quantity']))
            except (KeyError, TypeError, ValueError, Produce.DoesNotExist):
                return Response({'error': 'Cart contains an invalid product.'}, status=status.HTTP_400_BAD_REQUEST)
            if quantity <= 0 or quantity > produce.quantity_available:
                return Response({'error': f'Quantity unavailable for {produce.name}.'}, status=status.HTTP_400_BAD_REQUEST)
            checkout_items.append({
                'produce_id': produce.id,
                'name': produce.name,
                'quantity': str(quantity),
                'unit_price': str(produce.price_per_unit),
            })
            total += produce.price_per_unit * quantity
        checkout = Checkout.objects.create(
            customer=customer, items=checkout_items, total_price=total.quantize(Decimal('0.01')),
        )
        return Response({'id': checkout.id, 'items': checkout.items, 'total_price': str(checkout.total_price)}, status=status.HTTP_201_CREATED)


class TrustPayStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, checkout_id):
        try:
            checkout = Checkout.objects.get(id=checkout_id, customer__user=request.user)
        except Checkout.DoesNotExist:
            return Response({'error': 'Checkout not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            data = get_session(checkout.trustpay_session_id)
            checkout.payment_status = payment_status_from_trustpay(data.get('status'))
            if checkout.payment_status == 'paid':
                checkout.status = 'paid'
            elif checkout.payment_status == 'failed':
                checkout.status = 'payment_failed'
            checkout.save(update_fields=['payment_status', 'status'])
            return Response({**public_session_fields(data), 'status': checkout.payment_status})
        except TrustPayError as exc:
            return Response({'error': str(exc), 'code': exc.code}, status=exc.status)


class TrustPayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_id = request.data.get('id') or request.data.get('session_id')
        try:
            checkout = Checkout.objects.get(trustpay_session_id=session_id)
        except Checkout.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            data = get_session(checkout.trustpay_session_id)
            payment_status = payment_status_from_trustpay(data.get('status'))
            checkout.payment_status = payment_status
            if payment_status == 'paid':
                checkout.status = 'paid'
            elif payment_status == 'failed':
                checkout.status = 'payment_failed'
            checkout.save(update_fields=['payment_status', 'status'])
            return Response({'status': payment_status})
        except TrustPayError as exc:
            return Response({'error': str(exc), 'code': exc.code}, status=exc.status)