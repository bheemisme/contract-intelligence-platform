from google.cloud import firestore

import os

# function to generate a firestore connection
def get_firestore_connection():
    db = firestore.Client(project=os.environ['GOOGLE_CLOUD_PROJECT'],
                          database=os.environ['GOOGLE_CLOUD_FIRESTORE_DATABASE'])
    
    return db
