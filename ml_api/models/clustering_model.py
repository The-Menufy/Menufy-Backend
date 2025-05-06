import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import joblib

class ClusteringModel:
    def __init__(self, dataset_path):
        self.df = pd.read_csv(dataset_path)  # Load the dataset
        self.features = self.df[['Num_Ingredients', 'Average_Ingredient_Calorie', 'Preparation_Time_Minutes', 'Cooking_Time_Minutes']]
        self.scaler = StandardScaler()  # Initialize the scaler
        self.kmeans_model = None

    def train(self):
        # Scale the features
        scaled_features = self.scaler.fit_transform(self.features)

        # Apply PCA for dimensionality reduction (optional but may improve results)
        pca = PCA(n_components=2)
        pca_features = pca.fit_transform(scaled_features)
        
        # Fit the KMeans model (adjust n_clusters if necessary)
        self.kmeans_model = KMeans(n_clusters=5, random_state=42)
        self.kmeans_model.fit(pca_features)

        # Save the trained model
        joblib.dump(self.kmeans_model, 'models/clustering_model.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')  # Save scaler for future use
        joblib.dump(pca, 'models/pca.pkl')  # Save PCA for future use

        print("Model training completed and saved.")

    def predict(self, input_data):
        # Load the saved models (if already trained)
        model = joblib.load('models/clustering_model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        pca = joblib.load('models/pca.pkl')

        # Preprocess the input data the same way as during training
        input_scaled = scaler.transform([input_data])
        input_pca = pca.transform(input_scaled)

        # Predict the cluster
        cluster = model.predict(input_pca)
        return cluster.tolist()

# Example usage:
# clustering_model = ClusteringModel('data/World_Dishes_Dataset.csv')
# clustering_model.train()  # Train the model
# result = clustering_model.predict([10, 150, 30, 60])  # Example input
# print(result)
