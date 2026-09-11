from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('marketplace', '0004_produce_image2_produce_image3_supplyproduct_image2_and_more')]

    operations = [
        migrations.AddField(
            model_name='order', name='payment_status',
            field=models.CharField(default='unpaid', max_length=30),
        ),
        migrations.AddField(
            model_name='order', name='trustpay_session_id',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]