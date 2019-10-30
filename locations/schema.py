from django.utils import timezone
from django.conf import settings
from djnci.utils import send_html_email
from graphene_django.converter import convert_django_field

import graphene
from graphene_django import DjangoObjectType
from jsonfield import JSONField

from djnci.utils import week_range
from students.schema import StudentType
from students.models import Student
from .models import Location, FieldTrip


@convert_django_field.register(JSONField)
def convert_JSONField(field, registry=None):
    return graphene.String()


class LocationType(DjangoObjectType):
    id = graphene.Int()
    sidebar_json = graphene.types.json.JSONString()

    def resolve_sidebar_json(self, _args, *_kwargs):
        return self.sidebar_json

    class Meta:
        model = Location
        exclude_fields = ('contact_assoc_location_list',)


class FieldTripType(DjangoObjectType):
    id = graphene.Int()
    get_total_students = graphene.Int()
    get_total_allergens = graphene.Int()
    get_total_dietary_restrictions = graphene.Int()
    get_total_student_notes = graphene.Int()
    get_week_name = graphene.String()
    my_students_only = graphene.List(StudentType)

    class Meta:
        model = FieldTrip

    def resolve_get_total_students(self, _args, *_kwargs):
        return self.get_total_students()

    def resolve_get_total_allergens(self, _args, *_kwargs):
        return self.get_total_allergens()

    def resolve_get_total_dietary_restrictions(self, _args, *_kwargs):
        return self.get_total_dietary_restrictions()

    def resolve_get_total_student_notes(self, _args, *_kwargs):
        return self.get_total_student_notes()

    def resolve_get_week_name(self, _args, *_kwargs):
        return self.get_week_name()

    def resolve_my_students_only(self, _args, *_kwargs):
        print(self)
        print(_args)
        print(_kwargs)
        return Student.objects.all()


# Mutations *******************************************************************

class FieldTripRegistration(graphene.Mutation):
    success = graphene.String()

    class Arguments:
        studentId = graphene.Int(required=True)
        fieldTripId = graphene.Int(required=True)
        action = graphene.String(required=True)

    def mutate(self, info, **kwargs):
        if not info.context.user.is_authenticated():
            raise Exception('Not signed in')

        try:
            student = Student.objects.get(pk=kwargs.get('studentId'))
            field_trip = FieldTrip.objects.get(pk=kwargs.get('fieldTripId'))
        except Student.DoesNotExist:
            raise Exception('Invalid student details')
        except FieldTrip.DoesNotExist:
            raise Exception('Invalid field trip details')

        action = kwargs.get('action', None)
        if action == 'register':
            field_trip.student_list.add(student)

            # Send user a confirmation email
            send_html_email(
                'email_fieldtrip_registration_confirmation.html',
                {
                    'account': info.context.user,
                    'student': student,
                    'school': student.current_school,
                    'fieldtrip': field_trip
                },
                '%s is registered to attend a field trip to Nature\'s Classroom Institute' % student.name,
                [info.context.user.email, ]  # TODO: should this instead be student.guardian_list?
            )

        if action == 'deregister':
            field_trip.student_list.remove(student)

        return FieldTripRegistration(success='successfully %sed' % action)


class FieldTripRequest(graphene.Mutation):
    success = graphene.String()

    class Arguments:
        contactMethod = graphene.Int()

    def mutate(self, info, **kwargs):
        user = info.context.user
        if not info.context.user.is_authenticated():
            raise Exception('Invalid credentials')

        contact_method = kwargs.get('contactMethod')

        send_html_email(
            'email_fieldtrip_request.html',
            {
                'account': user,
                'school': user.assoc_school_list.first(),
                'contact_method': contact_method
            },
            'NCI Field Trip Request',
            [user.email, ]
        )

        send_html_email(
            'email_staff_fieldtrip_request.html',
            {
                'account': user,
                'school': user.assoc_school_list.first(),
                'contact_method': contact_method
            },
            'NCI Field Trip Request',
            settings.STAFF_TO_LIST
        )

        return FieldTripRequest(success='true')


class Mutation(graphene.ObjectType):
    fieldtrip_request = FieldTripRequest.Field()
    field_trip_registration = FieldTripRegistration.Field()


# Combined nodes **************************************************************

class Query(object):
    location = graphene.Field(LocationType, id=graphene.Int(), slug=graphene.String())
    locations = graphene.List(LocationType)

    my_field_trips = graphene.List(FieldTripType, timeline=graphene.String())
    fieldtrip = graphene.Field(FieldTripType, id=graphene.Int(required=True))

    def resolve_locations(self, info):
        return Location.objects.ee_locations_only()

    def resolve_location(self, info, **kwargs):
            id = kwargs.get('id')
            slug = kwargs.get('slug')

            if id is not None:
                return Location.objects.get(pk=id)

            if slug is not None:
                return Location.objects.get(slug=slug)

            return None

    def resolve_my_field_trips(self, info, **kwargs):
        """Return a list of field trips associated with the user.

        EE Staff will see all field trips under the EE locations they are
        associated with (`AccountProfile.assoc_location_list`).

        Teachers and Parents will get a list of enabled field trips associated
        with their school only (`AccountProfile.assoc_school_list`).
        """
        u = info.context.user
        if not u.is_authenticated():
            return None

        fieldtrip_kwargs = {}
        if u.account_type == 'ee-staff':
            fieldtrip_kwargs['location__in'] = u.assoc_location_list.all()
        else:
            fieldtrip_kwargs['school_list__in'] = u.assoc_school_list.all()

        timeline = kwargs.get('timeline', None)
        if timeline == 'open-registration':
            return FieldTrip.objects.open_registration().filter(**fieldtrip_kwargs)
        elif timeline == 'previous':
            return FieldTrip.objects.previous().filter(**fieldtrip_kwargs)
        elif timeline == 'now':
            return FieldTrip.objects.now().filter(**fieldtrip_kwargs)
        elif timeline == 'upcoming':
            return FieldTrip.objects.upcoming().filter(**fieldtrip_kwargs)
        return None

    def resolve_fieldtrip(self, info, **kwargs):
        """Return a individual FieldTrip object for suitable for Teachers and EE Staff."""
        u = info.context.user
        if u.is_authenticated() and (u.account_type == 'teacher' or u.account_type == 'ee-staff'):
            try:
                if u.account_type == 'ee-staff':
                    return FieldTrip.objects.get(
                        pk=kwargs.get('id'),
                        is_enabled=True
                    )
                else:
                    return FieldTrip.objects.get(
                        pk=kwargs.get('id'),
                        is_enabled=True,
                        school_list__in=u.assoc_school_list.all()
                    )
            except FieldTrip.DoesNotExist:
                raise Exception('Cannot access fieldtrip information')
        return None
