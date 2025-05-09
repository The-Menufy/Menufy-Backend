from models.clustering_model import ClusteringModel
import os

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    clustering_model = ClusteringModel(os.path.join(DATA_DIR, 'World_Dishes_Dataset (1).csv'))
    clustering_model.train()