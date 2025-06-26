import supabase from "connection/client";

export const fetchActivitiesIdByName = async (activityName) => {
  const { data, error } = await supabase
    .from("activities")
    .select("id")
    .eq("title", activityName)
    .single();
  if (error) console.error("Error fetching data:", error);
  else return data?.id;
};
