# -*- coding: UTF-8 -*-

import ast
# import datetime as dt
from dateutil.parser import parse
from django.conf import settings
# from django.utils import timezone

import graphene
from graphql import GraphQLError
from graphene_django import DjangoObjectType
from graphene_django.converter import convert_django_field

from jsonfield import JSONField
from multiselectfield import MultiSelectField

from djnci.utils import send_html_email
from accounts.models import AccountProfile, School, Insurance
from accounts.schema import InsuranceType
from locations.models import FieldTrip
from .models import AdministeredMed, MedicalRecord, Medication, Student, StudentNote

@convert_django_field.register(JSONField)
def convert_JSONField(field, registry=None):
    return graphene.String()


@convert_django_field.register(MultiSelectField)
def convert_MultiSelectField(field, registry=None):
    return graphene.String()


class StudentType(DjangoObjectType):
    id = graphene.Int()
    first_name = graphene.String()
    last_name = graphene.String()
    classroom = graphene.Int()
    get_classroom_display = graphene.String()
    has_allergies = graphene.String()
    has_food_allergens = graphene.String()
    has_dietary_restriction = graphene.Boolean()
    allergen_count = graphene.Int()
    food_allergen_count = graphene.Int()

    def resolve_first_name(self, _args, *_kwargs):
        return self.get_first_name()

    def resolve_last_name(self, _args, *_kwargs):
        return self.get_last_name()

    def resolve_get_classroom_display(self, _args, *_kwargs):
        return self.get_classroom_display()

    def resolve_has_allergies(self, _args, *_kwargs):
        try:
            return self.medicalrecord.has_allergies()
        except:
            return False

    def resolve_has_food_allergens(self, _args, *_kwargs):
        try:
            return self.medicalrecord.has_food_allergens()
        except:
            return False

    def resolve_has_dietary_restriction(self, _args, *_kwargs):
        try:
            return self.medicalrecord.has_dietary_restriction()
        except MedicalRecord.DoesNotExist:
            return False

    def resolve_allergen_count(self, _args, *_kwargs):
        try:
            return self.medicalrecord.allergen_count()
        except:
            return 0

    def resolve_food_allergen_count(self, _args, *_kwargs):
        try:
            return self.medicalrecord.food_allergen_count()
        except:
            return 0

    class Meta:
        model = Student


class StudentNoteType(DjangoObjectType):
    class Meta:
        model = StudentNote


class MedicalRecordType(DjangoObjectType):
    id = graphene.Int()
    get_non_rx_type_display = graphene.String()
    non_rx_type = graphene.Int()
    non_rx_notes = graphene.String()
    allergies = graphene.String()
    get_allergies_display = graphene.String()
    food_allergens = graphene.String()
    get_food_allergens_display = graphene.String()
    gender = graphene.Int()
    get_gender_display = graphene.String()
    height = graphene.String()
    weight = graphene.String()

    allergen_count = graphene.Int()
    food_allergen_count = graphene.Int()
    has_allergies = graphene.Boolean()
    has_food_allergens = graphene.Boolean()

    def resolve_non_rx_type(self, _args, *_kwargs):
        return self.non_rx_type

    def resolve_get_non_rx_type_display(self, _args, *_kwargs):
        return self.get_non_rx_type_display()

    def resolve_get_allergies_display(self, _args, *_kwargs):
        return self.get_allergies_display()

    def resolve_get_food_allergens_display(self, _args, *_kwargs):
        return self.get_food_allergens_display()

    def resolve_allergies(self, _args, *_kwargs):
        if self.allergies:
            try:
                return list(map(int, self.allergies))
            except:
                return ''.join(str(e) for e in self.allergies)
        else:
            return None

    def resolve_food_allergens(self, _args, *_kwargs):
        # return list(map(int, self.food_allergens))
        if self.food_allergens:
            try:
                return list(map(int, self.food_allergens))
            except:
                return ''.join(str(e) for e in self.food_allergens)
        else:
            return None

    def resolve_get_gender_display(self, _args, *_kwargs):
        return self.get_gender_display()

    def resolve_height(self, _args, *_kwargs):
        if self.height:
            return self.height
            # return float(self.height.inch)
        return None

    def resolve_weight(self, _args, *_kwargs):
        if self.weight:
            return self.weight
            # return str(self.weight.lb)
        return None

    def resolve_has_allergies(self, _args, *_kwargs):
        return self.has_allergies()

    def resolve_has_food_allergens(self, _args, *_kwargs):
        return self.has_food_allergens()

    def resolve_allergen_count(self, _args, *_kwargs):
        return self.allergen_count()

    def resolve_food_allergen_count(self, _args, *_kwargs):
        return self.food_allergen_count()

    class Meta:
        model = MedicalRecord


class MedicationType(DjangoObjectType):
    id = graphene.Int()
    amount_unit = graphene.Int()

    # django-multiselectfield package holds authority of how this field is
    # stored. From their docs:
    # > Stores to the database as a CharField of comma-separated values.
    administration_times = graphene.List(graphene.Int)

    get_amount_unit_display = graphene.String()
    get_administration_times_display = graphene.String()

    def resolve_amount_unit(self, _args, *_kwargs):
        return self.amount_unit

    def resolve_get_amount_unit_display(self, _args, *_kwargs):
        return self.get_amount_unit_display()

    def resolve_administration_times(self, _args, *_kwargs):
        # Our frontend (js) expects this payload to be an array of numbers, so
        # we convert that here so that we dont have to fumble around in js
        #
        # Example:
        #   Incoming: ["1", " ", "", "  ", " 2", " ", "", "  ", " 5"]
        #   Outgoing: [1,2,5]
        #
        return [int(i.strip()) for i in self.administration_times if i and i.strip() != '']

    def resolve_get_administration_times_display(self, _args, *_kwargs):
        return self.get_administration_times_display()

    class Meta:
        model = Medication


class AdministeredMedType(DjangoObjectType):
    class Meta:
        model = AdministeredMed


# Mutations *******************************************************************

class AddOrModifyStudent(graphene.Mutation):
    """Add or modify a Student.

    Two objects are created (or modified, if [student] `id` is provided) as a
    result; Student and an associated MedicalRecord.
    """

    student = graphene.Field(StudentType)
    medical_record = graphene.Field(MedicalRecordType)
    insurance = graphene.Field(InsuranceType)

    class Arguments:
        id = graphene.Int()  # Provide to editing existing Student
        isParentGuardian = graphene.Boolean()
        parentGuardianEmail = graphene.String()

        # Basic Information Fields ************************
        name = graphene.String(required=True)
        dob = graphene.String(required=True)
        currentSchoolId = graphene.Int(required=True)
        classroom = graphene.Int(required=True)

        # Medical Fields **********************************
        gender = graphene.Int()
        height = graphene.String()
        weight = graphene.String()
        lastTetanus = graphene.String()
        noTetanusVaccine = graphene.Boolean()
        recentTrauma = graphene.String()
        restrictions = graphene.String()

        # Health Insurance Fields *************************
        insId = graphene.Int()
        insCompanyName = graphene.String()
        insPolicyNum = graphene.String()
        insGroupNum = graphene.String()
        insHolderName = graphene.String()

        # Medications (Non-Rx) Fields *********************
        nonRxType = graphene.Int(required=True)
        nonRxNotes = graphene.String()
        medicationSet = graphene.String()

        # Allergy Fields **********************************
        allergies = graphene.String()
        foodAllergens = graphene.String()
        allergiesExpanded = graphene.String()

        # Dietary Fields **********************************
        dietaryNeeds = graphene.String()
        dietaryCaution = graphene.Boolean()

        # Opt-ins, Outs... ********************************
        photoWaiver = graphene.Boolean()
        waiverAgreement = graphene.Boolean(required=True)
        medicalAgreement = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        if not info.context.user.is_authenticated():
            raise GraphQLError('Unauthorized')

        # print(kwargs.get('medicationSet'))
        # [{
        #    'id': 412,
        #    'administrationTimes': '1, 2, 5',
        #    'administrationTimesOther': 'As needed',
        #    'medicationName': 'Cookies',
        #    'amount': None,
        #    'amountHuman': '2 Cookies',
        #    'amountUnit': None,
        #    'getAmountUnitDisplay': None,
        #    'notes': "First ask her if she's 'being a candy?' if she hesitates with an answer, give her two cookies and comfort her."
        # }]

        # Student object (s)
        current_school = School.objects.get(pk=kwargs.get('currentSchoolId'))
        name = kwargs.get('name')
        dob = parse(kwargs.get('dob')).date()

        try:
            s = Student.objects.get(id=kwargs.get('id'))
        except Student.DoesNotExist:

            # Check for pre-existing Student record.
            # This is a costly command as the Name and date of birth fields are
            # encrypted. So we grab all Students from school, and then compare
            # both fields. An email gets sent to Staff and msg displayed that
            # user may already be entered and that we'll be in touch soon.
            for classmate in current_school.student_set.all():
                if (classmate.name == name) and (classmate.dob == dob):
                    # send email to Tech Support (with person information about
                    # who is duplicated, who is trying to register the student,
                    # and who has the student registered
                    send_html_email(
                        'email_duplicate_student_record.html',
                        {
                            'existing_record': classmate,
                            'user': info.context.user.email
                        },
                        'Duplicate Student Record Attempt',
                        settings.TECH_SUPPORT_TO_LIST
                    )

                    # Display error message to parent to contact NCI, student
                    # may already be registered.
                    raise GraphQLError('This student may already have a record on-file. Our staff will be notified and be in contact with you shortly. Sorry for the trouble. You can close this window.')

            # Otherwisse, let's create a brand new student object!
            s = Student()

        s.name = name
        s.dob = dob
        s.current_school = current_school
        s.classroom = kwargs.get('classroom')
        s.photo_waiver = kwargs.get('photoWaiver')
        s.waiver_agreement = kwargs.get('waiverAgreement')
        s.medical_agreement = kwargs.get('medicalAgreement')
        s.save()

        # MedicalRecord object (mr)
        try:
            mr = MedicalRecord.objects.get(student=s)
        except MedicalRecord.DoesNotExist:
            mr = MedicalRecord(student=s)
        mr.gender = kwargs.get('gender')
        mr.height = kwargs.get('height')
        mr.weight = kwargs.get('weight')

        if kwargs.get('lastTetanus'):
            mr.last_tetanus = parse(kwargs.get('lastTetanus')).date()
        mr.no_tetanus_vaccine = kwargs.get('noTetanusVaccine', False)
        mr.recent_trauma = kwargs.get('recentTrauma', '')
        mr.restrictions = kwargs.get('restrictions', '')
        mr.non_rx_type = kwargs.get('nonRxType')
        mr.non_rx_notes = kwargs.get('nonRxNotes', '')
        mr.allergies = kwargs.get('allergies')
        mr.food_allergens = kwargs.get('foodAllergens')
        mr.allergies_expanded = kwargs.get('allergiesExpanded', '')
        mr.dietary_needs = kwargs.get('dietaryNeeds', '')
        mr.dietary_caution = kwargs.get('dietaryCaution', False)
        mr.save()

        # If dietary_caution is True, we notify Staff right away
        if mr.dietary_caution:
            send_html_email(
                'email_staff_dietary_caution.html',
                {'student': s},
                'CONTACT REQUEST: Student Dietary Concerns',
                settings.TECH_SUPPORT_TO_LIST
            )

        # Medication objects (med)
        medication_list_str = kwargs.get('medicationSet', None)
        if medication_list_str:
            medication_list = ast.literal_eval(medication_list_str)
            for med in medication_list:
                try:
                    # FIXME: scaling issue, pk will eventually collide with getRandId()
                    medication = Medication.objects.get(pk=med['id'])
                except Medication.DoesNotExist:
                    medication = Medication()
                medication.administration_times = ', '.join(str(x) for x in med['administrationTimes']),
                medication.administration_times_other = str(med['administrationTimesOther'])
                medication.medication_name = str(med['medicationName'])
                medication.amount_human = str(med['amountHuman'])
                medication.notes = str(med['notes'])
                medication.medical_record = mr

                medication.save()

        # Health Insurance object (ins)
        # Either attach the student to an existing object (insId), or create a
        # new one and attach them to that.
        ins = None
        if kwargs.get('insId'):
            ins = Insurance.objects.get(pk=kwargs.get('insId'))
        elif kwargs.get('insPolicyNum'):
            try:
                ins = Insurance.objects.get(
                    company_name=kwargs.get('insCompanyName'),
                    policy_num=kwargs.get('insPolicyNum'),
                    group_num=kwargs.get('insGroupNum'),
                    holder_name=kwargs.get('insHolderName')
                )
            except Insurance.DoesNotExist:
                ins = Insurance(
                    company_name=kwargs.get('insCompanyName'),
                    policy_num=kwargs.get('insPolicyNum'),
                    group_num=kwargs.get('insGroupNum'),
                    holder_name=kwargs.get('insHolderName')
                )
                if kwargs.get('isParentGuardian'):
                    ins.account = info.context.user
                else:
                    ins.account = AccountProfile.objects.get(email=kwargs.get('parentGuardianEmail'))
                ins.save()

        # Add the Student to the Insurance's dependents list
        if ins:
            ins.dependents_list.add(s)

        # Add a Parent/Guardian to the Students guardian list
        if kwargs.get('isParentGuardian'):
            s.guardian_list.add(info.context.user)
        else:
            s.guardian_list.add(AccountProfile.objects.get(email=kwargs.get('parentGuardianEmail')))

        return AddOrModifyStudent(student=s, medical_record=mr, insurance=ins)


class DeleteStudent(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        id = graphene.Int(required=True)

    def mutate(self, info, id):
        u = info.context.user
        if u.is_authenticated() and (u.account_type == 'parent' or u.account_type == 'teacher' or u.account_type == 'ee-staff'):
            # FIXME: this is incomplete logic (what about teachers and ee-staff?)
            student = Student.objects.get(pk=id, guardian_list=info.context.user)
            student.delete()
            return DeleteStudent(success=True)
        raise GraphQLError('Unauthorized')


class AddOrModifyMedication(graphene.Mutation):
    """Add or modify a Student's Medication."""

    medication = graphene.Field(MedicationType)

    class Arguments:
        studentId = graphene.Int(required=True)
        medicationId = graphene.Int()
        administrationTimes = graphene.List(graphene.Int)
        administrationTimesOther = graphene.String()
        medicationName = graphene.String()
        amountHuman = graphene.String()
        notes = graphene.String()

    def mutate(self, info, **kwargs):
        if not info.context.user.is_authenticated():
            raise Exception('Unauthorized')

        try:
            student = Student.objects.get(id=kwargs.get('studentId'))
            medical_record = MedicalRecord.objects.get(student=student)
        except Student.DoesNotExist:
            raise Exception('Student does not exist')
        except MedicalRecord.DoesNotExist:
            raise Exception('MedicalRecord does not exist')

        medication_id = kwargs.get('medicationId', None)
        if medication_id:
            medication = Medication.objects.get(pk=medication_id)
        else:
            medication = Medication(medical_record=medical_record)

        administration_times = kwargs.get('administrationTimes', None)
        if administration_times:
            medication.administration_times = ','.join(map(str, administration_times))
        else:
            medication.administration_times = None

        medication.administration_times_other = kwargs.get('administrationTimesOther', '')
        medication.medication_name = kwargs.get('medicationName', '')
        medication.amount_human = kwargs.get('amountHuman', '')
        medication.notes = kwargs.get('notes', '')

        medication.save()

        return AddOrModifyMedication(medication=medication)


class ToggleStudentActivation(graphene.Mutation):
    """Flip a Student object's is_active bit.

    Students grow up. They move on. Students not marked 'active' in our system
    are as good as deleted from the perspective of the Guardians and Teachers,
    but EE Staff still have access for a 7-year record retention requirement.

    Note that teachers *do* have the ability to re-activate. There is no
    restriction or check as you can see

    """

    newStatus = graphene.Boolean()

    class Arguments:
        id = graphene.Int(required=True)

    def mutate(self, info, id):
        user = info.context.user
        if user.is_authenticated() and (user.account_type == 'ee-staff') or (user.account_type == 'teacher'):
            try:
                student = Student.objects.get(pk=id)
                student.is_active = not student.is_active
                student.save()

                # Remove Student from fieldtrips. Note that .save() is not called
                # through this, nor does it play a role in the removal of records
                fieldtrip_list = FieldTrip.objects.filter(student_list__pk=student.pk)
                for i in fieldtrip_list:
                    i.student_list.remove(student)

                return ToggleStudentActivation(newStatus=student.is_active)

            except Student.DoesNotExist:
                raise Exception('No record found')
        raise Exception('Invalid credentials')


class CheckInMedication(graphene.Mutation):
    success = graphene.Int()

    class Arguments:
        id = graphene.Int(required=True)

    def mutate(self, info, id):
        user = info.context.user
        if user.is_authenticated() and (user.account_type == 'teacher' or user.account_type == 'ee-staff'):
            try:
                medication = Medication.objects.get(id=id)
                medication.in_possession = True
                medication.save()
                return CheckInMedication(success=1)
            except Medication.DoesNotExist:
                raise Exception('Invalid medication?')
        raise Exception('Invalid credentials')


class CheckOutMedication(graphene.Mutation):
    success = graphene.Int()

    class Arguments:
        id = graphene.Int(required=True)

    def mutate(self, info, id):
        user = info.context.user
        if user.is_authenticated() and (user.account_type == 'teacher' or user.account_type == 'ee-staff'):
            try:
                medication = Medication.objects.get(id=id)
                medication.in_possession = False
                medication.save()
                return CheckOutMedication(success=1)
            except Medication.DoesNotExist:
                raise Exception('Invalid medication?')
        raise Exception('Invalid credentials')


class LogAdministeredMed(graphene.Mutation):
    """Mark a medication as being administarted to a student."""

    success = graphene.Int()
    administered_med = graphene.Field(AdministeredMedType)

    class Arguments:
        medication_id = graphene.Int(required=True)
        field_trip_id = graphene.Int(required=True)
        # administered_at = graphene.String(required=True)
        notes = graphene.String()

    def mutate(self, info, medication_id, field_trip_id, **kwargs):
        u = info.context.user
        if u.is_authenticated():
            field_trip = FieldTrip.objects.get(id=field_trip_id)
            medication = Medication.objects.get(id=medication_id)
            school = medication.medical_record.student.current_school

            administered_med = AdministeredMed(
                field_trip=field_trip,
                medication=medication,
                # administered_at=dt.datetime.strptime(administered_at, '%b %d %Y %I:%M%p')
            )

            # Notes are optional, so we check first
            if kwargs.get('notes'):
                administered_med.notes = kwargs.get('notes')

            # Save only if user has appropriate association with student
            if (
                (u.account_type == 'teacher') and school in u.assoc_school_list.all()
            ) or (
                (u.account_type == 'ee-staff') and field_trip.location in u.assoc_location_list.all()
            ):
                administered_med.save()

                return LogAdministeredMed(success=True, administered_med=administered_med)

        return None


class DeleteMedication(graphene.Mutation):
    """Delete a Student's Medication."""

    success = graphene.Boolean()

    class Arguments:
        id = graphene.Int(required=True)

    def mutate(self, info, id):
        u = info.context.user
        if u.is_authenticated() and (u.account_type == 'parent' or u.account_type == 'teacher' or u.account_type == 'ee-staff'):
            med = Medication.objects.get(id=id)
            student = med.medical_record.student
            if (u in student.guardian_list.all()) or (student.current_school in u.assoc_school_list.all()) or (u.account_type == 'ee-staff'):
                med.delete()
                return DeleteMedication(success=True)
        raise Exception('Unauthorized')


class Mutation(graphene.ObjectType):
    """Student and Medical Mutations."""

    add_or_modify_student = AddOrModifyStudent.Field()
    delete_student = DeleteStudent.Field()
    add_or_modify_medication = AddOrModifyMedication.Field()
    check_in_medication = CheckInMedication.Field()
    toggle_student_activation = ToggleStudentActivation.Field()
    check_out_medication = CheckOutMedication.Field()
    delete_medication = DeleteMedication.Field()
    log_administered_med = LogAdministeredMed.Field()


# Queries *********************************************************************

class Query(object):
    """GraphQL Queries related to Students."""

    only_my_students_on_field_trip = graphene.List(StudentType, fieldTripId=graphene.Int(required=True))
    my_students = graphene.List(StudentType, token=graphene.String())
    student = graphene.Field(StudentType, id=graphene.Int(required=True))
    medications = graphene.List(MedicationType, fieldTripId=graphene.Int(required=True))
    medication = graphene.Field(MedicationType, id=graphene.Int(required=True))

    # Resolvers *******************************************

    def resolve_only_my_students_on_field_trip(self, info, fieldTripId):
        """Return only students from my own school that are attending the field trip in question."""
        u = info.context.user
        # `ee-staff` is included here because they too might have a classroom attending.
        if u.is_authenticated() and (u.account_type == 'teacher' or u.account_type == 'ee-staff'):
            try:
                i = FieldTrip.objects.get(pk=fieldTripId, school_list__in=u.assoc_school_list.all())
            except FieldTrip.DoesNotExist:
                raise Exception('Unable to retrieve field trip details')
            return Student.objects.filter(
                pk__in=i.student_list.all(),
                current_school__in=u.assoc_school_list.all(),
                is_active=True
            )
        raise Exception('Unauthorized')

    def resolve_my_students(self, info, **kwargs):
        """Return all students from all of the schools I'm associated with.

        This is most useful for Teachers that belong to multiple schools and
        need a master list of all their Students.
        """
        u = info.context.user
        if u.is_authenticated() and (u.account_type == 'teacher' or u.account_type == 'ee-staff'):
            return Student.objects.filter(
                current_school__in=u.assoc_school_list.all(),
                is_active=True
            )
        raise Exception('Unauthorized')

    def resolve_student(self, info, id):
        """Return an active Student record based on your account type.

        * FIXME: Teachers can also be Parents. We need to support this still. Perhaps via
                 Django's Q model function (if teacher, current_school | guardian_list)...

        Places used:
            * NciDashboardTeacher
            * NciAppStudentDetail
            * NciAppAddMedication
        """
        u = info.context.user
        kwargs = {'pk': id}
        if u.is_authenticated():
            if u.account_type == 'teacher':
                kwargs['current_school__in'] = u.assoc_school_list.all()
            elif u.account_type == 'parent':
                kwargs['guardian_list'] = u

            if (u.account_type == 'teacher') or (u.account_type == 'parent'):
                kwargs['is_active'] = True
                return Student.objects.get(**kwargs)

            if u.account_type == 'ee-staff':
                return Student.objects.get(**kwargs)

        raise Exception('Unauthorized')

    def resolve_medications(self, info, fieldTripId):
        """Return all Medications for all Students attending the field trip in question.

        Places used:
            * NciAppFieldTripMedLog
            * NciAppFieldTripMedLogTable
        """
        u = info.context.user
        if u.is_authenticated() and (u.account_type == 'teacher' or u.account_type == 'ee-staff'):
            # TODO The user needs to be checked against the fieldtrip to make sure they can get access
            i = FieldTrip.objects.get(id=fieldTripId)
            return Medication.objects.filter(medical_record__student__in=i.student_list.all())
        raise Exception('Unauthorized')
