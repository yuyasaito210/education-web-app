import ast
# from pprint import pprint

import graphene
from graphql import GraphQLError
from graphene_django import DjangoObjectType
from mailchimp3 import MailChimp

# from django.db.utils import IntegrityError
from django.conf import settings
from django.contrib.auth import login as auth_login
from django.contrib.auth import authenticate, logout
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.tokens import \
    default_token_generator as token_generator
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_decode as uid_decoder
from django.utils.http import urlsafe_base64_encode
from django.utils import timezone

from djnci.utils import send_html_email
from students.models import Student
from .models import (AccountProfile, AccountProfileAddress, Insurance, School,
                     SchoolAddress, SchoolFile)


class AccountProfileType(DjangoObjectType):
    id = graphene.Int()
    is_nci_montessori = graphene.Boolean()

    def resolve_is_nci_montessori(self, _args, *_kwargs):
        return self.is_nci_montessori()

    class Meta:
        model = AccountProfile
        exclude_fields = ('password', )


class AccountProfileAddressType(DjangoObjectType):
    id = graphene.Int()

    class Meta:
        model = AccountProfileAddress
        exclude_fields = ('created', )


class InsuranceType(DjangoObjectType):
    id = graphene.Int()

    class Meta:
        model = Insurance


class SchoolType(DjangoObjectType):
    """Schools that attend NCI.

    Used to generate auto-complete dropdowns in user forms.

    """

    id = graphene.Int()

    class Meta:
        model = School
        exclude_fields = (
            'student_set',
            'fieldtrip_set',
            'phone',
            'guid',
            'is_active',
            'account_assoc_school_list',
            'email_whitelist',
            'legacy_user_id',
            'legacy_contact',
            'legacy_username',
            'legacy_school_id'
        )


class SchoolAddressType(DjangoObjectType):
    id = graphene.Int()

    class Meta:
        model = SchoolAddress

class SchoolFileType(DjangoObjectType):
    id = graphene.Int()

    class Meta:
        model = SchoolFile

# Mutations *******************************************************************

class ApproveTeacher(graphene.Mutation):
    account = graphene.Field(AccountProfileType)

    class Arguments:
        token = graphene.String(required=True)
        school = graphene.String(required=True)

    def mutate(self, info, token, school):
        user = info.context.user
        if user.is_authenticated() and user.is_staff:
            try:
                school = School.objects.get(guid=school)
            except School.DoesNotExist:
                raise Exception('Invalid school')
            try:
                account = AccountProfile.objects.get(guid=token)
                if school in account.assoc_school_list.all():
                    account.is_active = True
                    account.save()

                    send_html_email(
                        'email_welcome_approved_teacher.html',
                        {'account': account, 'school': school},
                        'Your NCI Account have been activated',
                        [account.email]
                    )

                    return ApproveTeacher(account=account)
                else:
                    raise Exception('Doesn\'t belong to this school ')
            except AccountProfile.DoesNotExist:
                raise Exception('Invalid token')

        raise Exception('Not authorized')


class Login(graphene.Mutation):
    account = graphene.Field(AccountProfileType)

    class Arguments:
        email = graphene.String()
        password = graphene.String()

    def mutate(self, info, email, password):
        if info.context.user.is_authenticated():
            return Login(account=info.context.user)

        try:
            account = AccountProfile.objects.get(email__iexact=email)
            auth = authenticate(email=account.email, password=password)
            if auth is None:
                raise GraphQLError('Auth: Could not authenticate')
        except AccountProfile.DoesNotExist:
            raise GraphQLError('Auth: Invalid email or password')

        auth_login(info.context, account)

        return Login(account=account)


class LogOut(graphene.Mutation):
    success = graphene.String()

    def mutate(self, info):
        logout(info.context)
        return LogOut(success='Signed out. Goodbye.')


class CreateAccountProfile(graphene.Mutation):
    account = graphene.Field(AccountProfileType)
    mailchimp = graphene.String()

    class Arguments:
        accountType = graphene.String(required=True)
        currentSchool = graphene.Int(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        name = graphene.String(required=True)
        phone = graphene.String()
        newsletterSignup = graphene.Boolean()

    def mutate(self, info, **kwargs):
        email = kwargs.get('email')

        # Let's make sure they aren't already in the system.
        try:
            matches = AccountProfile.objects.filter(email__iexact=email)
            if matches.count() > 0:
                raise Exception("This email address is already registered. Try logging in with it?")
        except AccountProfile.DoesNotExist:
            pass

        account = AccountProfile.objects.create_user(email=email, password=kwargs.get('password'))
        account.name = kwargs.get('name')

        account.account_type = kwargs.get('accountType')
        if account.account_type == 'teacher':
            account.is_active = False

        phone = kwargs.get('phone', None)
        if phone:
            account.phone = phone

        account.date_joined = timezone.now()
        account.modified = timezone.now()
        account.save()

        # Associate the school with this account
        school = School.objects.get(pk=kwargs.get('currentSchool'))
        account.assoc_school_list.add(school)

        email_payload = {'account': account.__dict__, 'school': school.__dict__}

        # Optionally add the user to our MailChimp subscriber list
        mailchimp_status = None
        if kwargs.get('newsletterSignup', None):
            mailchimp_status = 'subscribed'
            client = MailChimp('nciw', '12a1da954758b91006fc998424ebb72b-us9')
            client.lists.members.create('7fab981cdc', {
                'email_address': account.email,
                'status': 'subscribed',
                'merge_fields': {
                    'FNAME': account.get_first_name(),
                    'LNAME': account.get_last_name(),
                    'MMERGE4': school.name,
                    'MMERGE10': account.phone
                }
            })

        # Teachers must either be whitelisted or require manual approval
        if (account.account_type == 'teacher'):
            email_template = 'email_staff_new_teacher_account.html'
            email_subject = 'APPROVAL REQUEST: New Teacher NCI Account Sign up for %s' % school.name

            # Circle back and see if they are whitelisted
            if account.email.lower() in school.email_whitelist.lower():
                email_template = 'email_staff_new_whitelisted_teacher_account.html'
                email_subject = 'New Teacher NCI Account Sign up for %s (pre-approved)' % school.name
                account.is_active = True
                account.save()

            # Notify EE Staff of a new teacher sign up
            send_html_email(
                email_template,
                email_payload,
                email_subject,
                settings.STAFF_TO_LIST
            )

        elif (account.account_type == 'parent'):

            # Send user a  Welcome/confirmation email
            send_html_email(
                'email_welcome_new_signup.html',
                email_payload,
                'Welcome to Nature\'s Classroom Institute',
                [account.email, ]
            )

        auth_login(info.context, account)

        return CreateAccountProfile(
            account=account,
            mailchimp=mailchimp_status
        )


class UpdateMyProfile(graphene.Mutation):
    account = graphene.Field(AccountProfileType)

    class Arguments:
        token = graphene.String(required=True)
        email = graphene.String(required=True)
        name = graphene.String(required=True)
        phone = graphene.String()
        current_password = graphene.String()
        password = graphene.String()
        title = graphene.String()
        bio = graphene.String()

    def mutate(self, info, **kwargs):
        account = AccountProfile.objects.get(guid=kwargs.get('token'))
        account.email = kwargs.get('email')
        account.name = kwargs.get('name')
        account.phone = kwargs.get('phone', '')
        account.title = kwargs.get('title', '')
        account.bio = kwargs.get('bio', '')

        current_password = kwargs.get('current_password', None)
        password = kwargs.get('password', None)

        if password:
            print('password found!')
            try:
                current_password = kwargs.pop('current_password')
                print(current_password)
            except KeyError:
                raise Exception("Please provide your current password to change your password.")

            if account.check_password(current_password):
                account.set_password(kwargs.pop('password'))
                print('set password applied!')
            else:
                raise Exception("Current password is incorrect.")

        account.save()
        return UpdateMyProfile(account=account)


class AddInsurance(graphene.Mutation):
    insurance = graphene.Field(InsuranceType)

    class Arguments:
        id = graphene.Int()
        token = graphene.String(required=True)
        companyName = graphene.String(required=True)
        policyNum = graphene.String(required=True)
        groupNum = graphene.String(required=True)
        holderName = graphene.String(required=True)
        dependentsList = graphene.String()

    def mutate(self, info, **kwargs):
        try:
            account = AccountProfile.objects.get(guid=kwargs.get('token', None))
        except AccountProfile.DoesNotExist:
            raise Exception('Invalid credentials')

        policy_num = kwargs.get('policyNum')

        try:
            # TODO: use object id instead of policy number
            insurance = Insurance.objects.get(policy_num__iexact=policy_num)
        except Insurance.DoesNotExist:
            insurance = Insurance()

        insurance.company_name = kwargs.get('companyName', '')
        insurance.policy_num = policy_num
        insurance.group_num = kwargs.get('groupNum', '')
        insurance.holder_name = kwargs.get('holderName', '')
        insurance.account = account
        insurance.save()

        dependents_id_list = kwargs.get('dependentsList', None)
        insurance.dependents_list.clear()
        if dependents_id_list:
            i = ast.literal_eval(dependents_id_list)
            j = list(Student.objects.filter(id__in=i))
            insurance.dependents_list.add(*j)

        # Associate selected dependents to insurance policy
        # insurance.guardian_list.add(guardian)

        return AddInsurance(insurance=insurance)


class DeleteInsurance(graphene.Mutation):
    insurance = graphene.Field(InsuranceType)
    success = graphene.String()

    class Arguments:
        id = graphene.Int(required=True)
        token = graphene.String(required=True)

    def mutate(self, info, **kwargs):
        try:
            account = AccountProfile.objects.get(guid=kwargs.get('token', None))
        except AccountProfile.DoesNotExist:
            raise Exception('Invalid credentials')

        try:
            insurance = Insurance.objects.get(id=kwargs.get('id', None))
            if insurance.account == account:
                insurance.delete()
                return DeleteInsurance(success='true')
            return DeleteInsurance(success='false', insurance=insurance)

        except Insurance.DoesNotExist:
            raise Exception('Error: Could not delete record')


class SubmitTechSupportMessage(graphene.Mutation):
    success = graphene.String()

    class Arguments:
        token = graphene.String(required=True)
        message = graphene.String(required=True)

    def mutate(self, info, **kwargs):

        try:
            account = AccountProfile.objects.get(guid=kwargs.get('token', None))
        except AccountProfile.DoesNotExist:
            raise Exception('Invalid credentials')

        email_payload = {
            'account': account.__dict__,
            'message': kwargs.get('message', None)
        }

        send_html_email(
            'email_staff_tech_support.html',
            email_payload,
            'NCI Technical Support Inquiry',
            settings.TECH_SUPPORT_TO_LIST
        )

        return SubmitTechSupportMessage(success='Message sent')


class ResetPasswordRequest(graphene.Mutation):
    ok = graphene.Boolean()

    class Arguments:
        email = graphene.String(required=True)

    def mutate(self, info, **kwargs):
        try:
            account = AccountProfile.objects.get(email=kwargs.get('email'))
            uid = urlsafe_base64_encode(force_bytes(account.id)).decode()
            token = token_generator.make_token(account)
            link = 'https://app.discovernci.org/reset/%s/%s' % (uid, token)
            send_html_email(
                'email_password_reset.html',
                {'account': account, 'link': link},
                'Password reset on discovernci.org',
                [account.email]
            )
            return ResetPasswordRequest(ok=True)
        except AccountProfile.DoesNotExist:
            raise Exception('Invalid credentials')


class ResetPassword(graphene.Mutation):
    account = graphene.Field(AccountProfileType)
    ok = graphene.Boolean()

    class Arguments:
        id = graphene.String(required=True)
        password = graphene.String(required=True)
        token = graphene.String(required=True)

    def mutate(self, info, **kwargs):
        try:
            uid = force_text(uid_decoder(kwargs.get('id')))
            account = AccountProfile.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, AccountProfile.DoesNotExist):
            raise Exception('uid has an invalid value')

        data = {
            'uid': kwargs.get('id'),
            'new_password1': kwargs.get('password'),
            'new_password2': kwargs.get('password')
        }

        if token_generator.check_token(account, kwargs.get('token')):
            form = SetPasswordForm(user=account, data=data)
            if not form.is_valid():
                raise Exception(form.errors.as_json())
            form.save()

            return ResetPassword(ok=True, account=account)
        return ResetPassword(ok=False)


# Combined Mutations **********************************************************

class Mutation(graphene.ObjectType):
    submit_tech_support_message = SubmitTechSupportMessage.Field()
    create_account_profile = CreateAccountProfile.Field()
    update_my_profile = UpdateMyProfile.Field()
    login = Login.Field()
    logout = LogOut.Field()
    reset_password_request = ResetPasswordRequest.Field()
    reset_password = ResetPassword.Field()
    add_insurance = AddInsurance.Field()
    delete_insurance = DeleteInsurance.Field()
    approve_teacher = ApproveTeacher.Field()


# Combined Queries ************************************************************

class Query(object):
    ncim_staff_faculty = graphene.List(AccountProfileType)
    guardian = graphene.Field(
        AccountProfileType,
        id=graphene.Int(required=True)
    )
    schools = graphene.List(SchoolType)
    me = graphene.Field(AccountProfileType)
    approval_request = graphene.Field(
        AccountProfileType,
        token=graphene.String(required=True),
        school=graphene.String(required=True)
    )
    my_files = graphene.List(SchoolFileType)
    # graphene.List(StudentType, token=graphene.String())

    def resolve_ncim_staff_faculty(self, info, **kwargs):
        # id = kwargs.get('id')
        # classroom = kwargs.get('classroom')
        # print(kwargs)
        if classroom:
            return AccountProfile.objects.filter(account_type='teacher').filter(assoc_school_list__id=50, classroom=classroom)
        return AccountProfile.objects.filter(account_type='teacher').filter(assoc_school_list__id=50)

    def resolve_guardian(self, info, id):
        u = info.context.user
        if u.is_authenticated() and (u.account_type == 'ee-staff' or u.account_type == 'teacher'):
            return AccountProfile.objects.get(pk=id)
        raise GraphQLError('Unauthorized')

    def resolve_schools(self, info, **kwargs):
        return School.objects.filter(is_active=True)

    def resolve_me(self, info, **kwargs):
        if info.context.user.is_authenticated():
            return info.context.user
        return None

    def resolve_approval_request(self, info, token, school):
        user = info.context.user
        if user.is_authenticated() and user.is_staff:
            try:
                school = School.objects.get(guid=school)
            except School.DoesNotExist:
                raise Exception('Invalid school')
            try:
                account = AccountProfile.objects.get(guid=token)
                if school in account.assoc_school_list.all():
                    return account
                else:
                    raise Exception('Doesn\'t belong to this school ')
            except AccountProfile.DoesNotExist:
                raise Exception('Invalid token')
        raise Exception('Not authorized')

    def resolve_my_files(self, info, **kwargs):
        """Return all files from all of the schools I'm associated with.

        This is most useful for Teachers that belong to multiple schools and
        need a master list of all their Schools.
        """
        u = info.context.user
        if u.is_authenticated() and (u.account_type == 'teacher'):
            return SchoolFile.objects.filter(
                school__in=u.assoc_school_list.all(),
                is_public=1
            )
        raise Exception('Unauthorized')