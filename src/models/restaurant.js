 
 const mongoose = require("mongoose");
 const { Schema } = mongoose;
 
 const restaurantSchema = new Schema(
   {
     nameRes: {
       type: String,
       required: true,
       trim: true,
     },
     address: {
       type: String,
       required: true,
       trim: true,
     },
     cuisineType: {
       type: String,
       required: true,
       trim: true,
     },
     taxeTPS: {
       type: Number,
       required: true,
     },
     taxeTVQ: {
       type: Number,
       required: true,
     },
     color: {
       type: String,
       required: false,
     },
     logo: {
       type: String, // Stockage de l'URL du logo
       required: false,
     },
     promotion: {
       type: String,
       required: false,
     },
     payCashMethod: {
       type: Boolean,
       default: true, // Par défaut, le paiement en espèces est autorisé
     },
     images: [
       {
         type: String, // Liste d'URL d'images
       },
     ],
     menu: {
       type: Schema.Types.ObjectId,
       ref: "Menu", // Référence au modèle Menu
       required: false,
     },
   },
   { timestamps: true } // Ajoute createdAt et updatedAt automatiquement
 );
 
 module.exports = mongoose.model("Restaurant", restaurantSchema);
 