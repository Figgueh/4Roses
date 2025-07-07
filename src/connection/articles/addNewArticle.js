import supabase from "connection/client";

export const addNewArticle = async (activityId, url, title, content, image, description) => {
  if (content == null)
    content = {
      title: "",
      content: "",
      detail: "",
    };
  if (url == null) url = " ";
  if (image == null) image = " ";
  if (description == null) description = " ";

  const { data, error } = await supabase.from("articles").insert({
    activity_id: activityId,
    url: url,
    title: title,
    content: [content],
    image: image,
    description: description,
  });
  if (error) console.error("Error adding new article:", error);
  else return data;
};
