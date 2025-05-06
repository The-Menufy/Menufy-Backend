from models.classification_model import ClassificationModel

# Initialize and train the model
classification_model = ClassificationModel('data/Generated_Recipe_Dataset.csv')
classification_model.train()  # This will save the model and vectorizer
