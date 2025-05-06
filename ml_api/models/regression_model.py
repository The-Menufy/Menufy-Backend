import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

class RegressionModel:
    def __init__(self, dataset_path='data/World_Dishes_Dataset (1).csv'):
        # Load the dataset
        self.df = pd.read_csv(dataset_path)
        
        # Check for required columns
        required_columns = ['Num_Ingredients', 'Preparation_Time_Minutes', 'Cooking_Time_Minutes', 'Calories', 'Average_Ingredient_Calorie']
        for col in required_columns:
            if col not in self.df.columns:
                raise ValueError(f"Missing required column: {col}")

        # Fill missing values in the target column
        self.df['Calories'] = self.df['Calories'].fillna(self.df['Calories'].mean())

        # Selecting relevant features for prediction
        self.feature_names = ['Num_Ingredients', 'Preparation_Time_Minutes', 'Cooking_Time_Minutes', 'Average_Ingredient_Calorie']
        self.features = self.df[self.feature_names]
        self.target = 'Calories'
        self.model = LinearRegression()
        self.scaler = StandardScaler()

        # Ensure the models directory exists
        os.makedirs('models', exist_ok=True)

    def train(self):
        # Scale the features
        X_scaled = self.scaler.fit_transform(self.features)
        y = pd.to_numeric(self.df[self.target], errors='coerce').fillna(self.df[self.target].mean())  # Handle non-numeric values
        
        # Check for NaN in target
        if y.isna().all():
            raise ValueError("No valid calorie data available for training.")
        
        # Train the model
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
        self.model.fit(X_train, y_train)

        # Save the model and scaler
        joblib.dump(self.model, 'models/regression_model.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')

        print("Regression model trained and saved.")

    def predict(self, input_features):
        # Ensure input has 4 elements (pad with default average_ingredient_calorie if needed)
        if len(input_features) < 4:
            input_features = input_features + [50]  # Default Average_Ingredient_Calorie if not provided
        
        # Check if model files exist, train if not
        if not (os.path.exists('models/regression_model.pkl') and os.path.exists('models/scaler.pkl')):
            print("Model files not found. Training a new model...")
            self.train()

        # Load the saved model and scaler
        model = joblib.load('models/regression_model.pkl')
        scaler = joblib.load('models/scaler.pkl')

        # Preprocess the input features as a DataFrame with correct column names
        input_df = pd.DataFrame([input_features], columns=self.feature_names)
        input_scaled = scaler.transform(input_df)

        # Predict the target (calories)
        try:
            prediction = model.predict(input_scaled)
            return prediction[0]  # Return single value
        except Exception as e:
            print(f"Error during prediction: {e}")
            return None