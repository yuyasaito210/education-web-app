# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-10-05 14:11
from __future__ import unicode_literals
from dateutil.parser import parse

from django.db import migrations, models
from encrypted_model_fields.fields import EncryptedDateField, EncryptedCharField


app_with_model = 'students'
model_with_column = 'Student'


def replicate_to_temporary(apps, schema_editor):
    model = apps.get_model(app_with_model, model_with_column)
    for row in model.objects.all():
        setattr(row, 'temp_name', getattr(row, 'name', None))
        setattr(row, 'temp_dob', None if getattr(row, 'dob') is None else getattr(row, 'dob'))
        setattr(row, 'name', '')
        setattr(row, 'dob', None)
        row.save(update_fields=['temp_name', 'name', 'temp_dob', 'dob'])


def replicate_to_real(apps, schema_editor):
    model = apps.get_model(app_with_model, model_with_column)
    for row in model.objects.all():
        setattr(row, 'name', getattr(row, 'temp_name', None))
        setattr(row, 'dob', getattr(row, 'temp_dob', None))
        row.save(update_fields=['name', 'dob'])


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0027_auto_20180819_1047'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='temp_dob',
            field=models.DateField(verbose_name='Temp dob', null=True, blank=True, help_text='Format: MM-DD-YYYY'),
        ),
        migrations.AddField(
            model_name='student',
            name='temp_name',
            field=models.CharField(null=True, max_length=255, verbose_name='Full Name'),
        ),
        migrations.AlterField(
            model_name='student',
            name='name',
            field=models.CharField(null=True, max_length=255, verbose_name='Full Name'),
        ),
        migrations.RunPython(replicate_to_temporary),
        migrations.AlterField(
            model_name='student',
            name='dob',
            field=EncryptedDateField(verbose_name='dob', null=True, blank=True, help_text='Format: MM-DD-YYYY'),
        ),
        migrations.AlterField(
            model_name='student',
            name='name',
            field=EncryptedCharField(null=True, max_length=255, verbose_name='Full Name'),
        ),
        migrations.RunPython(replicate_to_real),
        migrations.RemoveField(model_name='student', name='temp_dob'),
        migrations.RemoveField(model_name='student', name='temp_name'),
        migrations.AlterField(
            model_name='student',
            name='name',
            field=models.CharField(null=False, max_length=255, verbose_name='Full Name'),
        )
    ]
