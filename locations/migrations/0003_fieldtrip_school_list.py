# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-01-13 12:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_auto_20180112_2307'),
        ('locations', '0002_auto_20180105_0046'),
    ]

    operations = [
        migrations.AddField(
            model_name='fieldtrip',
            name='school_list',
            field=models.ManyToManyField(blank=True, to='accounts.School'),
        ),
    ]
