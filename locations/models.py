# -*- coding: utf-8 -*-
"""Data models for Nature's Classroom Physical Locations."""

import uuid

import usaddress
from django.db import models
# from django.utils import timezone
# from django.db.models import Count
from django.template.defaultfilters import slugify

from jsonfield import JSONField

from students.models import MedicalRecord, StudentNote
from .managers import LocationManager, FieldTripManager


class Location(models.Model):
    """A Location represents a physical NCI Location."""

    LOCATION_TYPE_CHOICES = (
        ('NONE', 'None'),
        ('EE', 'Environmental Education'),
        ('MS', 'Montessori School'),
    )

    name = models.CharField(max_length=140)
    slug = models.SlugField(max_length=140, blank=True)
    short_name = models.CharField(max_length=140, blank=True)

    location_type = models.CharField(blank=True, null=True, max_length=4, choices=LOCATION_TYPE_CHOICES)
    address = models.TextField(blank=True)
    address_url = models.URLField(
        blank=True,
        help_text="If provided, the street address will click-through to this \
                    URL. Usually a Google Maps URL."
    )
    phone = models.CharField(max_length=25, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    open_enrollment = models.BooleanField(default=False)
    fact_sheet_file = models.FileField(blank=True, upload_to='locations/fact-sheets')
    floor_plan_file = models.FileField(blank=True, upload_to='locations/floor-plans')
    food_menu_file = models.FileField(blank=True, upload_to='locations/food-menus')

    open_graph_image = models.FileField(blank=True, upload_to='locations/open-graph-images')
    open_graph_desc = models.TextField(blank=True)

    hero_image = models.FileField(blank=True, upload_to='locations/hero-images')
    bg_image = models.FileField(blank=True, upload_to='bg-images')
    body = models.TextField(blank=True)
    sidebar_json = JSONField(blank=True, null=True)

    primary_contact = models.ForeignKey(
        'accounts.AccountProfile',
        # TODO should me limit choices to those accoutns who'se association list includes this location
        # https://stackoverflow.com/questions/7133455/django-limit-choices-to-doesnt-work-on-manytomanyfield
        limit_choices_to={'account_type': 'ee-staff'},
        blank=True,
        null=True
    )

    rank = models.IntegerField(blank=True, null=True)
    guid = models.CharField(max_length=140)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    objects = LocationManager()

    class Meta:
        ordering = ['rank', ]

    def get_address_city(self):
        return usaddress.tag(self.address)[0]['PlaceName']

    def get_address_state(self):
        return usaddress.tag(self.address)[0]['StateName']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """On save, update timestamps."""
        if not self.guid:
            self.guid = str(uuid.uuid4())
        self.slug = slugify(self.name)
        super(Location, self).save(*args, **kwargs)


class Building(models.Model):
    """A Building represents a physical building at a particular location."""

    name = models.CharField(max_length=140)
    location = models.ForeignKey(Location)
    schema = JSONField(blank=True, null=True)
    uischema = JSONField(blank=True, null=True)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    def __str__(self):
        return '%s (%s)' % (self.name, self.location.name)


class VisitSubmission(models.Model):
    PREFERRED_TIME_CHOICES = (
        (1, 'Classroom Observation'),
        (2, 'During off hours')
    )
    preferred_time = models.IntegerField(blank=True, null=True, choices=PREFERRED_TIME_CHOICES)

    LOCATION_CHOICES = (
        (1, 'Children\'s House (Ages 3-6)'),
        (2, 'Lower Elementary (Ages 6-9)'),
        (3, 'Upper Elementary (Ages 9-12)'),
        (4, 'Adolescent (Ages 12-15)'),
        (5, 'Angelus Oaks, California'),
        (6, 'Pescadero, California'),
        (7, 'Bruceville, Texas'),
        (8, 'New Ulm, Texas'),
        (9, 'Lake Geneva, Wisconsin'),
        (10, 'Parrish, Florida'),
        (11, 'Brooksville, Florida')
    )
    location = models.IntegerField(blank=True, null=True, choices=LOCATION_CHOICES)

    personal_name = models.CharField(max_length=140)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=15)
    comments = models.TextField(blank=True)

    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        get_latest_by = 'created'
        ordering = ['-created']


class FieldTrip(models.Model):
    """FieldTrip represent field trips/camps at a specific location."""

    customer_list = models.ManyToManyField('accounts.AccountProfile', blank=True)
    building_list = models.ManyToManyField('locations.Building', blank=True)
    student_list = models.ManyToManyField('students.Student', blank=True,
                                          help_text="When Parents register their children, those registrations will show up here. You normally do not have to touch this field but is provided so you can manually add/remove students.")
    school_list = models.ManyToManyField('accounts.School', blank=True,
                                         help_text="Select the school(s) that will be attending this field trip.")
    location = models.ForeignKey(Location, blank=True, null=True, related_name='+')
    assignment = JSONField(blank=True, null=True)
    name = models.CharField(max_length=140, blank=True,
                            help_text="Not required, used interally (Parents and Teachers do not see this).")
    reg_start_date = models.DateTimeField(blank=True, null=True)
    reg_end_date = models.DateTimeField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    expected_head_count = models.IntegerField(default=0)
    is_enabled = models.BooleanField(default=False,
                                     help_text="Only enabled Field Trips will be visible on the site and portal.")
    guid = models.CharField(max_length=140)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    legacy_fieldtrip_id = models.IntegerField(blank=True, null=True)
    legacy_school_id = models.IntegerField(blank=True, null=True)
    legacy_class_id = models.IntegerField(blank=True, null=True)
    legacy_teacher_id = models.IntegerField(blank=True, null=True)
    legacy_finalized = models.BooleanField(default=False)

    objects = FieldTripManager()

    class Meta:
        get_latest_by = 'start_date'
        ordering = ['start_date']

    def __str__(self):
        if self.name != '':
            return '%s: %s' % (self.get_week_name(), self.name)
        return self.get_week_name()

        # return '%s at %s from %s to %s (%s days)' % (
        #     self.customer_list.first().name,
        #     self.building_list.first().location.name,
        #     self.start_date.strftime('%m/%d/%Y'),
        #     self.end_date.strftime('%m/%d/%Y'),
        #     (self.end_date - self.start_date).days
        # )

    def get_week_name(self):
        if self.start_date:
            week_num = self.start_date.date().isocalendar()[1]
            return 'Week %s' % week_num
        return 'Field Trip w/o set start date'

    def get_total_students(self):
        """Total number of students attending this field trip."""
        return self.student_list.count()

    def get_total_allergens(self):
        """Total number of allergens across all students attending this field trip."""
        total = 0
        for medrec in MedicalRecord.objects.filter(student__in=self.student_list.all()):
            if medrec.allergen_count() > 0:
                total += int(medrec.allergen_count())
        return total

    def get_total_dietary_restrictions(self):
        """Total number of dietary restrictions across all students attending this field trip."""
        total = 0
        for medrec in MedicalRecord.objects.filter(student__in=self.student_list.all()):
            if medrec.food_allergen_count() > 0:
                total += int(medrec.food_allergen_count())
        return total

    def get_total_student_notes(self):
        """Total number of notes across all students attending this field trip."""
        return StudentNote.objects.filter(
            student__in=self.student_list.all(),
            created__gte=self.reg_start_date
        ).count()

    def get_teacher_email_list(self):
        """Return a list of Teacher email addresses associated with this FieldTrip."""
        email_list = []
        for school in self.school_list.all():
            for email in school.email_whitelist.split(','):
                email_list.append(email)
        return email_list

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(FieldTrip, self).save(*args, **kwargs)
