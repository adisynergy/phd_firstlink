const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getNextUserId } = require('./Generatnextuser');

const registerUser = async (req, res) => {
    try {
        const { email, fullName, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        // Generate next user ID
        const usernameid = await getNextUserId();

        // Create new user
        const user = await User.create({
            usernameid,
            email,
            fullName,
            password
        });

        // Remove password from response
        const createdUser = await User.findById(user._id).select("-password");

        if (!createdUser) {
            return res.status(500).json({
                message: "Error while registering user"
            });
        }

        // Generate access and refresh tokens
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // Update user's refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return res.status(201).json({
            message: "User registered successfully",
            user: createdUser,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            message: "Error while registering user",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        // Check password
        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Generate access and refresh tokens
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // Update user's refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Remove password from response
        const loggedInUser = await User.findById(user._id).select("-password");

        // Set cookies
        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: "User logged in successfully",
                user: loggedInUser,
                accessToken,
                refreshToken
            });
    } catch (error) {
        return res.status(500).json({
            message: "Error while logging in user",
            error: error.message
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: { refreshToken: 1 }
            },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                message: "User logged out successfully"
            });
    } catch (error) {
        return res.status(500).json({
            message: "Error while logging out user",
            error: error.message
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({
                message: "Refresh token is expired or used"
            });
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const accessToken = await user.generateAccessToken();

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json({
                message: "Access token refreshed",
                accessToken
            });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid refresh token",
            error: error.message
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            message: "User fetched successfully",
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error while fetching user",
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
};
  