from datetime import timedelta
import os
import time
from uuid import uuid4

from django.core.mail import EmailMessage
from django.template import loader


def send_html_email(template, context, subject, to_list, from_email=None, attachment=None):
    """Send an HTML-templated email to a list of users."""
    if not from_email:
        from_email = "Nature's Classroom <office@discovernci.org>"

    mailt = loader.get_template(template)
    mailc = context
    msg = EmailMessage(
        subject,
        mailt.render(mailc),
        from_email,
        to_list
    )
    msg.content_subtype = "html"
    msg.send()


def week_range(date):
    """Find the first/last day of the week for the given day.

    Assuming weeks start on Sunday and end on Saturday.

    Returns a tuple of ``(start_date, end_date)``.

    example:

        this_week = week_range(timezone.now())

    """
    # isocalendar calculates the year, week of the year, and day of the week.
    # dow is Mon = 1, Sat = 6, Sun = 7
    year, week, dow = date.isocalendar()

    # Find the first day of the week.
    if dow == 7:
        # Since we want to start with Sunday, let's test for that condition.
        start_date = date
    else:
        # Otherwise, subtract `dow` number days to get the first day
        start_date = date - timedelta(dow)

    # Now, add 6 for the last day of the week (i.e., count up to Saturday)
    end_date = start_date + timedelta(6)

    return (start_date, end_date)


def path_and_rename(instance, filename):
    ext = filename.split('.')[-1]
    filename = '{}-{}.{}'.format(time.strftime("%Y-%m-%d"), uuid4().hex, ext)
    return os.path.join('upload/', filename)
