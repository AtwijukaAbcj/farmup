import requests
from django.conf import settings


RETURN_FIELDS = (
    'checkout_url', 'id', 'transaction_id', 'status', 'external_reference',
    'amount', 'currency', 'expires_at',
)


class TrustPayError(Exception):
    def __init__(self, message, code='trustpay_error', status=502):
        super().__init__(message)
        self.code = code
        self.status = status


def _config():
    if not settings.TRUSTPAY_API_KEY:
        raise TrustPayError('TrustPay is not configured.', 'trustpay_not_configured', 503)
    if not settings.TRUSTPAY_BASE_URL:
        raise TrustPayError('TrustPay domain is not configured.', 'trustpay_not_configured', 503)
    return settings.TRUSTPAY_BASE_URL, settings.TRUSTPAY_API_KEY


def _headers(api_key):
    return {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}


def _trustpay_message(response):
    try:
        data = response.json()
        detail = data.get('detail') or data.get('message') or data.get('error')
        if detail:
            return str(detail)
    except (ValueError, AttributeError):
        pass
    return 'TrustPay rejected the request.'


def _raise_for_response(response):
    if response.status_code in (401, 403):
        raise TrustPayError('TrustPay API key is invalid or revoked.', 'invalid_api_key', 502)
    if response.status_code in (408, 504):
        raise TrustPayError('TrustPay timed out.', 'trustpay_timeout', 504)
    if response.status_code >= 500:
        raise TrustPayError('TrustPay is temporarily unavailable.', 'trustpay_server_error', 502)
    if response.status_code == 404:
        raise TrustPayError('TrustPay transaction or checkout session was not found.', 'not_found', 400)
    if response.status_code >= 400:
        message = _trustpay_message(response).lower()
        if 'owned' in message or 'merchant' in message:
            code = 'transaction_not_owned'
        elif 'ready' in message or 'fund' in message:
            code = 'transaction_not_ready'
        elif 'expired' in message:
            code = 'checkout_expired'
        else:
            code = 'trustpay_request_failed'
        raise TrustPayError(_trustpay_message(response), code, 400)


def _request(method, url, api_key, **kwargs):
    try:
        response = requests.request(method, url, headers=_headers(api_key), timeout=15, **kwargs)
    except requests.Timeout as exc:
        raise TrustPayError('TrustPay timed out.', 'trustpay_timeout', 504) from exc
    except requests.RequestException as exc:
        raise TrustPayError('Could not reach TrustPay.', 'trustpay_unavailable', 502) from exc
    _raise_for_response(response)
    try:
        return response.json()
    except ValueError as exc:
        raise TrustPayError('TrustPay returned an invalid response.', 'invalid_trustpay_response', 502) from exc


def create_session(checkout, success_url, cancel_url, webhook_url):
    base_url, api_key = _config()
    if not checkout.customer.user.email:
        raise TrustPayError('Customer email is required for payment.', 'missing_customer_email', 400)
    description = ', '.join(
        f"{item['name']} x{item['quantity']}" for item in checkout.items
    )
    payload = {
        'order_id': f'AGRO-ORDER-{checkout.id}',
        'title': 'Agro marketplace order',
        'amount': str(checkout.total_price),
        'currency': 'UGX',
        'buyer_name': checkout.customer.user.get_full_name() or checkout.customer.user.username,
        'buyer_email': checkout.customer.user.email,
        'description': description,
        'success_url': success_url,
        'cancel_url': cancel_url,
    }
    return _request('POST', f'{base_url}/api/v1/checkout/sessions/', api_key, json=payload)


def get_session(session_id):
    if not session_id:
        raise TrustPayError('Missing checkout session ID.', 'missing_session_id', 400)
    base_url, api_key = _config()
    return _request('GET', f'{base_url}/api/v1/checkout/sessions/{session_id}/', api_key)


def public_session_fields(data):
    return {field: data.get(field) for field in RETURN_FIELDS if field in data}


def payment_status_from_trustpay(value):
    normalized = str(value or '').lower()
    if normalized in {'paid', 'completed', 'succeeded', 'success'}:
        return 'paid'
    if normalized in {'failed', 'cancelled', 'canceled', 'expired'}:
        return 'failed'
    return 'pending'