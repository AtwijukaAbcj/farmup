from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('marketplace', '0005_order_payment_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProduceCategoryProxy',
            fields=[],
            options={
                'verbose_name': 'Farm Produce Category',
                'verbose_name_plural': 'Farm Produce Categories',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('marketplace.productcategory',),
        ),
        migrations.CreateModel(
            name='SupplyCategoryProxy',
            fields=[],
            options={
                'verbose_name': 'Supply Category',
                'verbose_name_plural': 'Supply Categories',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('marketplace.productcategory',),
        ),
    ]