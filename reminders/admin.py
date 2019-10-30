from django.contrib import admin

from .models import Reminder, ReminderTemplates


class ReminderAdmin(admin.ModelAdmin):
    search_fields = ('name', 'email')
    list_filter = ('sent', 'send_date')


admin.site.register(Reminder, ReminderAdmin)
admin.site.register(ReminderTemplates)
