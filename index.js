const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const {
  GridFsStorage
} = require("multer-gridfs-storage");


mongoose.set('strictQuery', false);
const mongoURI=`mongodb+srv://${username}:${password}@bhavya.k6nfals.mongodb.net/?retryWrites=true&w=majority`
try {
  mongoose.connect(mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
} catch (error) {
  handleError(error);
}
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});

//creating bucket
let bucket;
mongoose.connection.on("connected", () => {
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "newBucket"
  });
//   console.log(bucket);
});

//to parse json content
app.use(express.json());
//to parse body from url
app.use(express.urlencoded({
  extended: false
}));

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
 
  const uploaded_files = await bucket.find({}).toArray((err,files)=>{
    return res.render("Home",{files,files});
    // console.log(files);
  });

});



const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "newBucket"
        };
        resolve(fileInfo);
      });
    }
  });
  
  const upload = multer({
    storage
  });
  
  app.post("/upload", upload.any(), (req, res) => {
    res.status(200)
      .redirect("/");
  });



app.get("/fileinfo/:filename", (req, res) => {
    console.log('ye');
    const file = bucket
      .find({
        filename: req.params.filename
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404)
            .json({
              err: "no files exist"
            });
        }
        bucket.openDownloadStreamByName(req.params.filename).pipe(res);
      });
      // res.send("Downloading...");
});


app.get('/files',async function(req,res){
   
    
})
  
const PORT = 1000;

app.listen(PORT, () => {
    console.log(`Application live on localhost:{process.env.PORT}`);
});