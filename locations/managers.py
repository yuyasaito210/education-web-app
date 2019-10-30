from django.db.models import Manager
from django.utils import timezone

from dateutil.relativedelta import MO, relativedelta

from djnci.utils import week_range


class LocationManager(Manager):

    def ee_locations_only(self):
        return self.get_queryset().filter(location_type='EE')

    def all(self):
        return self.get_queryset()


class FieldTripManager(Manager):

    def open_registration(self):
        """Return field trips currently observing open registration."""
        today = timezone.now()
        return self.get_queryset().filter(is_enabled=True, reg_start_date__lte=today, reg_end_date__gte=today)

    def previous(self):
        """Return field trips from the past; last week and before."""
        last_monday = timezone.now() - relativedelta(weekday=MO(-1))
        return self.get_queryset().filter(is_enabled=True, start_date__lt=last_monday)

    def now(self):
        """Return field trips happening this week."""
        return self.get_queryset().filter(is_enabled=True, start_date__range=week_range(timezone.now()))

    def upcoming(self):
        """Return field trips that start next week and beyond."""
        next_monday = timezone.now().date() + relativedelta(weekday=MO)
        return self.get_queryset().filter(is_enabled=True, start_date__gte=next_monday)

    def all(self):
        """Return every field trip on-file."""
        return self.get_queryset()
