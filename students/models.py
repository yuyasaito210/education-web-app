# -*- coding: utf-8 -*-

from __future__ import unicode_literals
from gettext import gettext as _
import uuid
from encrypted_model_fields.fields import EncryptedCharField, EncryptedDateField

from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from nameparser import HumanName
from multiselectfield import MultiSelectField

from .managers import StudentManager, MedicalRecordManager, MedicationManager


@python_2_unicode_compatible
class Student(models.Model):
    """A Student is anyone who attends NCI and/or NCM."""

    CLASSROOM_CHOICES = (
        (1, '1st Grade'),
        (2, '2nd Grade'),
        (3, '3rd Grade'),
        (4, '4th Grade'),
        (5, '5th Grade'),
        (6, '6th Grade'),
        (7, '7th Grade'),
        (8, '8th Grade'),
        (13, '9th Grade'),
        (14, '10th Grade'),
        (15, '11th Grade'),
        (16, '12th Grade'),
        (9, 'Children\'s house'),
        (10, 'Lower Elementary'),
        (11, 'Upper Elementary'),
        (12, 'Adolescent')
    )

    guardian_list = models.ManyToManyField(
        'accounts.AccountProfile',
        blank=True,
        limit_choices_to=(models.Q(account_type__gte=1))
    )

    current_school = models.ForeignKey('accounts.School', blank=True, null=True)
    classroom = models.IntegerField(blank=True, null=True, choices=CLASSROOM_CHOICES)

    name = EncryptedCharField(max_length=255)
    dob = EncryptedDateField(blank=True, null=True, help_text="Format: MM-DD-YYYY")

    photo_waiver = models.NullBooleanField(_('Photo Waiver Permission'), default=True)
    waiver_agreement = models.NullBooleanField(_('Waiver Agreement'), default=False)
    medical_agreement = models.NullBooleanField(_('Medical Agreement'), default=True)

    legacy_student_id = models.IntegerField(_('Legacy Student ID'), blank=True, null=True)
    legacy_account_id = models.IntegerField(_('Legacy Account ID'), blank=True, null=True)
    legacy_class_id = models.IntegerField(_('Legacy Classroom ID'), blank=True, null=True)

    guid = models.CharField(max_length=140)
    created = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified = models.DateTimeField(_('Last Updated'), auto_now=True, null=True)

    is_active = models.BooleanField(default=True)

    objects = StudentManager()

    class Meta:
        verbose_name = _('Student')
        verbose_name_plural = _('Students')

    def __str__(self):
        return self.name

    def get_short_guid(self):
        return self.guid[:5]

    def get_first_name(self):
        i = HumanName(self.name)
        return i.first.capitalize()

    def get_last_name(self):
        i = HumanName(self.name)
        return i.last.capitalize()

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(Student, self).save(*args, **kwargs)


class StudentNote(models.Model):
    """Notes attached to a Student."""

    student = models.ForeignKey(Student)
    staff = models.ForeignKey('accounts.AccountProfile', verbose_name='Author of note')

    NOTE_TYPE_CHOICES = (
        (0, 'General Note'),
        (1, 'Accident Report')
    )
    note_type = models.IntegerField(
        blank=True, null=True, choices=NOTE_TYPE_CHOICES, default=1
    )

    location_desc = models.TextField(_('Accident Location'), blank=True)
    action_desc = models.TextField(_('Accident Action'), blank=True)
    note = models.TextField(_('Accident Description'), blank=True)
    after_action_desc = models.TextField(_('After Accident'), blank=True)

    parent_contacted = models.BooleanField(default=False)
    parent_contacted_time = models.DateTimeField(blank=True, null=True)
    parent_response = models.TextField(blank=True)

    referred_physician = models.BooleanField(default=False)
    physician_called = models.BooleanField(default=False)
    ambulance_called = models.BooleanField(default=False)

    guid = models.CharField(max_length=140)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        verbose_name = _('Student Note')
        verbose_name_plural = _('Student Notes')

    def __str__(self):
        return 'Note for %s' % self.student

    def get_short_guid(self):
        return self.guid[:5]

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(StudentNote, self).save(*args, **kwargs)


@python_2_unicode_compatible
class MedicalRecord(models.Model):
    """A Students Medical Record."""

    GENDER_CHOICES = (
        (1, 'Female'),
        (2, 'Male'),
        (3, 'Gender fluid'),
        (4, 'Non-binary / Third gender'),
        (5, 'Prefer to self-describe'),
        (6, 'Prefer not to say')
    )

    NON_RX_TYPE_CHOICES = (
        (1, 'None'),
        (2, 'Tylenol'),
        (3, 'Ibuprofen'),
        (4, 'Ibuprofen or Tylenol')
    )

    ALLERGY_CHOICES = (
        (1, 'Food Allergy'),
        (2, 'Skin Allergy'),
        (3, 'Dust Allergy'),
        (4, 'Insect Sting Allergy'),
        (5, 'Pet Allergies'),
        (6, 'Eye Allergy'),
        (7, 'Drug Allergies'),
        (8, 'Allergic Rhinitis (hay fever)'),
        (9, 'Latex Allergy'),
        (10, 'Mold Allergy'),
        (11, 'Pollen Allergy'),
        (12, 'Sinus Infection'),
        (13, 'Other (please specify)')
    )

    FOOD_ALLERGEN_CHOICES = (
        (1, 'Milk'),
        (2, 'Eggs'),
        (3, 'Peanuts'),
        (4, 'Soy'),
        (5, 'Wheat'),
        (6, 'Tree nuts'),
        (7, 'Fish'),
        (8, 'Shellfish'),
        (9, 'Other (please specify)')
    )

    # OneToOneField restricts relation to a single related object
    student = models.OneToOneField('Student')

    gender = models.IntegerField(blank=True, null=True, choices=GENDER_CHOICES)
    height = models.CharField(max_length=25, blank=True, null=True)
    weight = models.CharField(max_length=25, blank=True, null=True)

    non_rx_type = models.IntegerField(blank=True, null=True, choices=NON_RX_TYPE_CHOICES)
    non_rx_notes = models.TextField(blank=True)

    last_tetanus = models.DateField(blank=True, null=True)
    no_tetanus_vaccine = models.BooleanField(default=False)

    restrictions = models.TextField(blank=True)
    allergies_expanded = models.TextField(blank=True)
    recent_trauma = models.TextField(blank=True)
    dietary_needs = models.TextField(blank=True)
    dietary_caution = models.BooleanField(default=False)

    allergies = MultiSelectField(
        choices=ALLERGY_CHOICES,
        max_length=75,
        blank=True
    )
    food_allergens = MultiSelectField(
        choices=FOOD_ALLERGEN_CHOICES,
        max_length=75,
        blank=True
    )

    guid = models.CharField(max_length=140)
    created = models.DateTimeField(editable=False, auto_now_add=True, null=True)
    modified = models.DateTimeField(blank=True, auto_now=True, null=True)

    objects = MedicalRecordManager()

    class Meta:
        verbose_name = _('Medical Record')
        verbose_name_plural = _('Medical Records')

    def __str__(self):
        return 'Medical Report for %s' % self.student.name

    def get_short_guid(self):
        return self.guid[:5]

    def has_allergies(self):
        if len(list(map(int, self.allergies))) > 0:
            return True
        else:
            return False

    def has_food_allergens(self):
        if 1 in list(map(int, self.allergies)):
            return True
        if (len(list(map(int, self.food_allergens))) > 0) or self.dietary_needs:
            return True
        return False

    def has_dietary_restriction(self):
        if self.has_food_allergens or self.dietary_needs or self.dietary_caution:
            return True
        return False

    def allergen_count(self):
        if len(self.allergies) > 0:
            return len(list(map(int, self.allergies)))
        return 0

    def food_allergen_count(self):
        if len(self.food_allergens) > 0:
            return len(list(map(int, self.food_allergens)))
        return 0

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(MedicalRecord, self).save(*args, **kwargs)


@python_2_unicode_compatible
class Medication(models.Model):
    """Medications to be administered to Students."""

    AMOUNT_UNIT_CHOICES = (
        (1, 'Tablet'),
        (9, 'Lozenge'),
        (10, 'Pastilles'),
        (2, 'Spray'),
        (3, 'Puff'),
        (4, 'Gummy'),
        (13, 'Drop'),
        (5, 'Tbsp.'),
        (6, 'tsp.'),
        (14, 'mL'),
        (12, 'milligrams mg'),
        (7, 'oz'),
        (11, 'micrograms mcg (μg)'),
        (8, 'as needed')
    )

    RX_ADMIN_TIME_CHOICES = (
        (1, 'Breakfast'),
        (2, 'Lunch'),
        (3, 'Dinner'),
        (4, 'Bedtime'),
        (5, 'Other...')
    )

    administration_times = MultiSelectField(
        choices=RX_ADMIN_TIME_CHOICES,
        max_length=25,
        blank=True
    )
    administration_times_other = models.CharField(
        _('Specify other administration time(s)'),
        max_length=255,
        blank=True
    )

    medication_name = models.CharField(_('Name of Medication'), max_length=140)

    in_possession = models.BooleanField(_('NCI has possession'), default=False)

    amount = models.IntegerField(blank=True, null=True)
    amount_human = models.CharField(blank=True, null=True, max_length=75)
    amount_unit = models.IntegerField(blank=True, null=True, choices=AMOUNT_UNIT_CHOICES)

    notes = models.TextField(blank=True)

    medical_record = models.ForeignKey(MedicalRecord)

    legacy_medication_id = models.IntegerField(blank=True, null=True)
    legacy_dosage = models.CharField(_('Dosage (legacy)'), max_length=255, blank=True)
    legacy_breakfast = models.BooleanField(default=False)
    legacy_lunch = models.BooleanField(default=False)
    legacy_dinner = models.BooleanField(default=False)
    legacy_bedtime = models.BooleanField(default=False)
    legacy_other = models.BooleanField(default=False)
    legacy_othertime = models.CharField(_('Other time'), max_length=255, blank=True)

    guid = models.CharField(max_length=140)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    objects = MedicationManager()

    class Meta:
        verbose_name = _('Medication')
        verbose_name_plural = _('Medications')

    def __str__(self):
        return '%s for %s' % (
            self.medication_name,
            self.medical_record.student.name
        )

    def get_short_guid(self):
        return self.guid[:5]

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(Medication, self).save(*args, **kwargs)


@python_2_unicode_compatible
class AdministeredMed(models.Model):
    """The logging of a medication administarted to a student."""

    medication = models.ForeignKey(Medication)
    field_trip = models.ForeignKey('locations.FieldTrip')
    administered_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)

    guid = models.CharField(max_length=140)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        verbose_name = _('Administered Medication')
        verbose_name_plural = _('Administered Medications')

    def __str__(self):
        med = self.medication
        return '%s administered to student' % (med.medication_name)

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(AdministeredMed, self).save(*args, **kwargs)
