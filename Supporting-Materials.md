### saveAll + supporting materials

we have added a `saveAll` method to the editor. The purpose of which is to allow the editor to send it's entire data model to the server.

This isn't a great fit for supporting materials, because we are dealing with assets which need to update the db aswell as uploading the content.

so as an example: 
- a user creates a html based supporting material.
- a user uploads an image called 'dog.jpg'

When this image is uploaded - the server will do 2 things: 
- put the image on s3
- update the db with a reference to the file: 'dog.jpg'.

So if we call saveAll - there is a risk that the json that we send up may overwrite the file reference aka we'd be dependent on the client not to screw up the data model, when really the data model doesn't need to be updated at this point.
The server already took care of it.

so the options are: 

* allow saveAll to continue as is and make sure that the client doesn't send in out of synch data
* in saveAll ignore supporting materials - and add add the specific endpoints for updating supporting materials


### ability to rename a supporting material

Example: 

* user creates a new material called 'my-material' of type 'Rubric' and selects to upload a file 'img.png' as it's content.
* user then chooses this material and renames it to 'my-other-material'.

When the material was created - the file was uploaded to: `/:itemId/:version/materials/my-material/img.png` - a name based key.
If we rename the material - the key the app uses to access the asset will change but the asset won't be in that location.
It'll try: `/:itemId/:version/materials/my-other-material/img.png`.

Options: 

* On rename - copy the assets in s3, not ideal
* Give each material an id that will never change - and store the asset using an id based key.
* Don't allow renaming of supporting materials for now. Only add/delete.

Assigning an id is probably the option that gives us the most flexibility, and it looks ben had started down that route, however there's more to do... we'll need to write a migration script for mongo and s3. This script will have to: 

* assign a unique id to every supporting material if needed.
* move the asset from it's name based key in s3 to the material id based key eg:  /:itemId/:version/materials/:name/:filename -> /:itemId/:version/materials/:materialId/:filename
* for v1 support update the storageKey

From what I count on the prod db there are 8014 items with supporting materials, ~1000 of which don't have a material id for each material. And all of them use the name based key in s3 so they'll all need to move.

### An example from prod

As an example look at this item: 

Id: 
    
    503f7cece4b02288e5f0ebb8:0

Json: 

    [
        {
            "_id" : ObjectId("556ddf08e4b0e0126623ba1c"),
            "name" : "Scoring Guide",
            "files" : [ 
                {
                    "_t" : "org.corespring.platform.core.models.item.resource.VirtualFile",
                    "name" : "G6.1.4.ScoreGuide.html",
                    "contentType" : "text/html",
                    "isMain" : true,
                    "content" : "<html><body><img src=\"G6.1.4.ScoreGuidea.png\"/></body>\n</html>"
                }, 
                {
                    "_t" : "org.corespring.platform.core.models.item.resource.StoredFile",
                    "name" : "G6.1.4.ScoreGuidea.png",
                    "contentType" : "image/png",
                    "isMain" : false,
                    "storageKey" : "503f7cece4b02288e5f0ebb8/0/materials/Scoring Guide/G6.1.4.ScoreGuidea.png"
                }
            ]
        }
    ]

S3:

    aws s3 ls "s3://corespring-assets-production/503f7cece4b02288e5f0ebb8/0/materials/Scoring Guide/"
    >> 2013-07-23 09:15:54      10449 G6.1.4.ScoreGuidea.png

This item does have an id for the supporting material (`556ddf08e4b0e0126623ba1c`) but the asset `G6.1.4.ScoreGuidea.png` is stored using the name based key.
So to fix this item we'd have to (as above):

* ~~assign id to material~~ - not needed for this item.
* move the asset from: `503f7cece4b02288e5f0ebb8/0/materials/Scoring Guide/G6.1.4.ScoreGuidea.png` -> `503f7cece4b02288e5f0ebb8/0/materials/556ddf08e4b0e0126623ba1c/G6.1.4.ScoreGuidea.png`
* update the storageKey for v1 support.

