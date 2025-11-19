import os
import pandas as pd
from django.core.management.base import BaseCommand
from drugs.models import Drug
from django.db import transaction

class Command(BaseCommand):
    help = "Import drug data from a CSV file into the database"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(os.getcwd(), "drugs.csv")  # Ensure correct file path

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        try:
            dtype_map = {
                "drug_name": str,
                "medical_condition": str,
                "side_effects": str,
                "generic_name": str,
                "drug_classes": str,
                "brand_names": str,
                "activity": str,  
                "rx_otc": str,
                "pregnancy_category": str,
                "csa": str,
                "alcohol": str,
                "related_drugs": str,
                "medical_condition_description": str,
                "rating": float,  # Ensure rating is a float
                "no_of_reviews": "Int64"  # Use Int64 to handle missing values correctly
            }

            df = pd.read_csv(file_path, dtype=dtype_map)

            # Ensure numeric values have defaults instead of empty strings
            df["no_of_reviews"] = df["no_of_reviews"].fillna(0).astype(int)  
            df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(0.0)  # Ensure valid float values
            
            # Fill NaN values in string columns with an empty string
            string_columns = ["drug_name", "medical_condition", "side_effects", "generic_name", 
                              "drug_classes", "brand_names", "activity", "rx_otc", "pregnancy_category", 
                              "csa", "alcohol", "related_drugs", "medical_condition_description"]
            df[string_columns] = df[string_columns].fillna("")

            # Ensure fields match the actual model
            model_fields = {field.name for field in Drug._meta.get_fields()}

            drug_objects = []

            for _, row in df.iterrows():
                drug_data = {
                    "drug_name": row["drug_name"].strip(),
                    "medical_condition": row["medical_condition"].strip(),
                    "side_effects": row["side_effects"].strip(),
                    "generic_name": row["generic_name"].strip(),
                    "drug_classes": row["drug_classes"].strip(),
                    "brand_names": row["brand_names"].strip(),
                    "activity": row["activity"].strip(),
                    "rx_otc": row["rx_otc"].strip(),
                    "pregnancy_category": row["pregnancy_category"].strip(),
                    "csa": row["csa"].strip(),
                    "alcohol": row["alcohol"].strip(),
                    "related_drugs": row["related_drugs"].strip(),
                    "medical_condition_description": row["medical_condition_description"].strip(),
                    "rating": row["rating"],
                    "no_of_reviews": row["no_of_reviews"],
                }

                # Remove any fields that are not in the model
                drug_data = {k: v for k, v in drug_data.items() if k in model_fields}

                drug_objects.append(Drug(**drug_data))

            with transaction.atomic():
                Drug.objects.bulk_create(drug_objects, ignore_conflicts=True)

            self.stdout.write(self.style.SUCCESS("Drug data imported successfully!"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error during import: {str(e)}"))
