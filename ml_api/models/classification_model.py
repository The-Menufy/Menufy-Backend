import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class ClassificationModel:
    def __init__(self, dataset_path='data/Generated_Recipe_Dataset.csv'):
        # Load the dataset without deduplication
        self.df = pd.read_csv(dataset_path)
        print(f"Dataset loaded with {self.df.shape[0]} rows and {self.df['Dish Name'].nunique()} unique dishes")

        # Vectorizing ingredients with adjusted parameters
        self.vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 3), stop_words=None)
        self.X = self.vectorizer.fit_transform(self.df['Ingredients'])

    def predict(self, ingredients):
        print(f"Input ingredients: {ingredients}")

        # Vectorize the input ingredients
        input_vec = self.vectorizer.transform([ingredients])
        print(f"Input vector shape: {input_vec.shape}")

        # Calculate the cosine similarity
        cosine_sim = np.dot(self.X, input_vec.T).toarray().flatten()
        print(f"Cosine similarity scores (top 10 for debug): {cosine_sim[np.argsort(cosine_sim)[-10:]]}")

        # Split input ingredients into a list for filtering
        input_ingredients_list = [ing.strip().lower() for ing in ingredients.split(',')]

        # Filter rows where all input ingredients are present
        mask = self.df['Ingredients'].apply(
            lambda x: all(ing in x.lower() for ing in input_ingredients_list)
        )
        filtered_indices = self.df[mask].index
        if len(filtered_indices) == 0:
            print("No dishes found containing all input ingredients.")
            return []

        # Get cosine similarities for filtered indices
        filtered_similarities = cosine_sim[filtered_indices]
        filtered_df = self.df.iloc[filtered_indices].copy()
        filtered_df['similarity'] = filtered_similarities
        filtered_df['original_index'] = filtered_indices  # Preserve original indices explicitly

        # Sort by similarity (descending) and group by dish name to get the highest score for each dish
        filtered_df = filtered_df.sort_values(by='similarity', ascending=False)
        unique_dishes = filtered_df.groupby('Dish Name').first().reset_index()

        # Sort unique dishes by similarity
        unique_dishes = unique_dishes.sort_values(by='similarity', ascending=False)
        top_indices = unique_dishes.index[:3]  # Take top 3 unique dishes
        top_dish_indices = unique_dishes['original_index'].iloc[top_indices]  # Use preserved original indices
        top_scores = unique_dishes['similarity'].iloc[top_indices].values

        print(f"Top 3 indices: {top_dish_indices.values}")
        print(f"Top 3 similarity scores: {top_scores}")

        # Fetch the top 3 predicted dishes
        top_dishes = []
        for idx in top_dish_indices:
            dish_name = self.df.iloc[idx]['Dish Name']
            ingredients_list = self.df.iloc[idx]['Ingredients']
            print(f"Index {idx}: Dish Name: {dish_name}, Ingredients: {ingredients_list}")
            top_dishes.append({
                'Dish Name': dish_name,
                'Ingredients': ingredients_list
            })

        print(f"Top 3 dishes: {top_dishes}")
        return top_dishes[:3]  # Ensure exactly 3 dishes are returned