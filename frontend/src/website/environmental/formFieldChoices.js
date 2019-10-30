module.exports = {
  accountTypeChoices: [
    { id: 'parent', label: 'Parent/Guardian' },
    { id: 'teacher', label: 'Teacher' },
    { id: 'school', label: 'School' },
    { id: 'ee-staff', label: 'EE Staff' }
  ],
  schoolTypeChoices: [
    { id: 'public', label: 'Public School' },
    { id: 'montessori', label: 'Montessori School' }
  ],
  studentNoteTypeChoices: [
    { id: 0, label: 'General' },
    { id: 1, label: 'Billing & Payments' },
    { id: 2, label: 'Phone call' }
  ],
  schoolClassroomListPublic: [
    { id: 1, label: '1st Grade' },
    { id: 2, label: '2nd Grade' },
    { id: 3, label: '3rd Grade' },
    { id: 4, label: '4th Grade' },
    { id: 5, label: '5th Grade' },
    { id: 6, label: '6th Grade' },
    { id: 7, label: '7th Grade' },
    { id: 8, label: '8th Grade' },
    { id: 13, label: '9th Grade' },
    { id: 14, label: '10th Grade' },
    { id: 15, label: '11th Grade' },
    { id: 16, label: '12th Grade' }
  ],
  schoolClassroomListMontessori: [
    { id: 9, label: 'Children\'s house (Ages 3-6)' },
    { id: 10, label: 'Lower Elementary (Ages 6-9)' },
    { id: 11, label: 'Upper Elementary (Ages 9-12)' },
    { id: 12, label: 'Adolescent (Ages 12-18)' }
  ],
  genderChoices: [
    { id: 1, label: 'Female' },
    { id: 2, label: 'Male' },
    { id: 3, label: 'Gender fluid' },
    { id: 4, label: 'Non-binary / Third gender' },
    { id: 5, label: 'Prefer to self-describe' },
    { id: 6, label: 'Prefer not to say' }
  ],
  nonRxTypeChoices: [
    { id: 1, label: 'None' },
    { id: 2, label: 'Tylenol' },
    { id: 3, label: 'Ibuprofen' },
    { id: 4, label: 'Ibuprofen or Tylenol' }
  ],
  allergyChoices: [
    { id: 1, label: 'Food Allergy' },
    { id: 2, label: 'Skin Allergy' },
    { id: 3, label: 'Dust Allergy' },
    { id: 4, label: 'Insect Sting Allergy' },
    { id: 5, label: 'Animal Allergies' },
    { id: 6, label: 'Eye Allergy' },
    { id: 7, label: 'Drug Allergies' },
    { id: 8, label: 'Allergic Rhinitis (hay fever)' },
    { id: 9, label: 'Latex Allergy' },
    { id: 10, label: 'Mold Allergy' },
    { id: 11, label: 'Pollen Allergy' },
    { id: 12, label: 'Sinus Infection' },
    { id: 13, label: 'Other (please specify)' }
  ],
  foodAllergenChoices: [
    { id: 1, label: 'Milk' },
    { id: 2, label: 'Eggs' },
    { id: 3, label: 'Peanuts' },
    { id: 4, label: 'Soy' },
    { id: 5, label: 'Wheat' },
    { id: 6, label: 'Tree nuts' },
    { id: 7, label: 'Fish' },
    { id: 8, label: 'Shellfish' },
    { id: 9, label: 'Other (please specify)' }
  ],
  medicationAmountUnitChoices: [
    { id: 1, label: 'Tablet' },
    { id: 9, label: 'Lozenge' },
    { id: 10, label: 'Pastilles' },
    { id: 2, label: 'Spray' },
    { id: 3, label: 'Puff' },
    { id: 4, label: 'Gummy' },
    { id: 13, label: 'Drop' },
    { id: 5, label: 'Tbsp.' },
    { id: 6, label: 'tsp.' },
    { id: 14, label: 'mL' },
    { id: 12, label: 'milligrams mg' },
    { id: 7, label: 'oz' },
    { id: 11, label: 'micrograms mcg (μg)' },
    { id: 8, label: 'as needed' }
  ],
  medicationAdminTimeChoices: [
    { id: 1, label: 'Breakfast' },
    { id: 2, label: 'Lunch' },
    { id: 3, label: 'Dinner' },
    { id: 4, label: 'Bedtime' },
    { id: 5, label: 'Other' }
  ]
};
