import supabase from "../config/supabaseClient.js";
import { supportedLanguages, translateText } from "../middlewares/translate.js";
import { slugify } from "../utils.js";
import { deletePhoto, uploadPhoto } from "../utils/helpers.js";

// GET all activities
// /
export const getActivities = async (req, res, next) => {
  try {
    const { lang = "en" } = req.query;

    // Get the activities
    const { data, error } = await supabase.from("activities").select("*");
    if (error) throw error;

    // Add the supabase link to the path, and prepare the slug
    var activities = data.map((activity) => {
      const generateUrl = (width, height) => {
        return `${process.env.IMGIX}/${activity.image}?w=${width}&h=${height}&fit=crop&auto=format`;
      };
      return {
        ...activity,
        image: generateUrl(500, 500),
        // image: `${process.env.SUPABASE_IMAGE}${activity.image}`,
        slug: "activities/" + slugify(activity.title),
      };
    });

    if (lang !== "en") {
      const translatedActivities = await Promise.all(
        activities.map(async (activity) => {
          const { data: transRequest, error: transError } = await supabase
            .from("activities_translation")
            .select("title")
            .eq("language", lang)
            .eq("activity_id", activity.id)
            .single(); // ensures one row

          if (transError) {
            console.log(
              "unable to find activity translation in " + lang + " for " + activity.title
            );
            return activity; // fallback to original
          }

          return {
            ...activity,
            title: transRequest?.title || activity.title,
          };
        })
      );

      activities = translatedActivities;
    }

    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// Get the translation of a particular activity ID
// /translation/:activityID
export const getActivityTranslation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = "en" } = req.query;

    const { data, error } = await supabase
      .from("activities_translation")
      .select("*")
      .eq("activity_id", id)
      .eq("language", lang)
      .single();
    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Get the data particular activity ID
// /data/:activityID
export const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("activities").select("*").eq("id", id).single();
    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET the activity id of a named activity
// /:activityName
export const getActivityIdByName = async (req, res, next) => {
  try {
    const { activityName } = req.params;
    const { data, error } = await supabase
      .from("activities")
      .select("id")
      .eq("title", activityName)
      .single();

    if (error) {
      // This function will get called for other parts of the website that aren't related to activities
      res.json("No activity found by the name of: ", activityName);
    } else {
      // If there is no error, then return the activity ID
      res.json(data);
    }
  } catch (err) {
    next(err);
  }
};

// POST a new activity
// /
// Body: title, image, image
export const addActivity = async (req, res, next) => {
  try {
    const { title, imageUrl } = req.body;
    const file = req.file;

    // Image is required
    if (!file) return res.status(400).json({ error: "No image uploaded" });

    // Upload photo
    await uploadPhoto(imageUrl, file);

    // Create the table
    const { data, error } = await supabase
      .from("activities")
      .insert({ title: title, image: imageUrl })
      .select()
      .single();

    if (error) throw error;

    // Translate and upload data to the database.
    for (const language of supportedLanguages) {
      const [transTitle] = await Promise.all([translateText(title, language)]);

      console.log(data.id);
      const { data: transData, error: transError } = await supabase
        .from("activities_translation")
        .insert({
          activity_id: data.id,
          language,
          title: transTitle,
        })
        .select();
      if (transError) {
        console.log(transError);
        throw transError;
      }
      if (transData) {
        console.log("Translation data saved.");
      }
    }

    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
};

// PUT an activity
// /:id
// Body: title, imageUrl
export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, imageUrl } = req.body;
    const image = req.file;
    const { lang = "en" } = req.query;

    if (image && imageUrl) {
      // Get the current photo
      const { data: existingPhoto } = await supabase
        .from("activities")
        .select("image")
        .eq("id", id)
        .single();

      // If there was one, delete it and upload the new photo
      if (existingPhoto.image) await deletePhoto(existingPhoto.image);
      await uploadPhoto(imageUrl, image);
    }

    // Update the row in the database
    let updatedData;
    if (lang == "en") {
      const { data, error } = await supabase
        .from("activities")
        .update({ title, image: imageUrl })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      updatedData = data;
    } else {
      // If the language isn't english, update the translation table instead.
      const { data, error } = await supabase
        .from("activities_translation")
        .update({ title })
        .eq("language", lang)
        .eq("activity_id", id)
        .select()
        .single();
      if (error) throw error;
      updatedData = data;
    }

    res.status(200).send(updatedData);
  } catch (err) {
    next(err);
  }
};

// DELETE an activity
// /:id
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the file path of the image
    const { data: filePathRequest } = await supabase
      .from("activities")
      .select("image")
      .eq("id", id)
      .single();

    // Delete the row in the table
    const { count, deleteRowError } = await supabase
      .from("activities")
      .delete({ count: "exact" })
      .eq("id", id);
    if (deleteRowError) throw deleteRowError;

    // Check for FK constraints
    if (count == null) {
      return res.status(409).json({
        message: "Activity could not be deleted. It may be referenced by other records.",
      });
    }

    // Delete the photo
    await deletePhoto(filePathRequest.image);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
