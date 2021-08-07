const express = require("express");
var nodemailer = require("nodemailer");
var app = express();
const router = express.Router();
const user = require("../models/user");
const alumni = require("../models/alumni");
const job = require("../models/job");
const blogs = require("../models/blogs");
const email = require("../models/email");
const event = require("../models/event");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const dotenv = require("dotenv");
dotenv.config();
require("./passportLocal")(passport);

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.set(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0"
    );
    next();
  } else {
    req.flash("error_message", "Please login to continue!");
    res.redirect("/login");
  }
}

//suscribe post
router.post("/suscribe", (req, res) => {
  const newEmail = new email({
    email: req.body.email,
  });
  newEmail
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

//MENTOR ROUTES
router.get("/mentor", checkAuth, (req, res) => {
  if (req.user.designation == "Mentor") {
    const user = req.user;
    res.render("mentor", { user: user });
  } else {
    res.redirect("/");
  }
});

router.get("/mentor/schedule", checkAuth, (req, res) => {
  if (req.user.designation == "Mentor") {
    const user = req.user.email;
    res.render("mentor-schedule", { user: user });
  } else {
    res.redirect("/");
  }
});

router.post("/mentor/schedule", checkAuth, (req, res) => {
  if (req.user.designation == "Mentor") {
    var mentee_email = req.user.menteeEmail;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testyashu23@gmail.com",
        pass: process.env.GMAILPASSWORD,
      },
    });
    if (!mentee_email) {
      mentee_email = "user.aishik@gmail.com";
    }
    var mailOptions = {
      from: "testyashu23@gmail.com",
      to: mentee_email,
      subject: "INVITATION FOR MEETING WITH MENTOR",
      text: req.body.query_content,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.redirect("/mentor");
      } else {
        res.redirect("/mentor");
      }
    });
  } else {
    res.redirect("/");
  }
});

router.get("/menteeOfMentor", checkAuth, async (req, res) => {
  if (req.user.designation == "Mentor") {
    mentorEmail = req.user.email;
    mentorData = await user.findOne({ email: mentorEmail });
    console.log("Mentor data ", mentorData);
    if (mentorData["mentorEmail"]) {
      dataOfMentee = await user.findOne({ email: mentorData["menteeEmail"] });
      console.log(dataOfMentee);
      res.render("menteeOfMentor", { data: dataOfMentee });
    } else {
      res.render("menteeOfMentor", { data: "No mentee assigned" });
    }
  } else {
    res.redirect("/");
  }
});

//OTHER ROUTES ---------------------------------------------------------
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index", { logged: true });
  } else {
    res.render("index", { logged: false });
  }
});

//QUERY ROUTES
// router.get("/query", checkAuth, (req, res) => {
//   res.render("query");
// });

router.post("/query", (req, res) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "testyashu23@gmail.com",
      pass: process.env.GMAILPASSWORD,
    },
  });

  var mailOptions = {
    from: "testyashu23@gmail.com",
    to: req.body.email,
    subject: "QUERY FROM WEBSITE FORM",
    text: req.body.query_content,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.redirect("/");
    }
  });
  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const phone = req.body.phone;
  const ageGroup = req.body.ageGroup;
  const designation = req.body.designation;
  const qualification = req.body.qualification;
  const newUser = new user({
    name,
    email,
    password,
    phone,
    ageGroup,
    designation,
    qualification,
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser
        .save()
        .then((user) => {
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res, next) => {
    if (req.user.isAdmin === true) {
      res.redirect("/admin/dashboard");
    }
    if (req.user.designation == "Mentor") {
      res.redirect("/mentor");
    }
    if (req.user.designation == "Alumni") {
      res.redirect("/alumni/getdata");
    } else if (req.user.designation == "Mentee") {
      res.redirect("/mentee/getdata");
    }
  }
);
router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

router.get("/profile", checkAuth, (req, res) => {
  res.render("profile", {
    username: req.user.username,
    verified: req.user.isVerified,
  });
});

// ADMIN ROUTES
router.get("/admin/dashboard", checkAuth, (req, res) => {
  res.render("admin_dashboard");
});

router.post("/admin/broadcast", checkAuth, (req, res) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "testyashu23@gmail.com",
      pass: process.env.GMAILPASSWORD,
    },
  });

  var to = "user.aishik@gmail.com ";

  email.find({}, (err, email) => {
    email.map((email) => {
      to = to + email.email;
      to = to + " ";
    });
  });

  to = to.slice(0, -1);
  var mailOptions = {
    from: "testyashu23@gmail.com",
    to,
    subject: req.body.subject,
    text: req.body.body,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.redirect("/");
    }
  });
  res.redirect("/admin/dashboard");
});

router.get("/admin/new-job", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  res.render("new-job");
});

router.post("/admin/new-job", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  const job_title = req.body.job_title;
  const job_description = req.body.job_description;
  const newJob = new job({
    job_title,
    job_description,
  });
  newJob
    .save()
    .then(() => {
      const accountSid = process.env.as;
      const authToken = process.env.at;
      const client = require("twilio")(accountSid, authToken);
      client.messages
        .create({
          from: "whatsapp:+14155238886",
          body: "NEW JOB POSTED\n" + job_title + " ," + job_description,
          to: "whatsapp:+917003137814",
        })
        .then((message) => {
          console.log(message.sid);
          res.redirect("/admin/view-job");
        })
        .catch((e) => {
          console.log(e);
        });
    })
    .catch((err) => console.log(err));
});

router.get("/admin/view-job", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  var jobs;
  job.find({}, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      jobs = data;
    }
    res.render("jobs", { data: jobs });
  });
});

router.post("/admin/delete-job", (req, res) => {
  const id = req.body.id;
  job.findOneAndRemove({ _id: id }, (err, doc) => {
    res.redirect("/admin/view-job");
  });
});

// EVENTS

router.get("/admin/new-event", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  res.render("new-event");
});

router.post("/admin/new-event", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  const event_title = req.body.event_title;
  const event_description = req.body.event_description;
  const newEvent = new event({
    event_title,
    event_description,
  });
  newEvent
    .save()
    .then(() => {
      //DO THIS FOR EACH USER
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "testyashu23@gmail.com",
          pass: process.env.GMAILPASSWORD,
        },
      });

      var mailOptions = {
        from: "testyashu23@gmail.com",
        to: "user.aishik@gmail.com",
        subject: event_title,
        text: event_description,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.redirect("/");
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.redirect("/admin/view-event");
    })
    .catch((err) => console.log(err));
});

router.get("/admin/view-event", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  var events;
  event.find({}, (err, data) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
    if (data) {
      events = data;
    }
    res.render("events", { data: events });
  });
});
router.post("/admin/delete-event", (req, res) => {
  const id = req.body.id;
  event.findOneAndRemove({ _id: id }, (err, doc) => {
    res.redirect("/admin/view-event");
  });
});

router.get("/admin/job_events", checkAuth, (req, res) => {
  res.render("job_event");
});
// USERS

router.get("/admin/users", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  var users;
  user.find({ isAdmin: false }, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      users = data;
    }
    res.render("admin_users", { data: users });
  });
});
router.get("/admin/pendingAlumni", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  var alumnis;
  alumni.find({ isPending: true }, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      alumnis = data;
    }
    res.render("alumnireq", { data: alumnis });
  });
});
router.post("/admin/delete-user", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  const id = req.body.id;
  user.findOneAndRemove({ _id: id }, (err, doc) => {
    res.redirect("/admin/users");
  });
});

//displaying the mentors and mentees list so that admin can map
router.get("/admin/mentee-mentor", checkAuth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  try {
    dataOfMentee = await user.find({ designation: "Mentee", mentor: false });
  } catch (e1) {
    console.log("Error ", e1);
  }
  try {
    dataOfMentor = await user.find({ designation: "Mentor", mentee: false });
  } catch (e2) {
    console.log("Error ", e2);
  }
  res.render("dashboard", {
    dataOfMentee: dataOfMentee,
    dataOfMentor: dataOfMentor,
  });
});

router.post("/admin/mentee-mentor", checkAuth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  let mentorEmail = req.body.mentorEmail;
  let menteeEmail = req.body.menteeEmail;
  try {
    let suc1 = await user.updateOne(
      { email: mentorEmail },
      { $set: { menteeEmail: menteeEmail, mentee: true } }
    );
  } catch (e1) {
    console.log("error ", e1);
  }
  try {
    let suc2 = await user.updateOne(
      { email: menteeEmail },
      { $set: { mentorEmail: mentorEmail, mentor: true } }
    );
  } catch (e2) {
    console.log("error ", e2);
  }
  res.redirect("/admin/dashboard");
});

router.get("/admin/addMentor", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  res.render("addmentor");
});
router.post("/admin/addMentor", checkAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const phone = req.body.phone;
  const ageGroup = "18+";
  const designation = "Mentor";
  const zoomURL = req.body.zoomLink;
  const newUser = new user({
    name,
    email,
    phone,
    designation,
    password,
    ageGroup,
    zoomURL,
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser
        .save()
        .then((user) => {
          res.redirect("/admin/addMentor");
        })
        .catch((err) => console.log(err));
    });
  });
});
router.get("/admin/verifyAlumni", checkAuth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  try {
    data = await alumni.find({ isPending: true });
    res.render("verifyAlumni", { data: data });
  } catch (e) {
    console.log("Error ", e);
  }
});

router.get("/mentee/getMentorDetails", checkAuth, async (req, res) => {
  if (req.user.isAdmin) {
    return res.redirect("/");
  }
  menteeEmail = req.user.email;
  menteeData = await user.findOne({ email: menteeEmail });
  console.log("Mentee data ", menteeData);
  if (menteeData["mentorEmail"]) {
    dataOfMentor = await user.findOne({ email: menteeData["mentorEmail"] });
    console.log(dataOfMentor);
    res.render("menteeDashboard", { data: dataOfMentor });
  } else {
    res.render("menteeDashboard", { data: "No mentor" });
  }
});
router.get("/mentee/getdata", checkAuth, (req, res) => {
  menteeData = req.user;
  res.render("menteedetails", { data: menteeData });
});
router.post("/admin/verifyAlumni", checkAuth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect("/");
  }
  // try {
  //   const suc = await alumni.updateMany(
  //     { isPending: true },
  //     { $set: { isPending: false } }
  //   );
  // } catch (e) {
  //   console.log("Error ", e);
  // }
  phone = req.body.phone;
  console.log("Phone is ", phone);

  const suc = await alumni.updateOne(
    { phone: phone },
    { $set: { isPending: false } }
  );
  phoneno = +phone;
  const accountSid = process.env.accountSid;
  const authToken = process.env.authToken;
  const client = require("twilio")(accountSid, authToken);
  console.log(phoneno);
  client.messages
    .create({
      body: "Your Alumni account has been verified by our team, Welcome!",
      from: "+1 508 507 2714",
      to: `+91${phoneno}`,
    })
    .then((message) => console.log(message.sid));
  res.redirect("/admin/pendingAlumni");
});

router.get("/mm-hub", checkAuth, (req, res) => {
  console.log(req.user.designation);
  res.render("mm-hub", {des: req.user.designation});
});
router.get("/mm-job", checkAuth, (req, res) => {
  var jobs;
  job.find({}, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      jobs = data;
    }
    res.render("mm-job", { data: jobs });
  });
});
router.get("/mm-event", checkAuth, (req, res) => {
  var events;
  event.find({}, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      events = data;
    }
    res.render("mm-event", { data: events });
  });
});
router.get("/mm-blog", checkAuth, (req, res) => {
  var blog;
  blogs.find({}, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      blog = data;
    }
    res.render("mm-blog", { data: blog });
  });
});
router.use(require("./userRoutes"));
router.use(require("./alumniRoutes"));
module.exports = router;
