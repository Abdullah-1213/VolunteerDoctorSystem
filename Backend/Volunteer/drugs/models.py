from django.db import models

class Drug(models.Model):
    drug_name = models.CharField(max_length=255)
    medical_condition = models.TextField()
    side_effects= models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255)
    drug_classes = models.TextField()
    brand_names = models.TextField()
    activity = models.TextField()
    rx_otc = models.TextField()
    pregnancy_category = models.CharField(max_length=10)
    csa = models.TextField()
    alcohol = models.TextField()
    related_drugs = models.TextField()
    medical_condition_description = models.TextField()
    rating = models.FloatField(null=True, blank=True)
    no_of_reviews = models.IntegerField(null=True, blank=True)
    drug_link = models.URLField()

    def __str__(self):
        return self.drug_name