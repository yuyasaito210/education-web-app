from django import forms
from django.contrib import admin
from django.contrib.auth import password_validation
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (AccountProfile, AccountProfileAddress, Insurance, School,
                     SchoolAddress, SchoolNote, SchoolFile)
from .forms import SchoolFileUploadForm


class AccountProfileCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required fields, plus a repeated password."""

    password1 = forms.CharField(
        help_text=password_validation.password_validators_help_text_html(),
        label=_('Password'),
        strip=False,
        widget=forms.PasswordInput
    )
    password2 = forms.CharField(
        help_text=_('Enter the same password as before, for verification.'),
        label=_('Password confirmation'),
        strip=False,
        widget=forms.PasswordInput
    )

    class Meta:
        fields = ['email', ]

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError('Passwords don\'t match')
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(AccountProfileCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class AccountProfileAddressInline(admin.TabularInline):
    model = AccountProfileAddress
    classes = ['collapse']
    verbose_name_plural = 'Street Addresses'
    exclude = ('created', 'modified')
    extra = 0


class AccountProfileAdmin(BaseUserAdmin):

    add_form = AccountProfileCreationForm
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        if not obj:
            kwargs['form'] = AccountProfileCreationForm
        return super(AccountProfileAdmin, self).get_form(request, obj, **kwargs)

    inlines = [
        AccountProfileAddressInline,
    ]

    def get_formsets_with_inlines(self, request, obj=None):
        for inline in self.get_inline_instances(request, obj):
            # hide MyInline in the add view
            if isinstance(inline, AccountProfileAddressInline) and obj is None:
                continue
            yield inline.get_formset(request, obj), inline

    search_fields = (
        'email',
        'name',
        'phone',
        'title',
        'stripe_customer_id',
        'guid'
    )
    list_filter = ('is_active', 'is_superuser', 'is_staff', 'account_type')
    list_display = (
        'email',
        'name',
        'account_type',
        'title',
        'stripe_customer_id',
        'is_active',
        'modified'
    )
    readonly_fields = [
        'guid',
        'date_joined',
        'modified',
        'last_login',
        'stripe_customer_id',
        'slug'
    ]
    filter_horizontal = ('assoc_school_list',)
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name',
                'email',
                'phone',
                'account_type',
                'classroom',
                'assoc_school_list'
            )
        }),
        ('Public Profile', {
            'classes': ('collapse',),
            'fields': (
                'title',
                'profile_photo',
                'profile_icon',
                'bio'
            )
        }),
        ('System Settings', {
            'classes': ('collapse',),
            'fields': (
                'assoc_location_list',
                'rank',
                'user_permissions',
                'groups',
                'slug',
                'stripe_customer_id',
                'guid',
                'is_active',
                'is_superuser',
                'is_staff',
                'date_joined',
                'last_login',
                'modified',
                'password'
            )
        })
    )


class SchoolAddressInline(admin.TabularInline):
    model = SchoolAddress
    verbose_name_plural = "Street Addresses"
    exclude = ('created', 'modified')
    extra = 0


class SchoolNoteInline(admin.TabularInline):
    model = SchoolNote
    verbose_name_plural = "Notes & correspondence"
    exclude = ('note_type', 'guid')
    readonly_fields = ('created', 'modified', 'author')
    extra = 0


class SchoolFileInline(admin.TabularInline):
    model = SchoolFile
    form = SchoolFileUploadForm
    verbose_name_plural = "Files & correspondence"
    extra = 0


class SchoolAdmin(admin.ModelAdmin):
    search_fields = (
        'name',
        'phone',
        'guid',
        'email_whitelist'
    )
    list_filter = ('is_active', 'school_type')
    list_display = (
        'name',
        'phone',
        'is_active',
        'school_type',
        'created',
        'modified'
    )
    readonly_fields = ['guid', 'created', 'modified', 'slug']
    inlines = [
        SchoolAddressInline,
        SchoolNoteInline,
        SchoolFileInline
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name',
                'phone',
                'school_type'
                # 'legacy_school_id',
                # 'legacy_contact'
            )
        }),
        ('System Settings', {
            'classes': ('collapse',),
            'fields': (
                'email_whitelist',
                'slug',
                'guid',
                'is_active',
                'created',
                'modified'
            )
        })
    )

    def save_formset(self, request, form, formset, change):
        formset.save()
        for f in formset.forms:
            obj = f.instance
            # Only SchoolNote has 'author' field
            if hasattr(obj, 'author'):
                obj.author = request.user
                obj.save()


class StudentInline(admin.TabularInline):
    model = Insurance.dependents_list.through
    verbose_name_plural = "Dependents"
    exclude = ('created', 'modified')
    extra = 0


class InsuranceAdmin(admin.ModelAdmin):
    search_fields = (
        'company_name',
        'policy_num',
        'group_num',
        'holder_name'
    )
    list_filter = ('is_active',)
    list_display = (
        'company_name',
        'policy_num',
        'group_num',
        'holder_name',
        'is_active',
        'modified'
    )
    readonly_fields = ['guid', 'created', 'modified']
    inlines = [
        StudentInline,
    ]
    fieldsets = (
        ('Insurance Detail', {
            'fields': (
                'account',
                'holder_name',
                'company_name',
                'policy_num',
                'group_num',
            )
        }),
        ('System Settings', {
            'classes': ('collapse',),
            'fields': (
                'guid',
                'is_active',
                'created',
                'modified'
            )
        })
    )


admin.site.register(AccountProfile, AccountProfileAdmin)
admin.site.register(School, SchoolAdmin),
admin.site.register(Insurance, InsuranceAdmin)
