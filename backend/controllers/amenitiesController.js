import supabase from "../config/supabaseClient.js";
import { supportedLanguages, translateText } from "../middlewares/translate.js";
import { deletePhoto, uploadPhoto } from "../utils/helpers.js";

// GET all the amenities
// /
export const getAllAmenities = async (req, res, next) => {
  try {
    const { lang = "en" } = req.query;

    const { data: amenitiesRequest, error } = await supabase
      .from("amenities")
      .select("*")
      .order("display_order", { ascending: true });
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

// GET the count of all amenities
// /
export const getCountOfAllAmenities = async (req, res, next) => {
  try {
    const { count, error } = await supabase.from("amenities").select("*", { count: "exact" });
    if (error) throw error;

    res.json(count);
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
      .eq("small", isSmall)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!amenitiesRequest || amenitiesRequest.length === 0) {
      return res.json({ message: "No amenities found." });
    }

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
    const { title, description, isSmall, display_order } = req.body;
    const file = req.file;

    // Clean data
    const cleanedTitle = title.trim();

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Upload the image
    await uploadPhoto(`amenities/${file.originalname}`, file);

    const { data: newData, error } = await supabase
      .from("amenities")
      .insert({
        title: cleanedTitle,
        description,
        small: isSmall,
        image: file.originalname,
        display_order,
      })
      .select()
      .single();

    if (error) throw error;

    // Translate and upload data to the database.
    for (const language of supportedLanguages) {
      const transTitle = await translateText(cleanedTitle, language);

      // Only translate the description if it's provided
      const transDescription = description ? await translateText(description, language) : null;

      const { error: transError } = await supabase
        .from("amenities_translation")
        .insert({
          amenities_id: newData.id,
          language,
          title: transTitle,
          ...(transDescription !== null && { description: transDescription }),
        })
        .select();
      if (transError) throw transError;
    }

    return res.status(201).json(newData);
  } catch (err) {
    next(err);
  }
};

// PUT update the specified amenity
// /:id
export const updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, isSmall, display_order } = req.body;
    const file = req.file;
    const { lang = "en" } = req.query;

    const updateData = {
      title: title.trim(),
      description,
      small: isSmall,
      display_order,
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

    if (lang == "en") {
      // upload data to database
      const { error } = await supabase
        .from("amenities")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
    } else {
      // If the language isn't english, update the translation table instead.
      const { error } = await supabase
        .from("amenities_translation")
        .update({ title: title.trim(), description })
        .eq("language", lang)
        .eq("amenities_id", id)
        .select()
        .single();
      if (error) throw error;
    }

    return res.status(201).json();
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
