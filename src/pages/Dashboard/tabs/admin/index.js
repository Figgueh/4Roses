import React, { useState } from "react";
import supabase from "connection/client";

function AdminDash() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");

  async function handleUpload() {
    if (!file) return alert("Choose file");

    const dimensions = await getImageDimensions(file);

    const fileExt = file.name.split(".").pop();
    const fileName = file.name.split(".").slice(0, -1);
    const newFileName = `${fileName}_${dimensions.width}x${dimensions.height}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(`interior/${newFileName}`, file);

    if (error) return console.error(error);
    console.log(data);

    const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
    await supabase.from("image_metadata").insert({ name, url: publicUrl });

    setFile(null);
    setName("");
  }

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        resolve({
          width: this.naturalWidth,
          height: this.naturalHeight,
        });
        URL.revokeObjectURL(this.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

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
    </div>
  );
}

export default AdminDash;
