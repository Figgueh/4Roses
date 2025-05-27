// import Imgix from "react-imgix";
// import supabase from "connection/client";

// const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

// async function listAllImages() {
//   const { data, error } = await supabase.storage.from("images").list("");

//   if (error) {
//     console.error("Error listing files:", error.message);
//     return [];
//   }

//   const fileNames = data.map((file) => file.name);
//   return fileNames;
// }

// listAllImages().then((images) => {
//   const matcher = images.match("^(.*)_(\\d+)x(\\d+)\\.(.+)$");

//   const path = matcher[1];
//   const width = Number.parseInt(matcher[2], 10);
//   const height = Number.parseInt(matcher[3], 10);
//   const extension = matcher[4];

//   console.log(path, width, height, extension);

//   return {
//     src: imageLink(path, width, height, width, extension),
//     width,
//     height,
//     srcSet: breakpoints.map((breakpoint) => ({
//       src: imageLink(path, width, height, breakpoint, extension),
//       width: breakpoint,
//       height: Math.round((height / width) * breakpoint),
//     })),
//   };
// });

// const photos = [];

// function imageLink(path, width, height, size, extension) {
//   const src = "https://fignet.imgix.net/" + path + extension;
//   return <Imgix src={src} width={width} height={height} />;
// }

// export default photos;
