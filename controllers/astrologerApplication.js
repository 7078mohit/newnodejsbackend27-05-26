import Astrologer from '../models/AstrologerApplication.js';




// Generate Random EID 
const generateEID = () => `KALP${Math.floor(1000 + Math.random() * 9000)}`;

// Generate Random Password 
const generatePassword = () => Math.random().toString().slice(2, 14);


// ─── CREATE ASTROLOGER (Register) ─────────────────────────────
export const createAstrologer = async (req, res) => {
  try {
    const {
      name, age, gender, state, district, city, address,
      speciality, salary, phoneNumber, alternativeNumber,
      email, experience, availability
    } = req.body;

    const files = req.files || [];

    const getUrl = (file) => file?.path || file?.secure_url || file?.url || null;

    const findByName = (keywords = []) => {
      const kw = keywords.map(k => k.toLowerCase());
      return files.find(f => {
        if (f.fieldname && kw.includes(f.fieldname.toLowerCase())) return true;
        const on = (f.originalname || "").toLowerCase();
        return kw.some(k => on.includes(k));
      });
    };

    const profileFile = findByName(["profile", "profilephoto"]);
    const adharFile = findByName(["adhar", "aadhar"]);
    const panFile = findByName(["pan"]);
    const bankFile = findByName(["bank"]);

    const profilePhoto = getUrl(profileFile);
    const adharCard = getUrl(adharFile);
    const panCard = getUrl(panFile);
    const bankDocument = getUrl(bankFile);

    let parsedAvailability = {};
    if (availability) {
      parsedAvailability =
        typeof availability === "string"
          ? JSON.parse(availability)
          : availability;
    }

    const newAstrologer = await Astrologer.create({
      eid: generateEID(),
      password: generatePassword(),
      name,
      age,
      gender,
      state,
      district,
      city,
      address,
      speciality,
      salary,
      phoneNumber,
      alternativeNumber,
      email,
      experience,
      availability: parsedAvailability,
      profilePhoto,
      bankDocument,
      adharCard,
      panCard
    });

    return res.status(201).json({
      success: true,
      message: "Astrologer registered successfully",
      data: newAstrologer
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// ─── GET ALL ASTROLOGERS ─────────────────────────────
export const getAllAstrologers = async (req, res) => {
  try {
    const data = await Astrologer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ─── GET ASTROLOGER BY ID ─────────────────────────────
export const getAstrologer = async (req, res) => {
  try {
    const data = await Astrologer.findById(req.params.id);

    if (!data)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ─── UPDATE ASTROLOGER ─────────────────────────────
export const updateAstrologer = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // files update
    if (req.files?.profilePhoto)
      updateData.profilePhoto = req.files.profilePhoto[0].path;

    if (req.files?.bankDocument)
      updateData.bankDocument = req.files.bankDocument[0].path;

    if (req.files?.adharCard)
      updateData.adharCard = req.files.adharCard[0].path;

    if (req.files?.panCard)
      updateData.panCard = req.files.panCard[0].path;

    if (updateData.availability) {
      updateData.availability = JSON.parse(updateData.availability);
    }

    const updated = await Astrologer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ─── DELETE ASTROLOGER ─────────────────────────────
export const deleteAstrologer = async (req, res) => {
  try {
    await Astrologer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Astrologer deleted"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};