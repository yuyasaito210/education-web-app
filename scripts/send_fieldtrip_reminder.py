# -*- coding: utf-8 -*-

"""
Send a reminder email to Teachers about their upcoming FieldTrips.

USAGE: $ ./manage.py runscript send_fieldtrip_reminder

"""

from datetime import datetime, timedelta

from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

from reminders.models import Reminder

from bs4 import BeautifulSoup
import re


def run():
    from_email = "Nature's Classroom <no-reply@discovernci.org>"

    # Grab all Reminders marked for today *and* earlier (just in case)
    todays_reminders = Reminder.objects.filter(
        send_date__lte=datetime.today().date(),
        fieldtrip__is_enabled=True,
        is_active=True,
        sent=False
    )

    for reminder in todays_reminders:
        # Send to all [is_active] teachers belonging to any of the schools
        # affiliated with this field trip.
        send_to_list = reminder.fieldtrip.get_teacher_email_list()
        # separate list by br for send to
        send_to_br_string = "\r\n".join(send_to_list)

        # Reply back to this field trip locations primary contact
        reply_to_list = ["{} <{}>".format(
            reminder.fieldtrip.location.primary_contact.name,
            reminder.fieldtrip.location.primary_contact.email
        )]

        # Custom signature based on location's primary contact details
        signature = """\
            {}<br />\n
            {}<br />\n
            Nature’s Classroom Institute and Montessori School<br />\n
            Direct Phone: {}<br />\n
            Office Phone: 262-363-2815<br />\n
            https://discovernci.org<br />\n
            Like us on Facebook: www.facebook.com/NaturesClassroomInstitute<br />\n
            Follow us on Instagram: www.instagram.com/NaturesClassroomInstitute<br />\n
            <img src="https://app.discovernci.org/email-signature-logo.png" alt="" />
        """.format(
            reminder.fieldtrip.location.primary_contact.name,
            reminder.fieldtrip.location.primary_contact.title,
            reminder.fieldtrip.location.primary_contact.phone,
            reminder.fieldtrip.location.phone
        )

        # Prepare HTML to be parsed and massaged
        soup = BeautifulSoup(reminder.html, features="html.parser")

        # Replace TO_LIST with BR list of teachers
        target = soup.find_all(text=re.compile(r'TO_LIST'))
        for v in target:
            v.replace_with(v.replace('TO_LIST', send_to_br_string))

        # Total registered students
        students_expected = reminder.fieldtrip.expected_head_count
        students_registered = reminder.fieldtrip.get_total_students()
        target = soup.find_all(text=re.compile(r'STUDENTS_REGISTERED'))
        for v in target:
            v.replace_with(v.replace('STUDENTS_REGISTERED', str(students_registered)))

        # Expected head count
        target = soup.find_all(text=re.compile(r'STUDENTS_EXPECTED'))
        for v in target:
            v.replace_with(v.replace('STUDENTS_EXPECTED', str(students_expected)))

        html_body = soup.prettify() + "\n" + signature
        plain_text_body = strip_tags(html_body)

        # Create and send out the Email
        msg = EmailMultiAlternatives(
            reminder.subject,
            plain_text_body,
            from_email,
            send_to_list,
            reply_to=reply_to_list,
            bcc=reply_to_list,
        )
        msg.attach_alternative(html_body, "text/html")  # html-formatted body
        msg.send()

        # Mark send_weekly reminders with 7 days in advance
        if reminder.send_weekly:
            reminder.send_date = reminder.send_date + timedelta(days=7)
        else:
            reminder.sent = True

        # Set active to False if we have more registered students
        if students_registered >= students_expected:
            reminder.is_active = False

        reminder.save()
