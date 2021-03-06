# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-04-02 20:42
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0024_auto_20180402_1528'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='administeredmed',
            options={'verbose_name': 'Administered Medication', 'verbose_name_plural': 'Administered Medications'},
        ),
        migrations.RenameField(
            model_name='administeredmed',
            old_name='administered_time',
            new_name='administered_at',
        ),
        migrations.RenameField(
            model_name='administeredmed',
            old_name='remarks',
            new_name='notes',
        ),
        migrations.RemoveField(
            model_name='administeredmed',
            name='administered',
        ),
    ]
