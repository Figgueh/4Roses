import React, { useState, useEffect } from "react";
import supabase from "connection/client";

function AdminDash() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");

  // Load images
  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    const { data, error } = await supabase
      .from("image_metadata")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setImages(data);
  }

  // Upload image and store metadata
  async function handleUpload() {
    if (!file || !name) return alert("Choose file and name");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("images").upload(fileName, file);

    if (error) return console.error(error);
    console.log(data);

    const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
    await supabase.from("image_metadata").insert({ name, url: publicUrl });

    setFile(null);
    setName("");
    fetchImages();
  }

  // Delete image and metadata
  async function handleDelete(id, url) {
    const filePath = url.split("/").pop();
    await supabase.storage.from("images").remove([filePath]);
    await supabase.from("image_metadata").delete().eq("id", id);
    fetchImages();
  }
  return (
    <div>
      <h2>Image CRUD</h2>
      <input
        type="text"
        placeholder="Image name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 20 }}>
        {images.map((img) => (
          <div key={img.id} style={{ margin: 10, border: "1px solid #ccc", padding: 10 }}>
            <img
              src={img.url}
              alt={img.name}
              style={{ width: 150, height: 150, objectFit: "cover" }}
            />
            <p>{img.name}</p>
            <button onClick={() => handleDelete(img.id, img.url)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDash;
