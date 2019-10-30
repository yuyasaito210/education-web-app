# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import uuid
from gettext import gettext as _
from nameparser import HumanName

import usaddress
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.template.defaultfilters import slugify
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from django.utils.deconstruct import deconstructible

from .managers import AccountProfileManager
from djnci.utils import path_and_rename


class AccountProfile(AbstractBaseUser, PermissionsMixin):

    CLASSROOM_CHOICES = (
        (1, 'Children\'s house'),
        (2, 'Lower Elementary'),
        (3, 'Upper Elementary'),
        (4, 'Adolescent')
    )

    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
        db_index=True
    )

    name = models.CharField(_('School, Business or Full Name'), max_length=255, blank=True)
    slug = models.SlugField(max_length=140, blank=True)

    phone = models.CharField(max_length=30, blank=True)
    title = models.CharField(max_length=75, blank=True)
    bio = models.TextField(_('Profile Bio'), blank=True)

    profile_photo = models.ImageField(_('Profile Photo'), upload_to='contact-photos', blank=True)
    profile_icon = models.ImageField(_('Profile Icon'), upload_to='contact-icons', blank=True)

    stripe_customer_id = models.CharField(_('Stripe Customer ID'), blank=True, max_length=255)

    ACCOUNT_TYPE_CHOICES = (
        ('parent', 'Parent/Guardian'),
        ('teacher', 'Teacher'),
        ('school', 'School'),
        ('ee-staff', 'EE Staff'),
    )
    account_type = models.CharField(_('Account Type'), blank=True, null=True, max_length=25, choices=ACCOUNT_TYPE_CHOICES)
    classroom = models.IntegerField(
        _('Classroom'),
        blank=True,
        null=True,
        choices=CLASSROOM_CHOICES, 
        help_text=_('If this user is a Teacher or affilated with one of their schools classrooms, which is it?')
    )

    assoc_location_list = models.ManyToManyField('locations.Location', blank=True, related_name='contact_assoc_location_list')
    assoc_school_list = models.ManyToManyField('accounts.School', blank=True, related_name='account_assoc_school_list')

    # Legacy MontessoriNCI DB Fields
    legacy_user_id = models.IntegerField(_('User ID (Legacy Portal)'), blank=True, null=True)
    legacy_username = models.CharField(_('Username (Legacy Portal)'), blank=True, max_length=75)
    legacy_school_id = models.IntegerField(_('School ID (Legacy Portal)'), blank=True, null=True)
    legacy_contact = models.CharField(_('Contact Name (Legacy Portal)'), blank=True, max_length=75)

    guid = models.CharField(max_length=140, blank=True)
    rank = models.IntegerField(_('Sort order'), blank=True, null=True)

    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active.'
            'Unselect this instead of deleting accounts.'
        )
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this site.')
    )
    is_superuser = models.BooleanField(
        _('superuser'),
        default=False,
        help_text=_(
            'Designates that this user has all permissions without explicitly assigning them.'
        )
    )

    date_joined = models.DateTimeField(default=timezone.now, null=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    username = models.CharField(blank=True, max_length=30, verbose_name='username')
    first_name = models.CharField(blank=True, max_length=30, verbose_name='first name')
    last_name = models.CharField(blank=True, max_length=30, verbose_name='last name')

    USERNAME_FIELD = 'email'

    objects = AccountProfileManager()

    class Meta:
        verbose_name = _('Account Profile')
        verbose_name_plural = _('Account Profiles')

    def __str__(self):
        if self.name:
            return '%s (%s)' % (self.name, self.email)
        return self.email

    def get_full_name(self):
        return self.email

    def get_first_name(self):
        i = HumanName(self.name)
        if i.first:
            return i.first.capitalize()
        return None

    def get_last_name(self):
        i = HumanName(self.name)
        if i.last:
            return i.last.capitalize()
        return None

    def get_short_name(self):
        return self.email

    def is_nci_montessori(self):
        # id '50' = Nature's Classroom Montessori (Mukwonago)
        if self.assoc_school_list.filter(id=50):
            return True
        return False

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        self.slug = slugify(self.name)
        super(AccountProfile, self).save(*args, **kwargs)


class AccountProfileAddress(models.Model):
    """Address to get in touch with Contacts."""

    street_address = models.TextField(_('Street Address'))
    contact = models.ForeignKey(AccountProfile)
    is_billing = models.BooleanField(default=False)

    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        verbose_name = _('Address')
        verbose_name_plural = _('Addresses')

    def get_address_city(self):
        return usaddress.tag(self.street_address)[0]['PlaceName']

    def get_address_state(self):
        return usaddress.tag(self.street_address)[0]['StateName']

    def __str__(self):
        return self.street_address


class School(models.Model):

    SCHOOL_TYPE_CHOICES = (
        ('public', 'Public School'),
        ('montessori', 'Montessori School')
    )

    name = models.CharField(_('Name of School'), max_length=140)
    slug = models.SlugField(max_length=140, blank=True)

    phone = models.CharField(max_length=30, blank=True)

    school_type = models.CharField(choices=SCHOOL_TYPE_CHOICES, default="public", max_length=15)

    # Legacy MontessoriNCI DB Fields
    legacy_school_id = models.IntegerField(_('School ID (Legacy Portal)'), blank=True, null=True)
    legacy_contact = models.CharField(_('Contact Name (Legacy Portal)'), blank=True, max_length=75)

    email_whitelist = models.TextField(
        _('Email Whitelist'),
        blank=True,
        help_text=_('Comma-separated list of teacher email addresses pre-approved to access this school.')
    )

    guid = models.CharField(max_length=140)
    is_active = models.BooleanField(default=True)

    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        verbose_name = _('School')
        verbose_name_plural = _('Schools')
        ordering = ['name', ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        self.slug = slugify(self.name)
        super(School, self).save(*args, **kwargs)


class SchoolAddress(models.Model):
    """Address to get in touch with Contacts."""

    street_address = models.TextField(_('Street Address'))
    school = models.ForeignKey(School)

    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        verbose_name = _('School Address')
        verbose_name_plural = _('School Addresses')

    def get_address_city(self):
        return usaddress.tag(self.street_address)[0]['PlaceName']

    def get_address_state(self):
        return usaddress.tag(self.street_address)[0]['StateName']

    def __str__(self):
        return self.street_address


class SchoolNote(models.Model):
    """Notes attached to a School."""

    school = models.ForeignKey(School)
    author = models.ForeignKey('accounts.AccountProfile', verbose_name='Author of note', blank=True, null=True)

    NOTE_TYPE_CHOICES = (
        (0, 'General'),
        (1, 'Billing & Payments'),
        (2, 'Phone call')
    )
    note_type = models.IntegerField(
        blank=True, null=True, choices=NOTE_TYPE_CHOICES, default=0
    )

    message = models.TextField(blank=True)

    guid = models.CharField(max_length=140, blank=True)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        verbose_name = _('School Note')
        verbose_name_plural = _('School Notes')

    def __str__(self):
        return 'Note for %s' % self.school

    def get_short_guid(self):
        return self.guid[:5]

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(SchoolNote, self).save(*args, **kwargs)


class SchoolFile(models.Model):
    """File attached to a School."""

    PUBLIC_CHOICES = (
        (0, 'Private'),
        (1, 'Public'),
    )

    school = models.ForeignKey(School, related_name='school_files', on_delete=models.CASCADE)
    file = models.FileField(upload_to=path_and_rename, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])])
    file_name = models.CharField(max_length=140, blank=False, default='')
    is_public = models.IntegerField(blank=False, default=0, choices=PUBLIC_CHOICES)

    class Meta:
        verbose_name = _('School File')
        verbose_name_plural = _('School Files')

    def __str__(self):
        return 'File for %s' % self.school

    def save(self, *args, **kwargs):
        super(SchoolFile, self).save(*args, **kwargs)



class Insurance(models.Model):
    company_name = models.CharField(_('Name of Insurance Company'), max_length=75, blank=True)
    policy_num = models.CharField(_('Policy #'), max_length=25, blank=True)
    group_num = models.CharField(_('Group #'), max_length=25, blank=True)
    holder_name = models.CharField(_('Policy Holder\'s Name'), max_length=75, blank=True)

    account = models.ForeignKey(AccountProfile, null=True, blank=True)
    dependents_list = models.ManyToManyField('students.Student', blank=True, related_name='insurance_dependents_list')

    guid = models.CharField(max_length=140)
    is_active = models.BooleanField(default=True)

    created = models.DateTimeField(editable=False, auto_now_add=True)
    modified = models.DateTimeField(blank=True, auto_now=True)

    class Meta:
        verbose_name = _('Insurance Provider')
        verbose_name_plural = _('Insurance Providers')
        ordering = ['company_name', ]

    def __str__(self):
        return self.company_name

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        super(Insurance, self).save(*args, **kwargs)
