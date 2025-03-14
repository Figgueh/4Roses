import os
from os.path import isfile, join
from PIL import Image 

def generateDescription(val):
    roomName = ""
    location = 0
    for char in val:
        if char.isdigit():
            location = val.index(char)
            roomName = val[0 : location]
    
    if roomName == "":
        roomName = val

    if(val[location] == 1 and roomName == "bedroom"):
        return "Master " + roomName
    if(location != 0):
        return roomName + " " + val[location]
    else:
        return roomName

# Get the current location of the file
dir_path = os.path.dirname(os.path.realpath(__file__))

# Get all the files in this directory
files = [f for f in os.listdir(dir_path) if isfile(join(dir_path, f))]
imports = []

url = "assets/images/property/interior/"
for file in files:
    if file != "generateImport.py":
        img = Image.open(dir_path + "\\" + file)
        width,height = img.size
        imports.append([str(file), str(width), str(height)])

        # Generate thumbnails and save them in the folder.
        thumbnailSize = 256
        img.thumbnail((thumbnailSize,thumbnailSize), Image.LANCZOS)
        img.save(dir_path + "/" + str(thumbnailSize) + "/" + file, "JPEG")

# Print for the imports.
for thing in imports:
    print("import " + thing[0][:-4].capitalize() + " from \"" + url + thing[0] + "\";")
    print("import " + thing[0][:-4].capitalize() + "Thumb" + " from \"" + url + str(thumbnailSize) + "/" + thing[0] + "\";")


print("const photos = [")
# Print for the photos array.
for thing in imports:
    photoDescription = generateDescription(thing[0][:-4].capitalize())
    srcSetFull = "      { src: " + thing[0][:-4].capitalize() + ", width: " + thing[1] + ", height: " + thing[2] + " },"
    srcSetTumb = "      { src: " + thing[0][:-4].capitalize() + "Thumb, width: " + str(thumbnailSize) + ", height: " + str(thumbnailSize) + " },"
    print("  {\n    src: " + thing[0][:-4].capitalize() + ",\n    description: \"" + photoDescription + "\",\n    width: " + str(round(int(thing[1]) /4)) +",\n    height: " +  str(round(int(thing[2]) /4)) + ",\n    " + "srcSet: [\n" + srcSetFull + "\n" + srcSetTumb + "\n    ],\n  },")

print("];\nexport default photos;\n")



