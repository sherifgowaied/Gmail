from django.contrib import admin
from .models import *
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    # a list of displayed columns name.
    list_display = ['id', 'username','email','password']

class EmailAdmin(admin.ModelAdmin):
    # a list of displayed columns name.
    list_display = ['id', 'subject', 'body','sender','archived','read','timestamp']


admin.site.register(User,UserAdmin)
admin.site.register(Email,EmailAdmin)