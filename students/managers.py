from django.db.models import Manager


class StudentManager(Manager):

    def all(self):
        return self.get_queryset()


class MedicalRecordManager(Manager):

    def all(self):
        return self.get_queryset()


class MedicationManager(Manager):

    def all(self):
        return self.get_queryset()
