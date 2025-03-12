import os
from os.path import isfile, join
from PIL import Image 

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
        imports.append([file, str(round(width / 4)), str(round(height / 4))])

# Print for the imports.
for thing in imports:
    print("import " + thing[0][:-4].capitalize() + " from \"" + url + thing[0] + "\";")


# Print for the photos array.
for thing in imports:
    print("  { src: " + thing[0][:-4].capitalize() + ", width: " + thing[1] +", height: " + thing[2] + " },")





