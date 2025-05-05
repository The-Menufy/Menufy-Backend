const { default: mongoose } = require("mongoose");

const restaurant1Id = new mongoose.Types.ObjectId();
const restaurant2Id = new mongoose.Types.ObjectId();
const restaurant3Id = new mongoose.Types.ObjectId();

const restaurants = [
  {
    _id: restaurant1Id,
    nameRes: "Le Petit Bistro",
    address: "789 Rue Saint-Denis, Montreal, QC",
    cuisineType: "French",
    taxeTPS: 5.0,
    taxeTVQ: 9.975,
    color: "#FF5733",
    logo: "https://example.com/logos/lepetitbistro.png",
    promotion: "Happy Hour 4-7PM",
    payCashMethod: true,
    images: [
      "https://example.com/images/bistro1.jpg",
      "https://example.com/images/bistro2.jpg",
    ],
  },
  {
    _id: restaurant2Id,
    nameRes: "Sushi Master",
    address: "123 Rue Sainte-Catherine, Montreal, QC",
    cuisineType: "Japanese",
    taxeTPS: 5.0,
    taxeTVQ: 9.975,
    color: "#3366FF",
    logo: "https://example.com/logos/sushimaster.png",
    promotion: "All You Can Eat Tuesday",
    payCashMethod: true,
    images: [
      "https://example.com/images/sushi1.jpg",
      "https://example.com/images/sushi2.jpg",
    ],
  },
  {
    _id: restaurant3Id,
    nameRes: "Pizza Paradise",
    address: "456 Boulevard Saint-Laurent, Montreal, QC",
    cuisineType: "Italian",
    taxeTPS: 5.0,
    taxeTVQ: 9.975,
    color: "#33CC33",
    logo: "https://example.com/logos/pizzaparadise.png",
    promotion: "Family Sunday - 20% OFF",
    payCashMethod: true,
    images: [
      "https://example.com/images/pizza1.jpg",
      "https://example.com/images/pizza2.jpg",
    ],
  },
];

module.exports = {
  restaurants,
  restaurant1Id,
  restaurant2Id,
  restaurant3Id,
};
