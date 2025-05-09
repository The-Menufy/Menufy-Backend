from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from models.classification_model import ClassificationModel
from models.recommendation_model import RecommendationModel
from models.regression_model import RegressionModel
from models.clustering_model import ClusteringModel  # Added this import

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Define paths to datasets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Initialize models
try:
    classification_model = ClassificationModel(dataset_path=os.path.join(DATA_DIR, 'Generated_Recipe_Dataset.csv'))
    recommendation_model = RecommendationModel(dataset_path=os.path.join(DATA_DIR, 'World_Dishes_Dataset (1).csv'))
    regression_model = RegressionModel(dataset_path=os.path.join(DATA_DIR, 'World_Dishes_Dataset (1).csv'))
    clustering_model = ClusteringModel(dataset_path=os.path.join(DATA_DIR, 'World_Dishes_Dataset (1).csv'))
except FileNotFoundError as e:
    print(f"Error: Dataset file not found: {e}")
    exit(1)

# API route for Classification
@app.route('/api/classification', methods=['POST'])
def classification():
    data = request.get_json()
    ingredients = data.get('ingredients', '')
    if not ingredients:
        return jsonify({'error': 'No ingredients provided'}), 400
    
    try:
        top_dishes = classification_model.predict(ingredients)
        response = []
        for dish in top_dishes:
            dish_info = {
                'Dish Name': dish['Dish Name'],
                'Ingredients': dish['Ingredients'],
                'Category': classification_model.df[classification_model.df['Dish Name'] == dish['Dish Name']]['Category'].iloc[0] if 'Category' in classification_model.df.columns else 'N/A',
            }
            response.append(dish_info)
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': f'Classification failed: {str(e)}'}), 500

# API route for Recommendation
@app.route('/api/recommendation', methods=['POST'])
def recommendation():
    data = request.get_json()
    input_ingredients = data.get('ingredients', [])
    if not input_ingredients:
        return jsonify({'error': 'No ingredients provided'}), 400
    
    try:
        result = recommendation_model.recommend(input_ingredients)
        for dish in result:
            dish_details = recommendation_model.df.loc[recommendation_model.df['Dish Name'] == dish['Dish Name'], [
                'Dish Name', 'Ingredients', 'Num_Ingredients', 'Average_Ingredient_Calorie', 
                'Preparation_Time_Minutes', 'Cooking_Time_Minutes', 'Calories', 'Category', 'Instructions'
            ]].iloc[0].to_dict()
            dish.update(dish_details)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Recommendation failed: {str(e)}'}), 500

# API route for Regression
@app.route('/api/regression', methods=['POST'])
def regression():
    data = request.get_json()
    input_features = data.get('features')
    avg_cal_per_ingredient = data.get('avg_cal_per_ingredient', 50)
    
    if not input_features or len(input_features) != 3 or not all(isinstance(x, (int, float)) for x in input_features):
        return jsonify({'error': 'Invalid input: Provide 3 numeric values [Num_Ingredients, Prep_Time, Cook_Time]'}), 400
    
    try:
        predicted_calories = regression_model.predict(input_features + [avg_cal_per_ingredient])
        if predicted_calories is None:
            return jsonify({'error': 'Failed to predict calories', 'predicted_calories': None, 'matching_dishes': []}), 500
        
        tolerance = 50
        min_cal = max(0, predicted_calories - tolerance)
        max_cal = predicted_calories + tolerance
        matching_dishes = regression_model.df[
            (pd.to_numeric(regression_model.df['Calories'], errors='coerce').between(min_cal, max_cal))
        ][['Dish Name', 'Ingredients', 'Category', 'Calories']].to_dict('records')
        matching_dishes = matching_dishes[:5]
        
        return jsonify({
            'predicted_calories': predicted_calories,
            'matching_dishes': matching_dishes
        })
    except Exception as e:
        return jsonify({'error': f'Regression failed: {str(e)}'}), 500

# API route for Clustering
@app.route('/api/clustering', methods=['POST'])
def clustering():
    data = request.get_json()
    dish_name = data.get('dish_name', '')
    
    if not dish_name:
        return jsonify({'error': 'No dish name provided'}), 400
    
    try:
        result = clustering_model.predict(dish_name=dish_name)
        response = {
            'dish_name': dish_name,
            'cluster': result['cluster'],
            'category': result['category']
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': f'Clustering failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)