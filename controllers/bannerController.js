import { v4 as uuidv4 } from 'uuid';
import Banner from '../models/Banner.js';


// ADD BANNERS API

export const addBanners = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }
    const uploadedImages = req.files.map((file) => ({
      _id: uuidv4(),
      url: file.path
    }));

    let banner = await Banner.findOne();
    if (banner) {
      banner.images.push(...uploadedImages);
      await banner.save();
    } else {

      banner = await Banner.create({
        images: uploadedImages
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Banner images uploaded',
      data: banner.images
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};



// GET BANNERS API

export const getBanners = async (req, res) => {
  try {
    const banner = await Banner.findOne();
    return res.status(200).json({
      success: true,
      message: 'Banners fetched',
      data: banner?.images || []
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};



// DELETE BANNER API

export const deleteBanners = async (req, res) => {
  try {

    const { id } = req.params;

    const banner = await Banner.findOne();

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'No banners found'
      });
    }

    const initialLength = banner.images.length;

    banner.images = banner.images.filter(
      (img) => img._id !== id
    );

    if (banner.images.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Banner image not found'
      });
    }

    await banner.save();

    return res.status(200).json({
      success: true,
      message: 'Banner deleted',
      data: banner.images
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};