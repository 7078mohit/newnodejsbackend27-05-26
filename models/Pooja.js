import mongoose from "mongoose";

const poojaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    enquiryBtn: {
      type: String,
      default: "Enquire Now",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Pooja", poojaSchema);