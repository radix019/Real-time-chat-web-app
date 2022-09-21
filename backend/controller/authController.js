const formidable = require("formidable");
const validator = require("validator");
const registerModel = require("../models/authModel");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.userRegister = (req, res) => {
  const form = formidable();
  form.parse(req, async (err, fields, file) => {
    const { userName, email, password, confirmPassword } = fields;
    const { image } = file;
    const error = [];
    if (!userName) {
      error.push("Please provide your userName");
    }
    if (!email) {
      error.push("Please provide your Email");
    }
    if (email && !validator.isEmail(email)) {
      error.push("Please provide the valid email");
    }
    if (!password) {
      error.push("Please provide the password");
    }
    if (!confirmPassword) {
      error.push("Please provide the confirm password ");
    }
    if (password && confirmPassword && password !== confirmPassword) {
      error.push("Your password and confirm password does not match");
    }
    if (password && password.length < 6) {
      error.push("Please provide password must be 6 characters");
    }
    if (Object.keys(file).length === 0) {
      error.push("Please provide user image");
    }
    if (error.length > 0) {
      res.status(400).json({
        error: {
          errorMessage: error,
        },
      });
    } else {
      const getImageName = file.image.originalFilename;
      const randNumber = Math.floor(Math.random() * 9999);
      const newImageName = randNumber + getImageName;
      file.image.originalFilename = newImageName;
      const newPath =
        __dirname +
        `../../../frontend/public/image/${file.image.originalFilename}`;
      // console.log("__dirname>>>>>>>>>>>>>>>>>>>>>", __dirname);
      try {
        const checkUser = await registerModel.findOne({ email: email });
        if (checkUser) {
          res.status(404).json({
            error: {
              errorMessage: ["Your Email already exists"],
            },
          });
        } else {
          // console.log(
          //   "file.image.filepath",
          //   file.image.filepath,
          //   "newPath",
          //   newPath
          // );
          fs.copyFile(file.image.filepath, newPath, async (error) => {
            if (!error) {
              const userCreate = await registerModel.create({
                userName,
                email,
                password: await bcrypt.hash(password, 10),
                image: file.image.originalFilename,
              });

              const token = jwt.sign(
                {
                  id: userCreate._id,
                  userName: userCreate.userName,
                  email: userCreate.email,
                  image: userCreate.image,
                  registerTime: userCreate.cretaedAt,
                },
                process.env.SECRET,
                { expiresIn: process.env.TOKEN_EXP }
              );
              console.log("TOKEN IS ", token);
              console.log("Registration successfully", userCreate);
              const options = {
                expires: new Date(
                  Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000
                ),
              };
              res.status(201).cookie("authToken", token, options).json({
                successMessage: "Your Registration is successfull",
                token,
              });
              //res.send(userCreate);
            } else {
              res.status(500).json({
                error: {
                  errorMessage: ["Internal Server Error"],
                },
              });
            }
          });
        }
      } catch (error) {
        res.status(500).json({
          error: {
            errorMessage: ["Internal Server Error"],
          },
        });
      }
    }
  }); //end Fromidable
};

module.exports.userLogin = async (req, res) => {
  const error = [];
  const { email, password } = req.body;
  if (!email) {
    error.push("Please provide your Email");
  }
  if (!password) {
    error.push("Please provide your Passowrd");
  }
  if (email && !validator.isEmail(email)) {
    error.push("Please provide your Valid Email");
  }
  if (error.length > 0) {
    res.status(400).json({
      error: {
        errorMessage: error,
      },
    });
  } else {
    try {
      const checkUser = await registerModel
        .findOne({ email: email })
        .select("+password");

      if (checkUser) {
        const matchPassword = await bcrypt.compare(
          password,
          checkUser.password
        );
        if (matchPassword) {
          const token = jwt.sign(
            {
              id: checkUser._id,
              userName: checkUser.userName,
              email: checkUser.email,
              image: checkUser.image,
              registerTime: checkUser.cretaedAt,
            },
            process.env.SECRET,
            { expiresIn: process.env.TOKEN_EXP }
          );

          const options = {
            expires: new Date(
              Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000
            ),
          };
          res.status(200).cookie("authToken", token, options).json({
            successMessage: "Your Login is successfull",
            token,
          });
        } else {
          res.status(400).json({
            error: {
              errorMessage: ["Your password is not valid"],
            },
          });
        }
      } else {
        res.status(400).json({
          error: {
            errorMessage: ["Your Email not found"],
          },
        });
      }
      // console.log("checkUser", checkUser);
    } catch (error) {
      res.status(404).json({
        error: {
          errorMessage: ["Internal Server Error"],
        },
      });
    }
  }
};
