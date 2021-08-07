const express = require("express");
const alumniApp = express.Router();
const alumni = require("../models/alumni");
const blogs = require("../models/blogs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.set(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0"
    );
    next();
  } else {
    req.flash("error_messages", "Please Login to continue !");
    res.redirect("/login");
  }
}

alumniApp.get("/alumni/viewalumni", checkAuth, async (req, res) => {
  let email = req.user.email;
  try {
    dataOfAlumni = await alumni.find({
      isPending: false,
      // email: { $ne: email },
    });
    console.log(dataOfAlumni);
    res.render("alumniList", { data: dataOfAlumni });
  } catch (e) {
    console.log("Error ", e);
  }
});
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: "173427539828262",
  api_secret: process.env.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "cfg",
      public_id: file.fieldname + "-" + Date.now(),
    };
  },
});
var upload = multer({ storage: storage });
alumniApp.post("/alumni/fillalumni", checkAuth, async (req, res) => {
  console.log("Helloooooo");
  let workExp = req.body.workexp;
  let name = req.user.name;
  let email = req.user.email;
  let phone = req.user.phone;
  let linkedin = req.body.linkedin;
  let twitter = req.body.twitter;
  let organization = req.body.organization;
  let skillset = req.body.skillset;
  let awards_and_honours = req.body.awards_and_honours;
  console.log(workExp);
  const newAlumni = new alumni({
    name,
    email,
    phone,
    workExp,
    linkedin,
    twitter,
    organization,
    skillset,
    awards_and_honours,
  });
  try {
    const suc = await newAlumni.save();
    res.redirect("/alumni/fillalumni");
  } catch (e) {
    console.log("Error ", e);
  }
});

alumniApp.get("/alumni/fillalumni", checkAuth, async (req, res) => {
  const email = req.user.email;
  console.log("Email is ", email);
  data = await alumni.find({ email: email });
  console.log(data);
  if (data.length !== 0) {
    if (data[0]["isPending"] == true) {
      res.render("alumniForm", { status: "pending" });
    } else {
      res.render("alumniForm", { status: "success" });
    }
  } else {
    res.render("alumniForm", { status: "didn't fill" });
  }
});
alumniApp.get("/alumni/getdata", checkAuth, async (req, res) => {
  let email = req.user.email;
  console.log(req.user);
  let name = req.user.name;
  let phone = req.user.phone;
  let designation = req.user.designation;

  //   let name = req.body.name;
  //   let title = req.body.title;
  //   let desc = req.body.desc;

  //   const newBlog = new blogs({
  //     name,
  //     title,
  //     desc,
  //   });
  //   try {
  //     const suc = await newBlog.save();
  //     res.redirect("/alumni/displayblogs");
  //   } catch (e) {
  //     console.log("Error ", e);
  //   }
  data = await alumni.findOne({ email: email });
  if (data != null) {
    console.log("Data is ", data);
    let linkedin = data.linkedin;
    let twitter = data.twitter;
    let organization = data.organization;
    let img_url = data.img_path;
    let workexp = data.workExp;
    let skillset = data.skillset;
    let awards_and_honours = data.awards_and_honours;
    res.render("alumniDetails", {
      email: email,
      name: name,
      phone: phone,
      designation: designation,
      awards_and_honours: awards_and_honours,
      workExp: workexp,
      linkedin: linkedin,
      twitter: twitter,
      organization: organization,
      img_url: img_url,
      skillset: skillset,
      status: "Filled",
    });
  } else {
    res.render("alumniDetails", { status: "Unfilled" });
  }
});

alumniApp.get("/alumni", checkAuth, async (req, res) => {
  var alumnis;
  alumni.find({ isPending: false }, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      alumnis = data;
    }
    res.render("alumniList", { data: alumnis });
  });
});

alumniApp.get("/alumni/addblog", checkAuth, (req, res) => {
  res.render("addblogs");
});
alumniApp.post("/alumni/addblog", checkAuth, async (req, res) => {
  let mail = req.user.email;
  let name = req.user.name;
  let title = req.body.title;
  let desc = req.body.desc;

  const newBlog = new blogs({
    mail,
    name,
    title,
    desc,
  });
  try {
    const suc = await newBlog.save();
    res.redirect("/alumni/getdata");
    // res.redirect("/alumni/displayblogs");
  } catch (e) {
    console.log("Error ", e);
  }
});
alumniApp.get("/alumni/displayblogs", checkAuth, async (req, res) => {
  let email = req.user.email;
  let blogsData = await blogs.find({});
  res.render("displayblogs", { blogsData: blogsData });
});

module.exports = alumniApp;
