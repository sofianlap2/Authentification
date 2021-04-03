const router = require("express").Router();
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

//REGISTER
router.post("/",async(req,res)=> {
    try {
        const {email, password, passwordVerify} = req.body;

        //Validation
        if( !email || !password || !passwordVerify){
            return res.status(400).json({
                errorMessage: "Please enter all required fields"
            })
        };
        if(password.length < 6) {
            return res.status(400).json({
                errorMessage: "Please enter at least 6 characters"
            })      
        };
        if(password !== passwordVerify){
            return res.status(400).json({
                errorMessage: "Please enter the same password"
            });
        };
        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(400).json({
                errorMessage: "An account has already been created with this email"
            }); 
        };

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        //save a new user account to DB

        const newUser = new User({
            email,
            passwordHash
        });

        const savedUser = await newUser.save();

        //log the user in
        const token = jwt.sign(
            {user: savedUser._id}, process.env.JWT_SECRET
            );
        //send the token in cookie
        res.cookie("token", token, {
            httpOnly:true, 
        }).send();

    } catch (err) {
        console.error(err)
        res.status(500).send();
    }
});

//LOGIN
router.post("/login", async (req,res)=> {
    try {
        const {email, password} = req.body;
        //validate
        if( !email || !password){
            return res.status(400).json({
                errorMessage: "Please enter all required fields"
            })
        };
        const existingUser = await User.findOne({email});

        if(!existingUser){
            return res.status(401)
            .json({errorMessage: "Wrong email or password."});
        };
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if(!passwordCorrect){
            return res.status(401)
            .json({errorMessage: "Wrong email or password."});
        };
        //log the user in
        const token = jwt.sign(
            {user: existingUser._id}, process.env.JWT_SECRET
            );
        //send the token in cookie
        res.cookie("token", token, {
            httpOnly:true, 
        }).send();

    } catch (err) {
        console.error(err)
        res.status(500).send();
    }
});

//logout
router.get('/logout',(req,res)=> {
    res.cookie("token", "", {
        httpOnly:true,
        expires: new Date(0)
    }).send();;
})

//PRIVATE
router.get("/loggedIn", (req,res)=> {
    
        try {
            const token = req.cookies.token;
            if(!token) {
                return res.json(false)
            }
            jwt.verify(token, process.env.JWT_SECRET)
            res.send(true)
            next()
        } catch (err) {
            console.error(err);
            res.json(false);
        }
    }
)



module.exports = router;