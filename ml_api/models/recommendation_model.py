import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

class RecommendationModel:
    def __init__(self, dataset_path='data/World_Dishes_Dataset (1).csv'):
        # Load the dataset
        self.df = pd.read_csv(dataset_path)
        
        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000, ngram_range=(1,2))
        
        # Vectorize the ingredients column in the dataset
        self.X_text = self.vectorizer.fit_transform(self.df['Ingredients'])
        
        # Save the vectorizer
        joblib.dump(self.vectorizer, 'models/recommendation_vectorizer.pkl')

    def recommend(self, input_ingredients, top_n=5):
        # Load the saved vectorizer
        vectorizer = joblib.load('models/recommendation_vectorizer.pkl')
        
        # Vectorize the input ingredients
        input_vec = vectorizer.transform([input_ingredients])

        # Compute cosine similarity between input ingredients and all dishes
        similarities = cosine_similarity(input_vec, self.X_text).flatten()

        # Add similarity scores to the dataframe and sort by similarity
        self.df['Similarity'] = similarities
        top_dishes = self.df.sort_values(by='Similarity', ascending=False).head(top_n)
        
        # Returning the top recommended dishes
        recommended_dishes = top_dishes[['Dish Name', 'Ingredients', 'Category', 'Calories', 'Similarity']]
        return recommended_dishes.to_dict(orient='records')

# Example usage:
# recommendation_model = RecommendationModel('data/World_Dishes_Dataset.csv')
# result = recommendation_model.recommend('chicken, garlic, rice')  # Input ingredients
# print(result)
