import supabase from "../config/supabaseClient.js";
import { supportedLanguages, translateText } from "../middlewares/translate.js";
import { deletePhoto, uploadPhoto } from "../utils/helpers.js";

// GET all the amenities
// /
export const getAllAmenities = async (req, res, next) => {
  try {
    const { lang = "en" } = req.query;

    const { data: amenitiesRequest, error } = await supabase.from("amenities").select("*");
    if (error) throw error;

    let amenities = amenitiesRequest.map((value) => ({
      ...value,
      image: `${process.env.IMGIX}/amenities/${value.image}?w=150&h=100fit=crop&auto=format`,
    }));

    if (lang != "en") {
      const { data: translationData, error } = await supabase
        .from("amenities_translation")
        .select("*")
        .eq("language", lang);
      if (error) throw error;

      // Merge translations by matching amenities_id
      amenities = amenities.map((amenity) => {
        const translation = translationData.find((t) => t.amenities_id === amenity.id);
        return translation
          ? {
              ...amenity,
              title: translation.title || amenity.title,
              description: translation.description || amenity.description,
            }
          : amenity;
      });
    }

    res.json(amenities);
  } catch (err) {
    next(err);
  }
};

// GET the amenities of the provided value
// /:type -> type can be `big` or `small`
export const getAmenities = async (req, res, next) => {
  try {
    const { lang = "en" } = req.query;
    const { type } = req.params;
    var isSmall;

    if (type == "big") isSmall = false;
    else if (type == "small") isSmall = true;
    else throw new Error("The variable provided isn't correct");

    const { data: amenitiesRequest, error } = await supabase
      .from("amenities")
      .select("*")
      .eq("small", isSmall);
    if (error) throw error;

    var amenities = amenitiesRequest.map((value) => ({
      ...value,
      image: !value.small
        ? `${process.env.IMGIX}/amenities/${value.image}?w=250&h=200&fit=crop&auto=format` // for big
        : `${process.env.IMGIX}/amenities/${value.image}?w=50`, // for small
    }));

    if (lang !== "en") {
      const translatedAmenities = await Promise.all(
        amenities.map(async (amenity) => {
          const { data: transRequest, error: transError } = await supabase
            .from("amenities_translation")
            .select("title, description")
            .eq("language", lang)
            .eq("amenities_id", amenity.id)
            .single(); // ensures one row

          if (transError) {
            console.log("unable to find amenity translation in " + lang);
            return amenity; // fallback to original
          }

          return {
            ...amenity,
            title: transRequest?.title || amenity.title,
            description: transRequest?.description || amenity.description,
          };
        })
      );

      amenities = translatedAmenities;
    }

    res.json(amenities);
  } catch (err) {
    next(err);
  }
};

// POST add to amenities
// /
export const addAmenity = async (req, res, next) => {
  try {
    const { title, description, isSmall } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Upload the image
    await uploadPhoto(`amenities/${file.originalname}`, file);

    const { data, error } = await supabase
      .from("amenities")
      .insert({ title, description, small: isSmall, image: file.originalname })
      .select()
      .single();

    if (error) throw error;

    // Translate and upload data to the database.
    for (const language of supportedLanguages) {
      const [transTitle, transDescription] = await Promise.all([
        translateText(title, language),
        translateText(description, language),
      ]);

      const { data: transData, error: transError } = await supabase
        .from("amenities_translation")
        .insert({
          amenities_id: data.id,
          language,
          title: transTitle,
          description: transDescription,
        })
        .select();
      if (transError) throw transError;
      if (transData) {
        console.log("Translation data saved.");
      }
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// PUT update the specified amenity
// /:id
export const updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, isSmall } = req.body;
    const file = req.file;
    const { lang = "en" } = req.query;

    const updateData = {
      title,
      description,
      small: isSmall === "true", // force boolean
    };

    if (file) {
      // get the current image
      const { data: imageName, error: imageNameError } = await supabase
        .from("amenities")
        .select("image")
        .eq("id", id)
        .single();

      if (imageNameError) throw imageNameError;

      // Switch the photos
      await deletePhoto(imageName.image);
      await uploadPhoto("amenities/" + file.originalname, file);
      updateData.image = `${req.file.filename}`;
    }

    let updatedData;
    if (lang == "en") {
      // upload data to database
      const { data, error } = await supabase
        .from("amenities")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      updatedData = data;
    } else {
      // If the language isn't english, update the translation table instead.
      const { data, error } = await supabase
        .from("amenities_translation")
        .update({ title, description })
        .eq("language", lang)
        .eq("amenities_id", id)
        .select()
        .single();
      if (error) throw error;
      updatedData = data;
    }

    return res.status(201).json(updatedData);
  } catch (err) {
    next(err);
  }
};

// DELETE amenity
// /:id
export const deleteAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the name of the image for the amenity table
    const { data: amenityData, error: amenityError } = await supabase
      .from("amenities")
      .select("image")
      .eq("id", id)
      .single();

    if (amenityError) throw amenityError;
    if (!amenityData) return res.status(404).json({ message: "Amenity not found" });

    // Delete the image.
    if (amenityData.image) {
      const { error: deletePhotoError } = await supabase.storage
        .from("images")
        .remove([`amenities/${amenityData.image}`]);
      if (deletePhotoError) throw deletePhotoError;
    }

    // Delete the row
    const { error: deleteRowError } = await supabase.from("amenities").delete().eq("id", id);
    if (deleteRowError) throw deleteRowError;

    res.status(200).json({ message: "Amenity deleted successfully" });
  } catch (err) {
    next(err);
  }
};
