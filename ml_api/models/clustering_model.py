import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import joblib
import numpy as np

class ClusteringModel:
    def __init__(self, dataset_path):
        self.df = pd.read_csv(dataset_path)
        self.features = self.df[['Num_Ingredients', 'Average_Ingredient_Calorie', 'Preparation_Time_Minutes', 'Cooking_Time_Minutes']]
        self.scaler = StandardScaler()
        self.kmeans_model = None
        self.pca = None
        self.cluster_names = {
            0: 'Breakfast',
            1: 'Dinner',
            2: 'Lunch',
            3: 'Dinner',
            4: 'Dessert'
        }

    def train(self):
        scaled_features = self.scaler.fit_transform(self.features)
        self.pca = PCA(n_components=2)
        pca_features = self.pca.fit_transform(scaled_features)
        self.kmeans_model = KMeans(n_clusters=5, random_state=42)
        self.kmeans_model.fit(pca_features)
        joblib.dump(self.kmeans_model, 'models/clustering_model.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')
        joblib.dump(self.pca, 'models/pca.pkl')
        self.df['Cluster'] = self.kmeans_model.labels_
        self.df['Cluster_Name'] = self.df['Cluster'].map(self.cluster_names)
        self.df.to_csv('data/clustered_dishes.csv', index=False)
        print("Model training completed and saved.")

    def predict(self, dish_name=None, input_data=None):
        model = joblib.load('models/clustering_model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        pca = joblib.load('models/pca.pkl')

        if dish_name:
            dish_row = self.df[self.df['Dish Name'].str.lower() == dish_name.lower()]
            if not dish_row.empty:
                input_data = dish_row[['Num_Ingredients', 'Average_Ingredient_Calorie', 
                                       'Preparation_Time_Minutes', 'Cooking_Time_Minutes']].values[0]
            else:
                input_data = self.features.median().values
                print(f"Dish '{dish_name}' not found. Using median features.")

        if input_data is None or len(input_data) != 4:
            raise ValueError("Input data must be a list of 4 numerical values")

        input_scaled = scaler.transform([input_data])
        input_pca = pca.transform(input_scaled)
        cluster = model.predict(input_pca)[0]
        return {
            'cluster': int(cluster),
            'category': self.cluster_names.get(cluster, f'Cluster {cluster}')
        }