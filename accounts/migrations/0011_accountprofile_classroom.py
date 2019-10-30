# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-07-10 22:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_school_school_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='accountprofile',
            name='classroom',
            field=models.IntegerField(blank=True, choices=[(1, "Children's house"), (2, 'Lower Elementary'), (3, 'Upper Elementary'), (4, 'Adolescent')], null=True),
        ),
    ]
