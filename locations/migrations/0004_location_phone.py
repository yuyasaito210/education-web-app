# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-01-26 05:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0003_fieldtrip_school_list'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='phone',
            field=models.CharField(max_length=25, null=True),
        ),
    ]
