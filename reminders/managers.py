from django.db.models import Manager


class ReminderManager(Manager):

    def all(self):
        return self.get_queryset()