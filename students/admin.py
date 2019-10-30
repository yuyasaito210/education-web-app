from django.contrib import admin
from django.utils.html import format_html

from .models import MedicalRecord, Medication, Student, StudentNote, AdministeredMed


class StudentNoteInline(admin.TabularInline):
    model = StudentNote
    verbose_name_plural = 'Notes'
    exclude = ('created', 'modified')
    classes = ['collapse']
    readonly_fields = ('guid', )
    extra = 1


class MedicalRecordInline(admin.TabularInline):
    model = MedicalRecord
    verbose_name_plural = 'Medical Record'
    exclude = ('created', 'modified')
    classes = ['collapse']
    readonly_fields = ('guid', )
    extra = 1


class MedicationInline(admin.TabularInline):
    model = Medication
    verbose_name_plural = 'Medication'
    exclude = ('created', 'modified')
    classes = ['collapse']
    readonly_fields = ('guid', )
    extra = 0


class StudentAdmin(admin.ModelAdmin):
    filter_horizontal = ('guardian_list',)
    search_fields = (
        'name',
        'guid'
    )
    list_filter = (
        'created',
        'modified',
        'photo_waiver',
        'is_active',
        'classroom',
        'current_school'
    )
    list_display = (
        'name',
        'current_school',
        'classroom',
        'dob',
        'photo_waiver',
        'waiver_agreement',
        'is_active',
        'modified'
    )
    inlines = [
        MedicalRecordInline,
        StudentNoteInline,
    ]
    readonly_fields = ['guid', 'created', 'modified']
    fieldsets = (
        ('', {
            'fields': (
                'name',
                'is_active',
                'modified',
                'dob',
                'photo_waiver',
                'waiver_agreement',
                'current_school',
                'classroom',
                'guardian_list'
            )
        }),
        ('Additional Details', {
            'classes': ('collapse',),
            'fields': (
                'created',
                'guid'
            )
        })
    )


class MedicalRecordAdmin(admin.ModelAdmin):
    search_fields = (
        'non_rx_notes',
        'restrictions',
        'allergies_expanded',
        'recent_trauma',
        'dietary_needs',
        'guid'
    )
    list_filter = (
        'non_rx_type',
        'allergies',
        'food_allergens',
        'last_tetanus',
        'no_tetanus_vaccine',
        'dietary_caution',
        'created',
        'modified'
    )
    list_display = (
        'student',
        'get_allergies_display',
        'medication_count',
        'non_rx_type',
        'last_tetanus',
        'gender',
        'height',
        'weight',
        'modified'
    )
    readonly_fields = ['guid', 'created', 'modified']
    list_max_show_all = 500
    list_per_page = 230
    inlines = [MedicationInline, ]

    def medication_count(self, obj):
        total_count = obj.medication_set.all().count()
        if total_count > 0:
            return total_count
        return None

    def get_allergies_display(self, obj):
        # return format_html("{0}", w.lb)
        allergies_display = ''
        food_allergens_display = ''
        if obj.allergies:
            allergies_display = "<strong>Allergies</strong>: %s" % obj.get_allergies_display()
        if obj.food_allergens:
            food_allergens_display = "<br /><strong>Food Allergens</strong>: %s" % obj.get_food_allergens_display()

        if obj.allergies or obj.food_allergens:
            return format_html(allergies_display + food_allergens_display)
        return None

    medication_count.short_description = 'Medications'
    get_allergies_display.short_description = 'Allergies'
    get_allergies_display.allow_tags = True


class MedicationAdmin(admin.ModelAdmin):
    search_fields = ('medication_name', 'guid', 'notes')
    list_display = (
        'get_student_name',
        'medication_name',
        'in_possession',
        'administration_times',
        'administration_times_other',
        'amount',
        'amount_human',
        'amount_unit',
        'modified'
    )
    readonly_fields = ['guid', 'created', 'modified']

    def get_student_name(self, obj):
        return '%s' % obj.medical_record.student.name
    get_student_name.admin_order_field = 'medical_record__student__name'  # Allows column order sorting
    get_student_name.short_description = 'Student'  # Renames column head


admin.site.register(Student, StudentAdmin)
admin.site.register(MedicalRecord, MedicalRecordAdmin)
admin.site.register(Medication, MedicationAdmin)
admin.site.register(AdministeredMed)
