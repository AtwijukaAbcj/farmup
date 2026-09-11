from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('marketplace', '0006_producecategoryproxy_supplycategoryproxy')]

    operations = [
        migrations.CreateModel(
            name='Checkout',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('items', models.JSONField()),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('status', models.CharField(default='pending', max_length=20)),
                ('trustpay_session_id', models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ('payment_status', models.CharField(default='unpaid', max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='checkouts', to='marketplace.customer')),
            ],
        ),
    ]