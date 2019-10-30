from django import forms

from .models import SchoolFile

class SchoolFileUploadForm(forms.ModelForm):

    class Meta:
        model = SchoolFile
        fields = '__all__'