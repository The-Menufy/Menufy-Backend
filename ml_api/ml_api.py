from flask import Flask, request, jsonify
from flask_cors import CORS
from models.classification_model import ClassificationModel
from models.recommendation_model import RecommendationModel
from models.regression_model import RegressionModel
import pandas as pd

app = Flask(__name__)
CORS(app)

classification_model = ClassificationModel(dataset_path='data/Generated_Recipe_Dataset.csv')
recommendation_model = RecommendationModel(dataset_path='data/World_Dishes_Dataset (1).csv')
regression_model = RegressionModel(dataset_path='data/World_Dishes_Dataset (1).csv')

# API route for Classification
@app.route('/api/classification', methods=['POST'])
def classification():
    data = request.get_json()
    ingredients = data.get('ingredients', '')
    if not ingredients:
        return jsonify({'error': 'No ingredients provided'}), 400
    
    top_dishes = classification_model.predict(ingredients)
    
    # Add Category to the response (Calories is not part of the classification model)
    response = []
    for dish in top_dishes:
        dish_info = {
            'Dish Name': dish['Dish Name'],
            'Ingredients': dish['Ingredients'],
            'Category': classification_model.df[classification_model.df['Dish Name'] == dish['Dish Name']]['Category'].iloc[0] if 'Category' in classification_model.df.columns else 'N/A',
        }
        response.append(dish_info)
    
    print(f"API Response: {response}")
    return jsonify(response)

@app.route('/api/recommendation', methods=['POST'])
def recommendation():
    data = request.get_json()
    input_ingredients = data['ingredients']
    result = recommendation_model.recommend(input_ingredients)

    # Adding all the details to the response, including all columns from the dataset
    for dish in result:
        dish_details = recommendation_model.df.loc[recommendation_model.df['Dish Name'] == dish['Dish Name'], [
            'Dish Name', 'Ingredients', 'Num_Ingredients', 'Average_Ingredient_Calorie', 
            'Preparation_Time_Minutes', 'Cooking_Time_Minutes', 'Calories', 'Category', 'Instructions'
        ]].iloc[0].to_dict()

        # Add the detailed information to the dish object
        dish.update(dish_details)

    return jsonify(result)


@app.route('/api/regression', methods=['POST'])
def regression():
    data = request.get_json()
    input_features = data.get('features')
    avg_cal_per_ingredient = data.get('avg_cal_per_ingredient', 50)  # Default to 50 if not provided
    
    if not input_features or len(input_features) != 3 or not all(isinstance(x, (int, float)) for x in input_features):
        return jsonify({'error': 'Invalid input: Provide 3 numeric values [Num_Ingredients, Prep_Time, Cook_Time]'}), 400
    
    # Predict calories using the regression model
    predicted_calories = regression_model.predict(input_features + [avg_cal_per_ingredient])
    if predicted_calories is None:
        return jsonify({'error': 'Failed to predict calories', 'predicted_calories': None, 'matching_dishes': []}), 500
    
    tolerance = 50  # Allow dishes within ±50 calories of the predicted value
    min_cal = max(0, predicted_calories - tolerance)
    max_cal = predicted_calories + tolerance
    
    # Get dishes within the calorie range from the regression dataset
    matching_dishes = regression_model.df[
        (pd.to_numeric(regression_model.df['Calories'], errors='coerce').between(min_cal, max_cal))
    ][['Dish Name', 'Ingredients', 'Category', 'Calories']].to_dict('records')
    
    # Limit to top 5 or fewer if available
    matching_dishes = matching_dishes[:5]

    return jsonify({
        'predicted_calories': predicted_calories,
        'matching_dishes': matching_dishes
    })




if __name__ == '__main__':
    app.run(debug=True, port=5001)
